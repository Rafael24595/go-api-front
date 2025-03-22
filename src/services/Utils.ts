import { StatusCategoryKeyValue } from "../interfaces/StatusCategoryKeyValue";
import { StatusKeyValue } from "../interfaces/StatusKeyValue";
import { StatusValue } from "../interfaces/StatusValue";
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
            })
        }
    }
    return vector;
}

export const mergeStatusKeyValue = (newValues: StatusKeyValue[]): Dict<StatusKeyValue[]> => {
    const merge: Dict<StatusKeyValue[]> = {};
    for (const value of newValues) {
        const vector = merge[value.key];
        if(!vector) {
            merge[value.key] = [value]
            continue;
        }
        vector.push(value)
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
        merge[value.category][value.key] = value;
    }
    return merge;
}

export async function generateHash(obj: any) {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}