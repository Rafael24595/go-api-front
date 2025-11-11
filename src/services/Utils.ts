import { ItemStatusCategoryKeyValue, StatusCategoryKeyValue } from "../interfaces/StatusCategoryKeyValue";
import { StatusKeyValue } from "../interfaces/StatusKeyValue";
import { ItemStatusValue, PrivateStatusValue, StatusValue } from "../interfaces/StatusValue";
import { Dict } from "../types/Dict";
import SHA256 from "crypto-js/sha256";

(() => {
    if (!window.isSecureContext || !window.crypto?.subtle) {
        console.warn("Falling back to crypto-js (insecure hash, use HTTPS if possible)");
    }
    if (!navigator.clipboard) {
        console.warn("Falling back to execCommand (insecure copy to clipboard, use HTTPS if possible)");
    }
})()

const CHAR_WIDTH = 8;
const LINE_HEIGHT = 20;

export const detachStatusKeyValue = (dict: Dict<StatusValue[]>): StatusKeyValue[] => {
    const vector: StatusKeyValue[] = [];
    if (dict == undefined) {
        return vector;
    }

    for (const [k, vs] of Object.entries(dict)) {
        for (const v of vs) {
            vector.push({
                order: v.order,
                status: v.status,
                key: k,
                value: v.value
            });
        }
    }
    return vector;
}

export const collectStatusKeyValue = (dict: Dict<StatusValue>): StatusKeyValue[] => {
    const vector: StatusKeyValue[] = [];
    if (dict == undefined) {
        return vector;
    }

    for (const [k, v] of Object.entries(dict)) {
        vector.push({
            order: v.order,
            status: v.status,
            key: k,
            value: v.value
        });
    }

    return vector;
}

export const mergeStatusKeyValue = (newValues: StatusKeyValue[]): Dict<StatusValue[]> => {
    const merge: Dict<StatusValue[]> = {};
    for (const value of newValues) {
        const fixValue: StatusValue = {
            order: value.order,
            status: value.status,
            value: value.value,
        };

        const vector = merge[value.key];
        if (!vector) {
            merge[value.key] = [fixValue]
            continue;
        }
        vector.push(fixValue)
    }
    return merge;
}

export const joinStatusKeyValue = (newValues: StatusKeyValue[]): Dict<StatusValue> => {
    const merge: Dict<StatusValue> = {};
    for (const value of newValues) {
        merge[value.key] = {
            order: value.order,
            status: value.status,
            value: value.value,
        };
    }
    return merge;
}

export const detachStatusCategoryKeyValue = (dict: Dict<Dict<PrivateStatusValue>>): StatusCategoryKeyValue[] => {
    const vector: StatusCategoryKeyValue[] = [];
    if (dict == undefined) {
        return vector;
    }

    for (const [c, vs] of Object.entries(dict)) {
        for (const [k, v] of Object.entries(vs)) {
            vector.push({
                order: v.order,
                private: v.private,
                status: v.status,
                category: c,
                key: k,
                value: v.value
            })
        }
    }
    return vector;
}

export const mergeStatusCategoryKeyValue = (newValues: StatusCategoryKeyValue[]): Dict<Dict<PrivateStatusValue>> => {
    const merge: Dict<Dict<PrivateStatusValue>> = {};
    for (const value of newValues) {
        if (!merge[value.category]) {
            merge[value.category] = {};
        }
        merge[value.category][value.key] = {
            order: value.order,
            private: value.private,
            status: value.status,
            value: value.value,
        };
    }
    return merge;
}

export const mergeStatusCategoryKeyValueAsItem = (newValues: ItemStatusCategoryKeyValue[]): Dict<Dict<ItemStatusValue>> => {
    const merge: Dict<Dict<ItemStatusValue>> = {};
    for (const value of newValues) {
        if (!merge[value.category]) {
            merge[value.category] = {};
        }
        merge[value.category][value.key] = {
            id: value.id,
            order: value.order,
            status: value.status,
            value: value.value,
        };
    }
    return merge;
}

export const generateHash = async (obj: any) => {
    const sortedObj = deepSort(obj);

    const str = JSON.stringify(sortedObj);

    if (!window.isSecureContext || !window.crypto?.subtle) {
        return SHA256(str).toString();
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const deepSort = (obj: any): any => {
    if (obj === null) {
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map(deepSort).sort();
    } else if (typeof obj !== 'object') {
        return obj;
    }

    const sortedObj: any = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sortedObj[key] = deepSort(obj[key]);
        });

    return sortedObj;
}

export const downloadFile = (name: string, data: any) => {
    let str = `${data}`;
    let type = "";
    try {
        str = JSON.stringify(data, null, 2);
        type = "application/json";
    } catch (err) {
        console.error(err)
    }

    const blob = new Blob([str], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};

export const copyTextToClipboard = (text: string, onSuccess?: () => void, onError?: (err: any) => void) => {
    if (!navigator.clipboard) {
        return fallbackCopyTextToClipboard(text, onSuccess, onError);
    }

    navigator.clipboard.writeText(text).then(
        onSuccess,
        onError
    );
}

const fallbackCopyTextToClipboard = (text: string, onSuccess?: () => void, onError?: (err: any) => void) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand("copy");
        const msg = successful ? "successful" : "unsuccessful";
        if (!onSuccess) {
            console.log("Fallback: Copying text command was " + msg);
        } else {
            onSuccess();
        }
    } catch (err) {
        if (!onError) {
            console.error("Fallback: Oops, unable to copy", err);
        } else {
            onError(err);
        }
    }

    document.body.removeChild(textArea);
}

interface WindowSizeOptions {
    minWidth: number;
    maxWidth?: number;
    minHeight: number;
    maxHeight?: number
}

export const calculateWindowSize = (text: string, options: WindowSizeOptions): { width: number; height: number } => {
    const lines = text.split("\n");
    const maxLen = Math.max(...lines.map(l => l.length));

    const maxWidth = options.maxWidth ? options.maxWidth : window.screen.availWidth;
    const maxHeight = options.maxHeight ? options.maxHeight : window.screen.availHeight;

    let width = Math.max(maxLen * CHAR_WIDTH, options.minWidth);
    width = Math.min(width, maxWidth);

    let height = Math.max(lines.length * LINE_HEIGHT, options.minHeight)
    height = Math.min(height, maxHeight);

    return { width, height };
}

export const joinMessages = (...messages: string[][]) => {
    let title = "";

    for (const group of messages) {
        if (group.length == 0) {
            continue;
        }

        if (title != "") {
            title += "\n";
        }

        title += group.join("\n");
    }

    return title;
};
