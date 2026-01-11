import { CacheActionData, CacheRequestFocus } from "../../../interfaces/client/Cache";
import { ItemRequest } from "../../../interfaces/client/request/Request";
import { ItemResponse, newItemResponse } from "../../../interfaces/client/response/Response";
import { Optional } from "../../../types/Optional";
import { CACHE_CATEGORY_FOCUS } from "../../Constants";
import { StoreProviderCacheType } from "../../StoreProviderCache";

export interface Payload {
    initialHash: string
    actualHash: string
    parent: string,
    backup: ItemRequest;
    request: ItemRequest;
    response: ItemResponse;
    context: Optional<string>
}

export const CACHE_CATEGORY_STORE = "StoreRequest";
export const CACHE_KEY_FOCUS = "FocusRequest";

export const cacheAndFocus = async (request: ItemRequest, cache: StoreProviderCacheType) => {
    cache.insert<CacheActionData>(CACHE_CATEGORY_STORE, request._id, {
        parent: "",
        backup: request,
        request: request,
        response: newItemResponse(request.owner),
    });

    cache.insert<CacheRequestFocus>(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS, {
        request: request._id,
        parent: "",
        context: "",
        reason: "event"
    })
}