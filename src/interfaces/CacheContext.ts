import { ItemContext } from "./context/Context";

export interface CacheContext {
    parent: string,
    backup: ItemContext,
    context: ItemContext,
}