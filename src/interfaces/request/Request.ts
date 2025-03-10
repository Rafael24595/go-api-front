import { HttpMethod } from "../../constants/HttpMethod";
import { Dict } from "../../types/Dict";
import { StatusKeyValue } from "../StatusKeyValue";

type Status = 'draft' | 'final';

export interface Request {
  _id?: string;
  timestamp: number;
  name: string;
  method: string;
  uri: string;
  query: Queries;
  header: Headers;
  cookie: Cookies;
  body: Body;
  auth: Auths;
  status: Status;
}

export interface Queries {
  queries: Dict<StatusKeyValue[]>
}

export interface Headers {
  headers: Dict<StatusKeyValue[]>
}

export interface Cookies {
  cookies: Dict<Cookie>
}

export interface Cookie {
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
  contentType: string
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

export function newRequest(): Request {
  return {
    _id: "",
    timestamp: 0,
    name: "",
    method: HttpMethod.GET,
    uri: "",
    query: { queries: {} },
    header: { headers: {} },
    auth: { status: true, auths: {} },
    body: { status: true, contentType: "", payload: "" },
    cookie: { cookies: {} },
    status: "draft"
  }
}

export function cookieToString(cookie: Cookie): string {
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
