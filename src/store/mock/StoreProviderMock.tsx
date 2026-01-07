import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { LiteEndPoint } from "../../interfaces/mock/EndPoint";
import { generateHash } from "../../services/Utils";
import { useStoreSession } from "../system/StoreProviderSession";
import { findAllEndPoint } from "../../services/api/ServiceEndPoint";

interface StoreProviderMockType {
    endPoints: LiteEndPoint[];
    fetchAll: () => Promise<void>;
    fetchEndPoints: () => Promise<void>;
}

interface PayloadEndPoint {
    items: LiteEndPoint[];
    hash: string;
}

const TRIGGER_SESSION_CHANGE = "SessionChangeMock";

const StoreRequest = createContext<StoreProviderMockType | undefined>(undefined);

const cleanEndPoints = (): PayloadEndPoint => {
    return {
        items: [],
        hash: ""
    }
}

export const StoreProviderMock: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userData, loaded, fetchUser, pushTrigger, trimTrigger } = useStoreSession();

    const [endPoints, setEndPoints] = useState<PayloadEndPoint>(cleanEndPoints());

    useEffect(() => {
        if (loaded) {
            unsafeFetchAll();
        }

        pushTrigger(TRIGGER_SESSION_CHANGE, refreshAll);

        return () => {
            trimTrigger(TRIGGER_SESSION_CHANGE);
        };
    }, []);

    const fetchAll = async () => {
        fetchEndPoints();
    }

    const unsafeFetchAll = async () => {
        fetchEndPoints();
    };

    const refreshAll = async () => {
        clearAll();
        unsafeFetchAll();
    };

    const clearAll = async () => {
        setEndPoints(cleanEndPoints());
    };

    const fetchEndPoints = async () => {
        const owner = await unsafeFetchEndPoints();
        if (owner != userData.username) {
            fetchUser();
        }
    };

    const unsafeFetchEndPoints = async (): Promise<string> => {
        try {
            const request = await findAllEndPoint();
            const data = request.payload
                .sort((a, b) => a.order - b.order);

            const newHash = await generateHash(data);

            setEndPoints((prevData) => {
                if (prevData.hash == newHash) {
                    return prevData;
                }

                return {
                    items: data,
                    hash: newHash
                };
            });

            return request.owner;
        } catch (error) {
            console.error("Error fetching collection:", error);
            return "";
        }
    };

    return (
        <StoreRequest.Provider value={{
            endPoints: endPoints.items,
            fetchAll, fetchEndPoints,
        }}>
            {children}
        </StoreRequest.Provider>
    );
};

export const useStoreMock = (): StoreProviderMockType => {
    const context = useContext(StoreRequest);
    if (!context) {
        throw new Error("useStore must be used within a StoreProviderEndPoint");
    }
    return context;
};