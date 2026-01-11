import { useCallback, useEffect } from "react";
import { ClientBody } from "../components/body/client/ClientBody.tsx"
import { Footer } from "../components/footer/Footer.tsx"
import { Header } from "../components/header/Header.tsx"
import { joinMessages } from "../services/Utils.ts";
import { useStoreContext } from "../store/client/context/StoreProviderContext.tsx";
import { useStoreRequest } from "../store/client/request/StoreProviderRequest.tsx";
import { ClientProviders } from "../store/Providers.tsx"
import { useStoreSession } from "../store/system/StoreProviderSession.tsx";
import { useStoreSystem } from "../store/system/StoreProviderSystem.tsx";
import { executeShortCut } from "../services/shortcut/ShortCut.ts";

function ClientPage() {
    const { userData } = useStoreSession();
    const { shortCutModal, shortCutCmd, shortCutLog } = useStoreSystem();
    
    const ShortCutActions = [
        shortCutModal, shortCutCmd, shortCutLog
    ];

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        executeShortCut(event, userData, ...ShortCutActions);
    }, [userData]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <ClientProviders>
            <ContextedPage />
        </ClientProviders>
    )
}

function ContextedPage() {
    const request = useStoreRequest();
    const context = useStoreContext();

    const isEmptyUnsaved = () => {
        return request.cacheLenght() < 1 && context.cacheLenght() < 1;
    };

    const unsavedMessages = () => {
        return joinMessages(request.cacheComments(), context.cacheComments());
    };

    const unsaved = () => {
        return {
            isEmpty: isEmptyUnsaved,
            messages: unsavedMessages
        }
    }

    return (
        <>
            <Header unsaved={unsaved()} />
            <ClientBody />
            <Footer />
        </>
    )
}

export default ClientPage
