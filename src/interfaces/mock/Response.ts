import { HttpStatusCode } from "axios";
import { ItemStatusKeyValue, StatusKeyValue } from "../StatusKeyValue";
import { ConditionStep } from "../../services/mock/ConditionStep";
import { deepClone } from "../../services/Utils";

export const DEFAULT_RESPONSE = "default";

export interface Response {
    order: number;
    status: boolean;
    code: number;
    timestamp: number;
    condition: string;
    name: string;
    description: string;
    headers: StatusKeyValue[];
    body: Body;
}

export interface Body {
    content_type: string;
    payload: string;
}

export interface ItemResponse {
    order: number;
    status: boolean;
    code: number;
    timestamp: number;
    condition: ConditionStep[];
    name: string;
    description: string;
    headers: ItemStatusKeyValue[];
    body: Body;
}

export const emptyItemResponse = (): ItemResponse => {
    return {
        order: -1,
        status: true,
        code: HttpStatusCode.Ok,
        timestamp: Date.now(),
        condition: [],
        name: "",
        description: "",
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
        status: true,
        code: HttpStatusCode.Ok,
        timestamp: Date.now(),
        condition: [],
        name: DEFAULT_RESPONSE,
        description: "Default response",
        headers: [],
        body: {
            content_type: "plain/text",
            payload: "Default response"
        }
    }
}

export const resolveResponses = (responses: ItemResponse[], response: ItemResponse) => {
    const index = responses.findIndex(r => r.order == response.order);
    if (index != -1 && (responses[index].name == response.name || responses[index].name != DEFAULT_RESPONSE)) {
        responses[index] = response;
    } else {
        responses.push(response);
    }

    return fixResponses(responses);
}

export const removeResponse = (responses: ItemResponse[], response: ItemResponse) => {
    const index = responses.findIndex(r => r.order == response.order);
    if (index == -1 || responses[index].name == DEFAULT_RESPONSE) {
        return responses;
    }

    responses.splice(2, 1);
    return fixResponses(responses);
}

export const fixResponses = (responses: ItemResponse[]): ItemResponse[] => {
    let newResponses = deepClone(responses);

    const index = newResponses.findIndex(r => r.name == DEFAULT_RESPONSE);

    let def: ItemResponse | undefined = undefined;
    if (index != -1) {
        def = newResponses.splice(index, 1)[0];
    }

    if (def == undefined) {
        def = defaultItemResponse()
    }

    def.status = true;
    def.order = 0;

    newResponses = newResponses.filter(r => r.name != DEFAULT_RESPONSE);

    newResponses.map((r, i) => r.order = r.order < 0 ? responses.length : i);
    newResponses.sort((a, b) => a.order - b.order);
    newResponses.unshift(def);
    newResponses.map((r, i) => r.order = i);

    return newResponses
}
