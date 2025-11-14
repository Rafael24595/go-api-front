import { HttpStatusCode } from "axios";
import { ItemStatusKeyValue, StatusKeyValue } from "../StatusKeyValue";
import { ConditionStep } from "../../services/mock/ConditionStep";

export const DEFAULT_RESPONSE = "default";

export interface Response {
    order: number;
    status: number;
    timestamp: number;
    condition: string;
    name: string;
    headers: StatusKeyValue[];
    body: Body;
}

export interface Body {
    content_type: string;
    payload: string;
}

export interface ItemResponse {
    order: number;
    status: number;
    timestamp: number;
    condition: ConditionStep[];
    name: string;
    headers: ItemStatusKeyValue[];
    body: Body;
}

export const emptyItemResponse = (): ItemResponse => {
    return {
        order: -1,
        status: HttpStatusCode.Ok,
        timestamp: Date.now(),
        condition: [],
        name: "",
        headers: [],
        body: {
            content_type: "plain/text",
            payload: ""
        }
    }
}

export const defaultItemResponse = (): ItemResponse => {
    return {
        order: -1,
        status: HttpStatusCode.Ok,
        timestamp: Date.now(),
        condition: [],
        name: DEFAULT_RESPONSE,
        headers: [],
        body: {
            content_type: "plain/text",
            payload: "Default response"
        }
    }
}

export const fixResponses = (responses: ItemResponse[]): ItemResponse[] => {
    let newResponses = [...responses];

    const index = newResponses.findIndex(r => r.name == DEFAULT_RESPONSE);

    let def: ItemResponse | undefined = undefined;
    if (index != -1) {
        def = newResponses.splice(index, 1)[0];
    }

    if (def == undefined) {
        def = defaultItemResponse()
    }

    def.order = 0;

    newResponses = newResponses.filter(r => r.name != DEFAULT_RESPONSE);

    newResponses.map((r, i) => r.order = r.order < 0 ? responses.length : i);
    newResponses.sort((a, b) => a.order - b.order);
    newResponses.unshift(def);
    newResponses.map((r, i) => r.order = i);

    return newResponses
}
