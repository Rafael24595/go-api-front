import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { emptyItemEndPoint, ItemEndPoint, LiteEndPoint } from "../../interfaces/mock/EndPoint";
import { useStoreCache } from "../StoreProviderCache";
import { CacheEndPointStore, CacheEndPointFocus, CacheResponseFocus } from "../../interfaces/mock/Cache";
import { useStoreSession } from "../system/StoreProviderSession";
import { emptyItemResponse, ItemResponse, resolveResponses } from "../../interfaces/mock/Response";
import { deepClone, generateHash } from "../../services/Utils";
import { UserData } from "../../interfaces/system/UserData";
import { Optional } from "../../types/Optional";
import { findEndPoint, insertEndPoint } from "../../services/api/ServiceStorage";
import { CACHE_CATEGORY_FOCUS } from "../Constants";
import { useStoreMock } from "./StoreProviderMock";

interface StoreProviderEndPointType {
    initialHash: string;
    actualHash: string;
    endPoint: ItemEndPoint;
    response: ItemResponse;
    fetchEndPoint: (endPoint: LiteEndPoint) => Promise<void>;
    releaseEndPoint: () => Promise<void>;
    discardEndPoint: (endPoint?: ItemEndPoint) => void;
    switchSafe: () => void;
    updateMethod: (method: string) => void;
    updatePath: (path: string) => void;
    isResponseModified: () => boolean;
    defineResponse: (response: ItemResponse) => void;
    updateResponse: (response: ItemResponse) => void;
    releaseResponse: (rename?: boolean) => boolean;
    resolveResponse: (response: ItemResponse, rename?: boolean) => boolean;
    discardResponse: () => void;
    cacheLenght: () => number;
    cacheComments: () => string[];
}

interface PayloadData {
    initialHash: string;
    actualHash: string;
    backup: ItemEndPoint;
    endPoint: ItemEndPoint;
}

interface PayloadResponse {
    initialHash: string;
    actualHash: string;
    backup: ItemResponse;
    response: ItemResponse;
}

const TRIGGER_SESSION_CHANGE = "SessionChangeEndPoint";
const CACHE_CATEGORY_STORE = "StoreEndPoint";
const CACHE_KEY_FOCUS = "FocusEndPoint";
const CACHE_KEY_REQUEST_FOCUS = "FocusRequest";


const StoreEndPoint = createContext<StoreProviderEndPointType | undefined>(undefined);

