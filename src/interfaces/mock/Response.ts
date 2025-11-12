import { HttpStatusCode } from "axios";
import { ItemStatusKeyValue, StatusKeyValue } from "../StatusKeyValue";
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_RESPONSE = "default";

export interface Response {
    status: number;
    headers: StatusKeyValue[];
    body: Body;
}

export interface Body {
    content_type: string;
    payload: string;
}

export interface ItemResponse {
    status: number;
    name: string;
    condition: string;
    headers: ItemStatusKeyValue[];
    body: Body;
}

export const emptyItemResponse = (): ItemResponse => {
    return {
        condition: "",
        name: `${uuidv4()}`,
        status: HttpStatusCode.Ok,
        headers: [],
        body: {
            content_type: "plain/text",
            payload: ""
        }
    }
}

export const defaultItemResponse = (): ItemResponse => {
    return {
        condition: DEFAULT_RESPONSE,
        name: "default",
        status: HttpStatusCode.Ok,
        headers: [],
        body: {
            content_type: "plain/text",
            payload: ""
        }
    }
}
