import { useCallback, useEffect } from "react";
import { MockBody } from "../components/body/mock/MockBody.tsx"
import { Footer } from "../components/footer/Footer.tsx"
import { Header } from "../components/header/Header.tsx"
import { joinMessages } from "../services/Utils.ts";
import { useStoreEndPoint } from "../store/mock/endpoint/StoreProviderEndPoint.tsx";
import { MockProviders } from "../store/Providers.tsx"
import { useStoreSystem } from "../store/system/StoreProviderSystem.tsx";
import { executeShortCut } from "../services/shortcut/ShortCut.ts";
import { useStoreSession } from "../store/system/StoreProviderSession.tsx";

function MockPage() {
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
        <>
            <MockProviders>
                <ContextedPage />
            </MockProviders>
        </>
    )
}

function ContextedPage() {
    const endPoint = useStoreEndPoint();

    const isEmptyUnsaved = () => {
        return endPoint.cacheLenght() < 1;
    };

    const unsavedMessages = () => {
        return joinMessages(endPoint.cacheComments());
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
            <MockBody />
            <Footer />
        </>
    )
}

export default MockPage