export const StoreProviderEndPoint: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { search, gather, insert, excise, remove, length } = useStoreCache();
    const { userData, fetchUser, pushTrigger } = useStoreSession();

    const { fetchEndPoints } = useStoreMock();

    const clearEndPoint = () => {
        return {
            initialHash: "",
            actualHash: "",
            backup: emptyItemEndPoint(userData.username),
            endPoint: emptyItemEndPoint(userData.username),
        }
    };

    const clearResponse = () => {
        return {
            initialHash: "",
            actualHash: "",
            backup: emptyItemResponse(),
            response: emptyItemResponse(),
        }
    };

    const [data, setData] = useState<PayloadData>(() => clearEndPoint());

    const [responseData, setResponseData] = useState<PayloadResponse>(() => clearResponse());

    useEffect(() => {
        pushTrigger(TRIGGER_SESSION_CHANGE, onSessionChange);
    }, []);

    useEffect(() => {
        updateDataStatus(data.endPoint);
    }, [data.endPoint]);

    useEffect(() => {
        updateResponseDataStatus(responseData.response);
    }, [responseData.response]);

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

        insert<CacheEndPointFocus>(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS, {
            endPoint: endPoint._id
        })

        setData(prevData => ({
            ...prevData,
            initialHash,
            actualHash
        }));
    }

    const updateResponseDataStatus = async (response: ItemResponse) => {
        let initialHash = responseData.initialHash;
        if (responseData.initialHash == "") {
            initialHash = await generateHash(responseData.backup);
        }

        const actualHash = await generateHash(responseData.response);

        insert<CacheResponseFocus>(CACHE_CATEGORY_FOCUS, CACHE_KEY_REQUEST_FOCUS, {
            response: response.order
        })

        setResponseData(prevData => ({
            ...prevData,
            initialHash,
            actualHash
        }));
    }

    const onSessionChange = (newUser: UserData, oldUser: UserData) => {
        tryFocusCached(newUser, oldUser);
        cleanCache();
    }

    const tryFocusCached = (newUser: UserData, oldUser: UserData) => {
        if (newUser.username != oldUser.username || !focusCached()) {
            setData(clearEndPoint());
            setResponseData(clearResponse());
        }
    }

    const focusCached = () => {
        const focus: Optional<CacheEndPointFocus> = search(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
        if (focus != undefined) {
            fetchEndPointById(focus.endPoint);
            return true;
        }
        return false;
    }

    const cleanCache = () => {
        remove(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
        remove(CACHE_CATEGORY_FOCUS, CACHE_KEY_REQUEST_FOCUS);
        excise(CACHE_CATEGORY_STORE);
    }

    const fetchEndPoint = async (endPoint: LiteEndPoint) => {
        return fetchEndPointById(endPoint._id);
    }

    const fetchEndPointById = async (id: string) => {
        const cached: Optional<CacheEndPointStore> = search(CACHE_CATEGORY_FOCUS, id);
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

    const releaseEndPoint = async () => {
        const oldEndPoint = { ...data.endPoint };
        const newEndPoint = { ...data.endPoint };

        if (newEndPoint.name == "") {
            const name = prompt("Insert a name: ", newEndPoint.name);
            if (name == null) {
                return;
            }

            newEndPoint.name = name;
        }

        const id = await insertEndPoint(data.endPoint);
        newEndPoint._id = id;

        if (oldEndPoint._id != newEndPoint._id) {
            remove(CACHE_CATEGORY_STORE, oldEndPoint._id);
        }

        setData({
            initialHash: "",
            actualHash: "",
            backup: deepClone(newEndPoint),
            endPoint: deepClone(newEndPoint),
        });

        fetchEndPoints();
    }

    const discardEndPoint = (endPoint?: ItemEndPoint) => {
        if (!endPoint || endPoint._id == data.backup._id) {
            discardResponse();
            return restoreEndPoint(data.backup);
        }

        remove(CACHE_CATEGORY_STORE, endPoint._id);

        setData(prevData => {
            return deepClone(prevData);
        });
    }

    const restoreEndPoint = (endPoint: ItemEndPoint, backup?: ItemEndPoint) => {
        setData({
            initialHash: "",
            actualHash: "",
            backup: deepClone(backup || endPoint),
            endPoint: deepClone(endPoint),
        });
    }

    const switchSafe = () => {
        setData(prevData => ({
            ...prevData,
            endPoint: {
                ...prevData.endPoint,
                safe: !prevData.endPoint.safe
            }
        }));
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

    const isResponseModified = () => {
        return responseData.initialHash != responseData.actualHash;
    }

    const defineResponse = (response: ItemResponse) => {
        setResponseData({
            initialHash: "",
            actualHash: "",
            backup: deepClone(response),
            response: deepClone(response)
        });
    }

    const updateResponse = (response: ItemResponse) => {
        setResponseData((prevData) => ({
            ...prevData,
            response: deepClone(response)
        }))
    }

    const releaseResponse = (rename?: boolean) => {
        return resolveResponse({ ...responseData.response }, rename)
    }

    const resolveResponse = (response: ItemResponse, rename?: boolean) => {
        const newResponse = response || { ...responseData.response };
        if (rename || newResponse.name == "") {
            const name = prompt("Insert a name: ", newResponse.name);
            if (name == null) {
                return false;
            }

            newResponse.name = name;
        }

        setData(prevData => ({
            ...prevData,
            endPoint: {
                ...prevData.endPoint,
                responses: resolveResponses(prevData.endPoint.responses, newResponse)
            }
        }));

        return true;
    }

    const discardResponse = () => {
        defineResponse(responseData.backup);
    }

    const cacheLenght = () => {
        return length(CACHE_CATEGORY_FOCUS);
    }

    const cacheComments = () => {
        const requests: CacheEndPointStore[] = gather(CACHE_CATEGORY_FOCUS);
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
            initialHash: data.initialHash,
            actualHash: data.actualHash,
            endPoint: data.endPoint,
            response: responseData.response,
            fetchEndPoint, releaseEndPoint, switchSafe,
            updateMethod, updatePath, discardEndPoint,
            isResponseModified, defineResponse, updateResponse,
            releaseResponse, resolveResponse, discardResponse,
            cacheLenght, cacheComments
        }}>
            {children}
        </StoreEndPoint.Provider>
    );
};

export const useStoreEndPoint = (): StoreProviderEndPointType => {
    const context = useContext(StoreEndPoint);
    if (!context) {
        throw new Error("useStore must be used within a StoreProviderEndPoint");
    }
    return context;
};
