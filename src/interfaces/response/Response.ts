import { Cookies, Headers } from "../request/Request"

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

export interface Body {
    status: boolean;
    content_type: string;
    payload: string;
  }