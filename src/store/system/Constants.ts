import { Role } from "../../interfaces/system/UserData";

export const shortCutActions = (actions: {
    openModal: () => void,
    showLogs: () => void,
    showTerminal: () => void
}) => {
    return {
        shortCutModal: {
            roles: [Role.ROLE_ADMIN],
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