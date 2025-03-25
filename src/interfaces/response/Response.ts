import { detachStatusKeyValue, mergeStatusKeyValue } from "../../services/Utils";
import { Cookie, Cookies, Headers, mergeCookies } from "../request/Request"
import { StatusKeyValue } from "../StatusKeyValue";

export interface Response {
    _id: string;
    request: string;
    date: number;
    time: number;
    status: number;
    headers: Headers;
    cookies: Cookies;
    body: Body;
    size: number;
    owner: string;
}

export interface ItemResponse {
    _id: string;
    request: string;
    date: number;
    time: number;
    status: string;
    headers: StatusKeyValue[];
    cookies: Cookie[];
    body: ItemBody;
    size: number;
    owner: string;
}

export interface Body {
    status: boolean;
    content_type: string;
    payload: string;
}

export function newItemResponse(owner: string): ItemResponse {
  return {
    _id: "",
    request: "",
    date: NaN,
    time: NaN,
    status: "",
    headers: [],
    cookies: [],
    body: {
        content_type: "text",
        payload: ""
    },
    size: NaN,
    owner: owner,
  }
}

export interface ItemBody {
    content_type: string;
    payload: string;
}

export const fromResponse = (response: Response): ItemResponse => {
  return {
    _id: response._id,
    request: response.request,
    date: response.date,
    time: response.time,
    status: `${response.status}`,
    headers: detachStatusKeyValue(response.headers.headers),
    cookies: response && response.cookies.cookies ? Object.values(response.cookies.cookies) : [],
    body: response.body,
    size: response.size,
    owner: response.owner,
  }
}

export const toResponse = (response: ItemResponse): Response => {
  return {
    _id: response._id,
    request: response.request,
    date: response.date,
    time: response.time,
    status: Number(response.status),
    headers: { headers: mergeStatusKeyValue(response.headers) },
    cookies: { cookies: mergeCookies(response.cookies) },
    body: { status: true, content_type: response.body.content_type, payload: response.body.payload },
    size: response.size,
    owner: response.owner,
  }
}

