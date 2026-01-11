import { LiteEndPoint } from "../../../interfaces/mock/EndPoint";

export interface PayloadEndPoint {
    items: LiteEndPoint[];
    hash: string;
}

export const cleanEndPoints = (): PayloadEndPoint => {
    return {
        items: [],
        hash: ""
    }
}