import { ReactNode } from "react";
import { Alert } from "../components/utils/alert/Alert";
import { StoreProviderStatus } from "./StoreProviderStatus";
import { StoreProviderCache } from "./StoreProviderCache";
import { StoreProviderSession } from "./system/StoreProviderSession";
import { StoreProviderTheme } from "./theme/StoreProviderTheme";
import { StoreProviderSystem } from "./system/StoreProviderSystem";
import { StoreProviderCollections } from "./client/collection/StoreProviderCollections";
import { StoreProviderContext } from "./client/context/StoreProviderContext";
import { StoreProviderRequest } from "./client/request/StoreProviderRequest";
import { StoreProviderEndPoint } from "./mock/endpoint/StoreProviderEndPoint";
import { StoreProviderMock } from "./mock/mock/StoreProviderMock";

export const SystemProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <Alert>
            <StoreProviderStatus>
                <StoreProviderCache>
                    <StoreProviderSession>
                        <StoreProviderTheme>
                            <StoreProviderSystem>
                                {children}
                            </StoreProviderSystem>
                        </StoreProviderTheme>
                    </StoreProviderSession>
                </StoreProviderCache>
            </StoreProviderStatus>
        </Alert>
    );
}

export const ClientProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <StoreProviderCollections>
            <StoreProviderContext>
                <StoreProviderRequest>
                    {children}
                </StoreProviderRequest>
            </StoreProviderContext>
        </StoreProviderCollections>
    );
}

export const MockProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <StoreProviderMock>
            <StoreProviderEndPoint>
                {children}
            </StoreProviderEndPoint>
        </StoreProviderMock>
    );
}