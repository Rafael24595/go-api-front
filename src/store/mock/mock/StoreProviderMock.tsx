import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { LiteEndPoint } from "../../../interfaces/mock/EndPoint";
import { useStoreSession } from "../../system/StoreProviderSession";
import { cleanEndPoints, PayloadEndPoint } from "./Helper";
import { useMockController } from "./StoreControllerMock";

interface StoreProviderMockType {
    endPoints: LiteEndPoint[];
    fetchAll: () => Promise<void>;
    fetchEndPoints: () => Promise<void>;
}


const TRIGGER_SESSION_CHANGE = "SessionChangeMock";

const StoreRequest = createContext<StoreProviderMockType | undefined>(undefined);

export const StoreProviderMock: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userData, loaded, fetchUser, pushTrigger, trimTrigger } = useStoreSession();

    const [endPoints, setEndPoints] = useState<PayloadEndPoint>(cleanEndPoints());

    const {
        fetchAll, fetchEndPoints, clearAll
    } = useMockController({
        setEndPoints,
    });

    useEffect(() => {
        if (loaded) {
            fetchAll();
        }

        pushTrigger(TRIGGER_SESSION_CHANGE, onSessionChange);

        return () => {
            trimTrigger(TRIGGER_SESSION_CHANGE);
        };
    }, []);

    const onSessionChange = async () => {
        clearAll();
        fetchAll();
    };

    const fetchAllWithValidation = async () => {
        fetchEndPointsWithValidation();
    };

    const fetchEndPointsWithValidation = async () => {
        const owner = await fetchEndPoints();
        if (owner != userData.username) {
            fetchUser();
        }
    };

    return (
        <StoreRequest.Provider value={{
            endPoints: endPoints.items,

            fetchAll: fetchAllWithValidation,
            fetchEndPoints: fetchEndPointsWithValidation,
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