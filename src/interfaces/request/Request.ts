import { HttpMethod } from "../../constants/HttpMethod";
import { joinStatusKeyValue, collectStatusKeyValue, detachStatusKeyValue, mergeStatusKeyValue } from "../../services/Utils";
import { Dict } from "../../types/Dict";
import { fixOrder, ItemStatusKeyValue, toItem } from "../StatusKeyValue";
import { StatusValue } from "../StatusValue";

type Status = 'draft' | 'final';

export interface Request {
  _id: string;
  timestamp: number;
  name: string;
  method: string;
  uri: string;
  query: Queries;
  header: Headers;
  cookie: CookiesClient;
  body: Body;
  auth: Auths;
  owner: string;
  modified: number;
  status: Status;
}

export interface ItemRequest {
  _id: string;
  timestamp: number;
  name: string;
  method: string;
  uri: string;
  query: ItemStatusKeyValue[];
  header: ItemStatusKeyValue[];
  cookie: ItemStatusKeyValue[];
  body: Body;
  auth: Auths;
  owner: string;
  modified: number;
  status: Status;
}

export interface Queries {
  queries: Dict<StatusValue[]>
}

export interface Headers {
  headers: Dict<StatusValue[]>
}

export interface CookiesClient {
  cookies: Dict<StatusValue>
}

export interface CookieClient {
	status:     boolean,
	code:       string,
	value:      string,
	domain:     string,
	path:       string,
	expiration: string,
	maxage:     number,
	secure:     boolean,
	httponly:   boolean,
	samesite:   string
}

export interface Body {
  status: boolean
  content_type: string
  payload: string
}

export interface Auths {
  status: boolean
  auths: Dict<Auth>
}

export interface Auth {
  status: boolean
  code: string
  parameters: Dict<string>
}

export function newRequest(owner: string, name?: string): Request {
  return {
    _id: "",
    timestamp: Date.now(),
    name: name || "",
    method: HttpMethod.GET,
    uri: "",
    query: { queries: {} },
    header: { headers: {} },
    auth: { status: true, auths: {} },
    body: { status: true, content_type: "", payload: "" },
    cookie: { cookies: {} },
    owner: owner,
    modified: 0,
    status: "draft"
  }
}

export function newItemRequest(owner: string, name?: string): ItemRequest {
  return {
    _id: "",
    timestamp: Date.now(),
    name: name || "",
    method: HttpMethod.GET,
    uri: "",
    query: [],
    header: [],
    auth: { status: true, auths: {} },
    body: { status: true, content_type: "", payload: "" },
    cookie: [],
    owner: owner,
    modified: 0,
    status: "draft"
  }
}

export const fromRequest = (request: Request): ItemRequest => {
  return {
    _id: request._id,
    timestamp: request.timestamp,
    name: request.name,
    method: request.method,
    uri: request.uri,
    query: fixOrder(toItem(detachStatusKeyValue(request.query.queries))),
    header: fixOrder(toItem(detachStatusKeyValue(request.header.headers))),
    cookie: fixOrder(toItem(collectStatusKeyValue(request.cookie.cookies))),
    body: request.body,
    auth: request.auth,
    owner: request.owner,
    modified: request.modified,
    status: request.status,
  }
}

export const toRequest = (request: ItemRequest): Request => {
  return {
    _id: request._id,
    timestamp: request.timestamp,
    name: request.name,
    method: request.method,
    uri: request.uri,
    query: { queries: mergeStatusKeyValue(request.query) },
    header: { headers: mergeStatusKeyValue(request.header) },
    cookie: { cookies: joinStatusKeyValue(request.cookie) },
    body: request.body,
    auth: request.auth,
    owner: request.owner,
    modified: request.modified,
    status: request.status,
  }
}
