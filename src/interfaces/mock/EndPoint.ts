import { HttpMethod } from "../../constants/HttpMethod";
import { Dict } from "../../types/Dict";

export interface EndPoint {
    _id: string;
    timestamp: number;
    modified: number;
    name: string;
    method: string;
    path: string;
    responses: Dict<Response>;
    safe: boolean;
    owner: string;
}

export const emptyEndPoint = (owner: string): EndPoint => {
    return {
        _id: "",
        timestamp: 0,
        modified: 0,
        name: "",
        method: HttpMethod.GET,
        path: "",
        responses: {},
        safe: false,
        owner: owner,
    }
}

export interface LiteEndPoint {
    _id: string;
    timestamp: number;
    name: string;
    method: string;
    path: string;
    responses: string[];
    safe: boolean;
    owner: string;
}