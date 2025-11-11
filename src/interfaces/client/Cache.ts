import { ItemContext } from "./context/Context";
import { ItemRequest } from "./request/Request";
import { ItemResponse } from "./response/Response";

export interface CacheActionData {
    parent: string,
    backup: ItemRequest,
    request: ItemRequest,
    response: ItemResponse
}

export interface CacheContext {
    parent: string,
    backup: ItemContext,
    context: ItemContext,
}

export interface CacheRequestFocus {
    request: string,
    parent?: string,
    context?: string
}
