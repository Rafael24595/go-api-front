import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { ItemEndPoint, LiteEndPoint } from "../../../interfaces/mock/EndPoint";
import { useStoreCache } from "../../StoreProviderCache";
import { CacheEndPointStore, CacheEndPointFocus } from "../../../interfaces/mock/Cache";
import { useStoreSession } from "../../system/StoreProviderSession";
import { emptyItemResponse, ItemResponse, resolveResponses, removeResponse as removeResponseFromList, fixResponses } from "../../../interfaces/mock/Response";
import { deepClone } from "../../../services/Utils";
import { UserData } from "../../../interfaces/system/UserData";
import { CACHE_CATEGORY_FOCUS } from "../../Constants";
import { emptyMetrics, Metrics } from "../../../interfaces/mock/Metrics";
import { EventAction, Events, InitialEvent } from "../../../types/EventAction";
import { EndPointEvents } from "../Constants";
import { useEndPointController } from "./StoreControllerEndPoint";
import { CACHE_CATEGORY_STORE, CACHE_KEY_FOCUS, newEndPointData, PayloadData } from "./Helper";

interface StoreProviderEndPointType {
    endPoint: ItemEndPoint;
    response: ItemResponse;
    metrics: Metrics;
    event: EventAction;

    newEndPoint: () => void;
    fetchEndPoint: (endPoint: LiteEndPoint) => Promise<boolean>;
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
    updateResponse: (response: ItemResponse) => void;
    orderResponses: (responses: ItemResponse[]) => void;

    isFocused: (endPoint: LiteEndPoint) => boolean;
    isModified: () => boolean;
    isCached: (endPoint: LiteEndPoint) => boolean;
    cacheLenght: () => number;
    cacheComments: () => string[];
}

const TRIGGER_SESSION_CHANGE = "SessionChangeEndPoint";

const StoreEndPoint = createContext<StoreProviderEndPointType | undefined>(undefined);

export const StoreProviderEndPoint: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { search, gather, insert, remove, length } = useStoreCache();
    const { userData, loaded, pushTrigger, trimTrigger } = useStoreSession();

    const [data, setData] = useState<PayloadData>(newEndPointData(userData));
    const [response, setResponse] = useState<ItemResponse>(emptyItemResponse());
    const [metrics, setMetrics] = useState<Metrics>(emptyMetrics(data.endPoint));

    const [event, setEventAction] = useState<EventAction>(InitialEvent);

    const pushEvent = (reason: string, source?: string, target?: string) => {
        setEventAction({ reason, source, target });
    }

    const {
        backupRef,
        endPointRef,

        focusCached,
        clearAll,
        cleanCache,
        fetchEndPointById,

        injectEndPoint, releaseEndPoint, renameEndPoint,
        discardEndPoint, fetchMetrics

    } = useEndPointController({
        setData, setResponse, setMetrics, pushEvent,
    });

    useEffect(() => {
        pushTrigger(TRIGGER_SESSION_CHANGE, onSessionChange);

        if (loaded) {
            focusCached(userData);
        }

        return () => {
            trimTrigger(TRIGGER_SESSION_CHANGE);
        };
    }, []);

    useEffect(() => {
        if (!loaded) {
            return;
        }

        endPointRef.current = data.endPoint;

        updateDataStatus(data.endPoint);
    }, [data.endPoint]);

    useEffect(() => {
        if (!loaded) {
            return;
        }

        backupRef.current = data.backup;

    }, [data.endPoint]);

    const injectNewEndPoint = (endPoint: ItemEndPoint) => {
        return injectEndPoint(userData, endPoint)
    }

    const updateDataStatus = async (endPoint: ItemEndPoint) => {
        let initialHash = data.initialHash;
        if (data.initialHash == "") {
            initialHash = calculateHash(data.backup);
        }

        const actualHash = calculateHash(data.endPoint);
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

    const onSessionChange = useCallback(async (newUser: UserData, oldUser: UserData) => {
        if (newUser.username != oldUser.username || !focusCached(newUser)) {
            clearAll(newUser);
            cleanCache();
        }
    }, []);

    const newEndPoint = () => {
        pushEvent(Events.DEFINE, data.endPoint._id, "");
        return clearAll(userData);
    }

    const fetchEndPoint = async (endPoint: LiteEndPoint) => {
        return fetchEndPointById(userData, endPoint._id);
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
        const status = setFixedResponse(response);
        pushEvent(EndPointEvents.DEFINE_REQUEST);
        return status;
    }

    const updateResponse = (response: ItemResponse) => {
        const status = setFixedResponse(response);
        pushEvent(EndPointEvents.UPDATE_REQUEST);
        return status;
    }

    const setFixedResponse = (response: ItemResponse) => {
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
            metrics, response, event,

            endPoint: data.endPoint,

            injectEndPoint: injectNewEndPoint,

            isFocused, isModified, newEndPoint,
            fetchEndPoint, releaseEndPoint, renameEndPoint,
            updateStatus, switchSafe, updateMethod,
            updatePath, discardEndPoint, fetchMetrics,
            newResponse, defineResponse, resolveResponse,
            removeResponse, updateResponse, orderResponses,
            isCached, cacheLenght, cacheComments
        }}>
            {children}
        </StoreEndPoint.Provider>
    );
};

const calculateHash = (endPoint: ItemEndPoint) => {
    return JSON.stringify(endPoint);
}

export const useStoreEndPoint = (): StoreProviderEndPointType => {
    const context = useContext(StoreEndPoint);
    if (!context) {
        throw new Error("useStore must be used within a StoreProviderEndPoint");
    }
    return context;
};
