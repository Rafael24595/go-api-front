import { createContext, ReactNode, useContext, useState } from "react";
import { LiteEndPoint } from "../../interfaces/mock/EndPoint";

interface StoreProviderMockType {
    endPoints: LiteEndPoint[];
    fetchAll: () => Promise<void>;
    fetchEndPoints: () => Promise<void>;
}

interface PayloadEndPoint {
    items: LiteEndPoint[];
    hash: string;
}


const StoreRequest = createContext<StoreProviderMockType | undefined>(undefined);

export const StoreProviderMock: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [endPoints, setEndPoints] = useState<PayloadEndPoint>({
        items: [],
        hash: ""
    });

    const fetchAll = async () => {
        fetchEndPoints();
    }

    const fetchEndPoints = async () => {

    }

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