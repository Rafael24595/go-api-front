import { StatusKeyValue } from "../interfaces/StatusKeyValue";
import { Dict } from "../types/Dict";

export function detachStatusKeyValue(dict: Dict<StatusKeyValue[]>): StatusKeyValue[] {
    const vector = [];
    for (const values of Object.values(dict)) {
        for (const value of values) {
            vector.push(value)
        }
    }
    return vector;
}