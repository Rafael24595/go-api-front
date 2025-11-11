import { createContext, ReactNode, useContext, useState } from "react";
import { emptyEndPoint, EndPoint, LiteEndPoint } from "../../interfaces/mock/EndPoint";
import { useStoreCache } from "../StoreProviderCache";
import { CacheEndPoint } from "../../interfaces/mock/Cache";
import { useStoreSession } from "../system/StoreProviderSession";

interface StoreProviderEndPointType {
    endPoint: EndPoint;
    fetchEndPoint: (endPoint: LiteEndPoint) => Promise<void>;
    cacheLenght: () => number;
    cacheComments: () => string[];
}

const CACHE_KEY = "StoreProviderEndPoint";

const StoreRequest = createContext<StoreProviderEndPointType | undefined>(undefined);

export const StoreProviderEndPoint: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { gather, length } = useStoreCache();
    const { userData } = useStoreSession();

    const [endPoint, setEndPoint] = useState<EndPoint>(
        emptyEndPoint(userData.username));

    const fetchEndPoint = async () => {

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
            fetchEndPoint, cacheLenght, cacheComments
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