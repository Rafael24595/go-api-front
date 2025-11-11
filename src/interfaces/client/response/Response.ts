import { detachStatusKeyValue, mergeStatusKeyValue } from "../../../services/Utils";
import { Dict } from "../../../types/Dict";
import { Headers } from "../request/Request"
import { StatusKeyValue } from "../../StatusKeyValue";

export interface SignedPayload<T> {
  owner: string;
  payload: T
}

export interface Response {
  _id: string;
  timestamp: number;
  request: string;
  date: number;
  time: number;
  status: number;
  headers: Headers;
  cookies: CookiesServer;
  body: Body;
  size: number;
  owner: string;
}

export interface ItemResponse {
  _id: string;
  timestamp: number;
  request: string;
  date: number;
  time: number;
  status: string;
  headers: StatusKeyValue[];
  cookies: CookieServer[];
  body: ItemBody;
  size: number;
  owner: string;
}

export interface CookiesServer {
  cookies: Dict<CookieServer>
}

export interface CookieServer {
  status: boolean,
  code: string,
  value: string,
  domain: string,
  path: string,
  expiration: string,
  maxage: number,
  secure: boolean,
  httponly: boolean,
  samesite: string
}

export interface Body {
  content_type: string;
  payload: string;
}

export function newItemResponse(owner: string): ItemResponse {
  return {
    _id: "",
    timestamp: NaN,
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
    timestamp: response.timestamp,
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
    timestamp: response.timestamp,
    request: response.request,
    date: response.date,
    time: response.time,
    status: Number(response.status),
    headers: { headers: mergeStatusKeyValue(response.headers) },
    cookies: { cookies: mergeCookies(response.cookies) },
    body: { content_type: response.body.content_type, payload: response.body.payload },
    size: response.size,
    owner: response.owner,
  }
}

export const mergeCookies = (newValues: CookieServer[]): Dict<CookieServer> => {
  const merge: Dict<CookieServer> = {};
  for (const value of newValues) {
    merge[value.code] = value;
  }
  return merge;
}

export function cookieToString(cookie: CookieServer): string {
  let cookieString = cookie.value;

  if (cookie.domain) {
    cookieString += `; Domain=${cookie.domain}`;
  }

  if (cookie.path) {
    cookieString += `; Path=${cookie.path}`;
  }

  if (cookie.expiration) {
    cookieString += `; Expires=${cookie.expiration}`;
  }

  if (cookie.maxage !== undefined) {
    cookieString += `; Max-Age=${cookie.maxage}`;
  }

  if (cookie.secure) {
    cookieString += `; Secure`;
  }

  if (cookie.httponly) {
    cookieString += `; HttpOnly`;
  }

  if (cookie.samesite && cookie.samesite !== "None") {
    cookieString += `; SameSite=${cookie.samesite}`;
  }

  return cookieString;
}
