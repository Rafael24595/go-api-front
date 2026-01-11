import { useCallback, useEffect } from "react";
import { Cmd } from "../components/terminal/Cmd"
import { useStoreSession } from "../store/system/StoreProviderSession";
import { closeWindow, executeShortCut } from "../services/shortcut/ShortCut";

function CmdPage() {
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
        <Cmd />
    )
}

export default CmdPage
