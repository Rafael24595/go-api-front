import { HttpMethod } from "../../constants/HttpMethod";
import { Dict } from "../../types/Dict";
import { defaultItemResponse, ItemResponse, Response } from "./Response";

export interface EndPoint {
    _id: string;
    order: number;
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
        order: 0,
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
    order: number;
    timestamp: number;
    name: string;
    method: string;
    path: string;
    responses: string[];
    safe: boolean;
    owner: string;
}

export interface ItemEndPoint {
    _id: string;
    order: number;
    timestamp: number;
    modified: number;
    name: string;
    method: string;
    path: string;
    responses: ItemResponse[];
    safe: boolean;
    owner: string;
}

export const emptyItemEndPoint = (owner: string): ItemEndPoint => {
    return {
        _id: "",
        order: 0,
        timestamp: 0,
        modified: 0,
        name: "",
        method: HttpMethod.GET,
        path: "",
        responses: [
            defaultItemResponse()
        ],
        safe: false,
        owner: owner,
    }
}

export const EndPointFilter = [ "timestamp", "name", "method", "path", "safe" ]
