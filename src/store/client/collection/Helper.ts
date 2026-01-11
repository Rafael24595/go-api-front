import { LiteItemCollection } from "../../../interfaces/client/collection/Collection";
import { LiteRequest } from "../../../interfaces/client/request/Request";

export interface PayloadRequest {
    items: LiteRequest[];
    hash: string;
}

export interface PayloadCollection {
    items: LiteItemCollection[];
    hash: string;
}