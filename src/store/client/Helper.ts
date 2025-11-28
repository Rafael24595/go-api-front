import { CacheActionData, CacheRequestFocus } from "../../interfaces/client/Cache";
import { ItemRequest } from "../../interfaces/client/request/Request";
import { newItemResponse } from "../../interfaces/client/response/Response";
import { CACHE_CATEGORY_FOCUS } from "../Constants";
import { StoreProviderCacheType } from "../StoreProviderCache";
import { CACHE_CATEGORY_STORE, CACHE_KEY_FOCUS } from "./StoreProviderRequest";

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