import { ItemEndPoint } from "./EndPoint";

export interface CacheEndPointStore {
    backup: ItemEndPoint,
    endPoint: ItemEndPoint
}

export interface CacheEndPointFocus {
    endPoint: string
}
