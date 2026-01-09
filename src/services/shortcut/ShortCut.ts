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

export enum Cover {
    parentheses = "parentheses",
    brackets = "brackets",
    braces = "braces"
}

export const formatShortCutOpts = (
    userData: UserData,
    action: ShortCutAction,
    opts?: {
        cover: string | Cover
    }
): string => {
    const result = formatShortCut(userData, action);
    if (result == "" || !opts) {
        return ""
    }

    switch (opts.cover) {
        case Cover.parentheses:
            return `(${result})`;
        case Cover.brackets:
            return `[${result}]`;
        case Cover.braces:
            return `{${result}}`;
        case "":
        case undefined:
            return result;
        default:
            return `${opts.cover}${result}${opts.cover}`;
    }
};

export const formatShortCut = (
    userData: UserData,
    action: ShortCutAction
): string => {
    console.log(userData, action)
    if (action.roles && !hasRole(userData, ...action.roles)) {
        return ""
    }

    const buffer = [];

    if (action.ctrl) {
        buffer.push("CTRL");
    }

    if (action.alt) {
        buffer.push("ALT");
    }

    if (action.key != "") {
        buffer.push(action.key.toUpperCase());
    }

    return buffer.join(" + ");
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