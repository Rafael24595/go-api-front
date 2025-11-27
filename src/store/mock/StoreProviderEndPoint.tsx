import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { emptyItemEndPoint, ItemEndPoint, LiteEndPoint } from "../../interfaces/mock/EndPoint";
import { useStoreCache } from "../StoreProviderCache";
import { CacheEndPointStore, CacheEndPointFocus } from "../../interfaces/mock/Cache";
import { useStoreSession } from "../system/StoreProviderSession";
import { emptyItemResponse, ItemResponse, resolveResponses, removeResponse as removeResponseFromList, fixResponses } from "../../interfaces/mock/Response";
import { deepClone, generateHash } from "../../services/Utils";
import { UserData } from "../../interfaces/system/UserData";
import { Optional } from "../../types/Optional";
import { findEndPoint, findMetrics, insertEndPoint } from "../../services/api/ServiceStorage";
import { CACHE_CATEGORY_FOCUS } from "../Constants";
import { useStoreMock } from "./StoreProviderMock";
import { emptyMetrics, Metrics } from "../../interfaces/mock/Metrics";

interface StoreProviderEndPointType {
    endPoint: ItemEndPoint;
    response: ItemResponse;
    metrics: Metrics;
    event: EventAction;

    newEndPoint: () => void;
    fetchEndPoint: (endPoint: LiteEndPoint) => Promise<void>;
    injectEndPoint: (endPoint: ItemEndPoint) => void;
    releaseEndPoint: (endPoint?: ItemEndPoint) => Promise<void>;
    discardEndPoint: (endPoint?: ItemEndPoint | LiteEndPoint) => void;
    fetchMetrics: () => Promise<void>;

    renameEndPoint: (endPoint?: ItemEndPoint) => { endPoint: ItemEndPoint, ok: boolean };
    updateStatus: (status: boolean) => void;
    switchSafe: () => void;
    updateMethod: (method: string) => void;
    updatePath: (path: string) => void;

    newResponse: () => boolean;
    defineResponse: (response: ItemResponse) => void;
    resolveResponse: (response: ItemResponse, rename?: boolean) => boolean;
    removeResponse: (response: ItemResponse) => void;
    orderResponses: (responses: ItemResponse[]) => void;

    isFocused: (endPoint: LiteEndPoint) => boolean;
    isModified: () => boolean;
    isCached: (endPoint: LiteEndPoint) => boolean;
    cacheLenght: () => number;
    cacheComments: () => string[];
}

interface PayloadData {
    initialHash: string;
    actualHash: string;
    backup: ItemEndPoint;
    endPoint: ItemEndPoint;
}

interface EventAction {
    reason: string;
    target: string;
    source: string;
}

const TRIGGER_SESSION_CHANGE = "SessionChangeEndPoint";
const CACHE_CATEGORY_STORE = "StoreEndPoint";
const CACHE_KEY_FOCUS = "FocusEndPoint";

const StoreEndPoint = createContext<StoreProviderEndPointType | undefined>(undefined);

