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