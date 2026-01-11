import { emptyItemEndPoint, ItemEndPoint } from "../../../interfaces/mock/EndPoint";
import { UserData } from "../../../interfaces/system/UserData";
import { deepClone } from "../../../services/Utils";

export const CACHE_CATEGORY_STORE = "StoreEndPoint";
export const CACHE_KEY_FOCUS = "FocusEndPoint";

export interface PayloadData {
    initialHash: string;
    actualHash: string;
    backup: ItemEndPoint;
    endPoint: ItemEndPoint;
}

export const newEndPointData = (userData: UserData): PayloadData => {
    const endPoint = emptyItemEndPoint(userData.username);
    return clearEndPointData(endPoint);
};

export const clearEndPointData = (endPoint: ItemEndPoint, backup?: ItemEndPoint): PayloadData => {
    return {
        initialHash: "",
        actualHash: "",
        backup: deepClone(backup || endPoint),
        endPoint: deepClone(endPoint),
    }
};
