import { HttpStatusCode } from "axios";
import { ItemStatusKeyValue, StatusKeyValue } from "../StatusKeyValue";
import { ConditionStep } from "../../services/mock/ConditionStep";
import { deepClone } from "../../services/Utils";
import { Dict } from "../../types/Dict";

export const DEFAULT_RESPONSE = "default";

export interface Response {
    order: number;
    status: boolean;
    code: number;
    timestamp: number;
    condition: string;
    name: string;
    description: string;
    arguments: StatusKeyValue[];
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
    arguments: ItemStatusKeyValue[];
    body: Body;
}

export const emptyItemResponse = (): ItemResponse => {
    return {
        order: -1,
        status: true,
        code: HttpStatusCode.Ok,
        timestamp: 0,
        condition: [],
        name: "",
        description: "",
        arguments: [],
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
        timestamp: 0,
        condition: [],
        name: DEFAULT_RESPONSE,
        description: "Default response",
        arguments: [],
        body: {
            content_type: "plain/text",
            payload: "Default response"
        }
    }
}

export const resolveResponses = (responses: ItemResponse[], response: ItemResponse) => {
    const index = responses.findIndex(r => r.name == response.name);
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

    return fixResponsesName(newResponses);
}

const fixResponsesName = (responses: ItemResponse[]) => {
	const cache: Dict<boolean> = {};

    for (let i = 0; i < responses.length; i++) {
        const name = fixResponseName(responses[i], cache)
        responses[i].name = name;
        cache[name] = true;
    }

	return responses;
}

const fixResponseName = (response: ItemResponse, cache: Dict<boolean>): string => {
	let name = response.name;
	let count = 1;

    while (cache[name]) {   
        name = `${response.name}-copy-${count}`;
        count++
    }

	return name;
}