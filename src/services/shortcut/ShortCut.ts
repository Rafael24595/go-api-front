import { hasRole, Role, UserData } from "../../interfaces/system/UserData";

export interface ShortCutAction {
    roles?: Role[],
    ctrl?: boolean,
    alt?: boolean,
    key: string,
    exec: () => void;
}

export const closeWindow = (actions: {
    checkSession: () => Promise<void>
}): ShortCutAction => {
    return {
        key: "Escape",
        exec: () => {
            actions.checkSession().then(() => {
                window.close();
            });
        }
    }
};

export const executeShortCut = (event: KeyboardEvent, userData: UserData, ...actions: ShortCutAction[]) => {
    const ctrlKey = event.ctrlKey;
    const altKey = event.altKey;
    const key = event.key;

    for (const action of actions) {
        if (action.key != key) {
            continue;
        }

        const authRole = action.roles ? hasRole(userData, ...action.roles) : true;
        const authCtrl = action.ctrl ? ctrlKey : true;
        const authAlt = action.alt ? altKey : true;

        if (authRole && authCtrl && authAlt) {
            action.exec();
        }
    }
}