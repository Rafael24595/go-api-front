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
                status: v.status,
                key: k,
                value: v.value
            })
        }
    }
    return vector;
}