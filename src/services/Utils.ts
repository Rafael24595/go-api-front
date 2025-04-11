import { ItemStatusCategoryKeyValue, StatusCategoryKeyValue } from "../interfaces/StatusCategoryKeyValue";
import { StatusKeyValue } from "../interfaces/StatusKeyValue";
import { ItemStatusValue, StatusValue } from "../interfaces/StatusValue";
import { Dict } from "../types/Dict";

export function detachStatusKeyValue(dict: Dict<StatusValue[]>): StatusKeyValue[] {
    const vector: StatusKeyValue[] = [];
    if(dict == undefined) {
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

export function collectStatusKeyValue(dict: Dict<StatusValue>): StatusKeyValue[] {
    const vector: StatusKeyValue[] = [];
    if(dict == undefined) {
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
        if(!vector) {
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

export function detachStatusCategoryKeyValue(dict: Dict<Dict<StatusValue>>): StatusCategoryKeyValue[] {
    const vector: StatusCategoryKeyValue[] = [];
    if(dict == undefined) {
        return vector;
    }

    for (const [c, vs] of Object.entries(dict)) {
        for (const [k, v] of Object.entries(vs)) {
            vector.push({
                order: v.order,
                status: v.status,
                category: c,
                key: k,
                value: v.value
            })
        }
    }
    return vector;
}

export const mergeStatusCategoryKeyValue = (newValues: StatusCategoryKeyValue[]): Dict<Dict<StatusValue>> => {
    const merge: Dict<Dict<StatusValue>> = {};
    for (const value of newValues) {
        if(!merge[value.category]) {
            merge[value.category] = {};
        }
        merge[value.category][value.key] = {
            order: value.order,
            status: value.status,
            value: value.value,
        };
    }
    return merge;
}

export const mergeStatusCategoryKeyValueAsItem = (newValues: ItemStatusCategoryKeyValue[]): Dict<Dict<ItemStatusValue>> => {
    const merge: Dict<Dict<ItemStatusValue>> = {};
    for (const value of newValues) {
        if(!merge[value.category]) {
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

export async function generateHash(obj: any) {
    const sortedObj = deepSort(obj);

    const str = JSON.stringify(sortedObj);
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function deepSort(obj: any): any {
    if(obj === null) {
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map(deepSort).sort();
    } else if(typeof obj !== 'object') {
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
