import { createContext, ReactNode, useContext, useState } from "react";
import { emptyItemEndPoint, ItemEndPoint, LiteEndPoint } from "../../interfaces/mock/EndPoint";
import { useStoreCache } from "../StoreProviderCache";
import { CacheEndPoint } from "../../interfaces/mock/Cache";
import { useStoreSession } from "../system/StoreProviderSession";
import { DEFAULT_RESPONSE, fixResponses, ItemResponse } from "../../interfaces/mock/Response";

interface StoreProviderEndPointType {
    endPoint: ItemEndPoint;
    fetchEndPoint: (endPoint: LiteEndPoint) => Promise<void>;
    resolveResponse: (response: ItemResponse, rename?: boolean) => boolean;
    cacheLenght: () => number;
    cacheComments: () => string[];
}

const CACHE_KEY = "StoreProviderEndPoint";

const StoreRequest = createContext<StoreProviderEndPointType | undefined>(undefined);

export const StoreProviderEndPoint: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { gather, length } = useStoreCache();
    const { userData } = useStoreSession();

    const [endPoint, setEndPoint] = useState<ItemEndPoint>(
        emptyItemEndPoint(userData.username));

    const fetchEndPoint = async () => {

    }

    const resolveResponse = (response: ItemResponse, rename?: boolean) => {
        if (rename || response.name == "") {
            const name = prompt("Insert a name: ", response.name);
            if (name == null) {
                return false;
            }

            response.name = name;
        }

        setEndPoint(prevData => {
            const index = prevData.responses.findIndex(r => r.order == response.order);
            if (index != -1 && prevData.responses[index].name != DEFAULT_RESPONSE) {
                prevData.responses[index] = response;
            } else {
                prevData.responses.push(response);
            }

            return {
                ...prevData,
                responses: [
                    ...fixResponses(prevData.responses)
                ]
            }
        });

        return true;
    }

    const cacheLenght = () => {
        return length(CACHE_KEY);
    }

    const cacheComments = () => {
        const requests: CacheEndPoint[] = gather(CACHE_KEY);
        return requests.map(cacheComment);
    }

    const cacheComment = (cached: CacheEndPoint) => {
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
        <StoreRequest.Provider value={{
            endPoint: endPoint,
            fetchEndPoint, resolveResponse, cacheLenght,
            cacheComments
        }}>
            {children}
        </StoreRequest.Provider>
    );
};

export const useStoreEndPoint = (): StoreProviderEndPointType => {
    const context = useContext(StoreRequest);
    if (!context) {
        throw new Error("useStore must be used within a StoreProviderEndPoint");
    }
    return context;
};