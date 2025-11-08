import { ReactNode } from "react";
import { Alert } from "../components/utils/alert/Alert";
import { StoreProviderStatus } from "./StoreProviderStatus";
import { StoreProviderCache } from "./StoreProviderCache";
import { StoreProviderSession } from "./StoreProviderSession";
import { StoreProviderTheme } from "./theme/StoreProviderTheme";
import { StoreProviderSystem } from "./system/StoreProviderSystem";
import { StoreProviderCollections } from "./StoreProviderCollections";
import { StoreProviderContext } from "./StoreProviderContext";
import { StoreProviderRequest } from "./StoreProviderRequest";

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