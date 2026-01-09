import { useCallback, useEffect } from "react";
import { Log } from "../components/terminal/Log"
import { closeWindow, executeShortCut } from "../services/shortcut/ShortCut";
import { useStoreSession } from "../store/system/StoreProviderSession";

function LogPage() {
    const { userData, checkSession } = useStoreSession();

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        executeShortCut(event, userData, closeWindow({ checkSession }));
    }, [userData]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <Log />
    )
}

export default LogPage
