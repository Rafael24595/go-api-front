import { ItemRequest } from "./request/Request";
import { ItemResponse } from "./response/Response";

export interface CacheActionData {
    parent: string,
    backup: ItemRequest,
    request: ItemRequest,
    response: ItemResponse
}