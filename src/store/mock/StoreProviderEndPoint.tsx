import { createContext, ReactNode, useContext, useState } from "react";
import { emptyItemEndPoint, ItemEndPoint, LiteEndPoint } from "../../interfaces/mock/EndPoint";
import { useStoreCache } from "../StoreProviderCache";
import { CacheEndPoint } from "../../interfaces/mock/Cache";
import { useStoreSession } from "../system/StoreProviderSession";
import { ItemResponse } from "../../interfaces/mock/Response";

interface StoreProviderEndPointType {
    endPoint: ItemEndPoint;
    fetchEndPoint: (endPoint: LiteEndPoint) => Promise<void>;
    resolveResponse: (response: ItemResponse) => void;
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

    const resolveResponse = (response: ItemResponse) => {
        setEndPoint(prevData => {
            const index = prevData.responses.findIndex(r => r.condition == response.condition);
            if (index != -1) {
                prevData.responses[index] = response;
            } else {
                prevData.responses.push(response);
            }

            return {
                ...prevData,
                responses: [
                    ...prevData.responses
                ]
            }
        });
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