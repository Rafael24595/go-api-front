import { HttpMethod } from "../../constants/HttpMethod";
import { Dict } from "../../types/Dict";
import { StatusKeyValue } from "../StatusKeyValue";

export interface Request {
  id: string;
  timestamp: number;
  name: string;
  method: HttpMethod;
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
  cookies: Dict<StatusKeyValue[]>
}

export interface Body {
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

type Status = 'historic' | 'saved';