export const StoreProviderEndPoint: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { search, gather, insert, excise, remove, length } = useStoreCache();
    const { userData, fetchUser, pushTrigger } = useStoreSession();

    const { fetchEndPoints } = useStoreMock();

    const [data, setData] = useState<PayloadData>(newEndPointData(userData));
    const [response, setResponse] = useState<ItemResponse>(emptyItemResponse());
    const [metrics, setMetrics] = useState<Metrics>(emptyMetrics(data.endPoint));

    const [event, setEventAction] = useState<EventAction>({
        reason: "initial",
        source: "",
        target: ""
    });

    useEffect(() => {
        pushTrigger(TRIGGER_SESSION_CHANGE, onSessionChange);
    }, []);

    useEffect(() => {
        updateDataStatus(data.endPoint);
        updateMetricsStatus(data.endPoint);
    }, [data.endPoint]);

    const updateDataStatus = async (endPoint: ItemEndPoint) => {
        let initialHash = data.initialHash;
        if (data.initialHash == "") {
            initialHash = await generateHash(data.backup);
        }

        const actualHash = await generateHash(data.endPoint);

        if (actualHash != initialHash) {
            insert<CacheEndPointStore>(CACHE_CATEGORY_STORE, endPoint._id, {
                backup: data.backup,
                endPoint: endPoint,
            });
        } else {
            remove<CacheEndPointStore>(CACHE_CATEGORY_STORE, endPoint._id);
        }

        if (data.backup._id != "") {
            remove<CacheEndPointStore>(CACHE_CATEGORY_STORE, "");
        }

        insert<CacheEndPointFocus>(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS, {
            endPoint: endPoint._id
        })

        setData(prevData => ({
            ...prevData,
            initialHash,
            actualHash
        }));
    }

    const updateMetricsStatus = async (endPoint: ItemEndPoint) => {
        if (endPoint._id == "") {
            setMetrics(emptyMetrics(data.endPoint));
            return;
        }

        fetchMetricsByEndPoint(endPoint)
            .catch(() => {
                setMetrics(emptyMetrics(data.endPoint));
            })
    }

    const pushEvent = (reason: string, source: string, target: string) => {
        setEventAction({ reason, source, target });
    }

    const onSessionChange = (newUser: UserData, oldUser: UserData) => {
        tryFocusCached(newUser, oldUser);
        cleanCache();
    }

    const tryFocusCached = (newUser: UserData, oldUser: UserData) => {
        if (newUser.username != oldUser.username || !focusCached()) {
            clearAll();
        }
    }

    const focusCached = () => {
        const focus: Optional<CacheEndPointFocus> = search(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
        if (focus != undefined && focus.endPoint != "") {
            fetchEndPointById(focus.endPoint);
            return true;
        }
        return false;
    }

    const cleanCache = () => {
        remove(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
        excise(CACHE_CATEGORY_STORE);
    }

    const newEndPoint = () => {
        pushEvent("new", data.endPoint._id, "");
        return clearAll();
    }

    const clearAll = () => {
        setData(newEndPointData(userData));
        setResponse(emptyItemResponse());
    }

    const fetchEndPoint = async (endPoint: LiteEndPoint) => {
        return fetchEndPointById(endPoint._id);
    }

    const fetchEndPointById = async (id: string) => {
        pushEvent("fetch", data.endPoint._id, id);

        //TODO: Evalue response focus caching.
        setResponse(emptyItemResponse());

        const cached: Optional<CacheEndPointStore> = search(CACHE_CATEGORY_STORE, id);
        if (cached != undefined) {
            restoreEndPoint(cached.endPoint, cached.backup);
            return;
        }

        const endPoint = await findEndPoint(id)
            .catch(err => {
                if (err.statusCode == 404) {
                    fetchUser();
                    return;
                }
                throw err;
            });

        if (!endPoint) {
            return;
        }

        if (endPoint.owner != userData.username) {
            fetchUser();
        }

        restoreEndPoint(endPoint);
    }

    const fetchMetrics = async () => {
        return fetchMetricsByEndPoint(data.endPoint)
    }

    const fetchMetricsByEndPoint = async (endPoint: ItemEndPoint) => {
        const metrics = await findMetrics(endPoint)
            .catch(err => {
                if (err.statusCode == 404) {
                    fetchUser();
                    return;
                }
                throw err;
            });

        if (!metrics) {
            return;
        }

        setMetrics(metrics);
    }

    const injectEndPoint = (endPoint: ItemEndPoint) => {
        clearAll();
        setData(clearEndPointData(endPoint));
        pushEvent("define", data.endPoint._id, "");
    }

    const releaseEndPoint = async (endPoint?: ItemEndPoint) => {
        endPoint = endPoint || data.endPoint;

        const oldEndPoint = { ...endPoint };
        const newEndPoint = { ...endPoint };

        if (newEndPoint.name == "" && !renameEndPoint(newEndPoint).ok) {
            return;
        }

        pushEvent("release", data.endPoint._id, endPoint._id);

        const id = await insertEndPoint(newEndPoint);
        newEndPoint._id = id;

        if (oldEndPoint._id != newEndPoint._id) {
            remove(CACHE_CATEGORY_STORE, oldEndPoint._id);
        }

        setData(clearEndPointData(newEndPoint));

        fetchEndPoints();
    }

    const discardEndPoint = (endPoint?: ItemEndPoint | LiteEndPoint) => {
        pushEvent("discard", data.endPoint._id, (endPoint || data.backup)._id);

        if (!endPoint || endPoint._id == data.backup._id) {
            return restoreEndPoint(data.backup);
        }

        remove(CACHE_CATEGORY_STORE, endPoint._id);

        setData(prevData => {
            return deepClone(prevData);
        });
    }

    const restoreEndPoint = (endPoint: ItemEndPoint, backup?: ItemEndPoint) => {
        setData(clearEndPointData(endPoint, backup));
    }

    const renameEndPoint = (endPoint?: ItemEndPoint): { endPoint: ItemEndPoint, ok: boolean } => {
        endPoint = endPoint || data.endPoint;

        const name = prompt("Insert a name: ", endPoint.name);
        if (name == null) {
            return { endPoint, ok: false };
        }

        endPoint.name = name;
        return { endPoint, ok: true };
    }

    const updateStatus = (status: boolean) => {
        setData(prevData => {
            return {
                ...prevData,
                endPoint: {
                    ...prevData.endPoint,
                    status: status
                }
            }
        });
    }

    const switchSafe = () => {
        setData(prevData => {
            return {
                ...prevData,
                endPoint: {
                    ...prevData.endPoint,
                    safe: !prevData.endPoint.safe
                }
            }
        });
    }

    const updateMethod = (method: string) => {
        setData(prevData => ({
            ...prevData,
            endPoint: {
                ...prevData.endPoint,
                method: method
            }
        }));
    }

    const updatePath = (path: string) => {
        setData(prevData => ({
            ...prevData,
            endPoint: {
                ...prevData.endPoint,
                path: path
            }
        }));
    }

    const newResponse = () => {
        return defineResponse(emptyItemResponse());
    }

    const defineResponse = (response: ItemResponse) => {
        const newResponse = deepClone(response);

        if (!resolveResponse(newResponse)) {
            return false;
        }

        setResponse(newResponse);

        return true;
    }

    const resolveResponse = (response: ItemResponse, rename?: boolean) => {
        if (rename || response.name == "") {
            let name = resolveName(response);
            if (name == null) {
                return false;
            }

            response.name = name;
        }

        setData(prevData => ({
            ...prevData,
            endPoint: {
                ...prevData.endPoint,
                responses: resolveResponses(prevData.endPoint.responses, response)
            }
        }));

        return true;
    }

    const resolveName = (response: ItemResponse) => {
        let message = "Insert a name: ";

        while (true) {
            const name = prompt(message, response.name);

            const exists = data.endPoint.responses.find(r => r.name === name);
            if (!exists) {
                return name
            }

            message = `There is already an answer with the name ${name}`;
        }
    }

    const removeResponse = (response: ItemResponse) => {
        setData(prevData => ({
            ...prevData,
            endPoint: {
                ...prevData.endPoint,
                responses: removeResponseFromList(prevData.endPoint.responses, response)
            }
        }));
    }

    const orderResponses = (responses: ItemResponse[]) => {
        setData(prevData => ({
            ...prevData,
            endPoint: {
                ...prevData.endPoint,
                responses: fixResponses(responses)
            }
        }));
    }

    const isFocused = (endPoint: LiteEndPoint) => {
        return data.endPoint._id == endPoint._id;
    }

    const isModified = () => {
        return data.initialHash != data.actualHash;
    }

    const isCached = (endPoint: LiteEndPoint) => {
        return search(CACHE_CATEGORY_STORE, endPoint._id) != undefined;
    }

    const cacheLenght = () => {
        return length(CACHE_CATEGORY_STORE);
    }

    const cacheComments = () => {
        const requests: CacheEndPointStore[] = gather(CACHE_CATEGORY_STORE);
        return requests.map(cacheComment);
    }

    const cacheComment = (cached: CacheEndPointStore) => {
        if (!cached.endPoint) {
            return "Unsaved corrupted end-point data";
        }

        let name = cached.endPoint.name || "";
        if (name == undefined || name == "") {
            name = `${cached.endPoint.method} ${cached.endPoint.path}`;
        }

        return `Unsaved mock end-point '${name}'.`;
    }

    return (
        <StoreEndPoint.Provider value={{
            endPoint: data.endPoint,
            metrics, response, event,
            isFocused, isModified, newEndPoint, fetchEndPoint,
            injectEndPoint, releaseEndPoint, renameEndPoint,
            updateStatus, switchSafe, updateMethod,
            updatePath, discardEndPoint, fetchMetrics,
            newResponse, defineResponse, resolveResponse,
            removeResponse, orderResponses, isCached,
            cacheLenght, cacheComments
        }}>
            {children}
        </StoreEndPoint.Provider>
    );
};

const newEndPointData = (userData: UserData): PayloadData => {
    const endPoint = emptyItemEndPoint(userData.username);
    return clearEndPointData(endPoint);
};

const clearEndPointData = (endPoint: ItemEndPoint, backup?: ItemEndPoint): PayloadData => {
    return {
        initialHash: "",
        actualHash: "",
        backup: deepClone(backup || endPoint),
        endPoint: deepClone(endPoint),
    }
};

export const useStoreEndPoint = (): StoreProviderEndPointType => {
    const context = useContext(StoreEndPoint);
    if (!context) {
        throw new Error("useStore must be used within a StoreProviderEndPoint");
    }
    return context;
};
