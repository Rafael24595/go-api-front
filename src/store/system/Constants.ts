import { Role } from "../../interfaces/system/UserData";
import { ShortCutAction } from "../../services/shortcut/ShortCut";
import { Dict } from "../../types/Dict";

export const shortCutActions = (actions: {
    openModal: () => void,
    showLogs: () => void,
    showTerminal: () => void
}): Dict<ShortCutAction> => {
    return {
        shortCutModal: {
            ctrl: true,
            alt: true,
            key: "d",
            exec: actions.openModal
        },
        shortCutLog:  {
            roles: [Role.ROLE_ADMIN],
            ctrl: true,
            alt: true,
            key: "l",
            exec: actions.showLogs
        },
        shortCutCmd: {
            roles: [Role.ROLE_ADMIN],
            ctrl: true,
            alt: true,
            key: "t",
            exec: actions.showTerminal
        }
    }
}