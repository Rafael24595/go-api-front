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

  interface Queries { 
    queries: Dict<StatusKeyValue[]>
  }
  
  interface Headers {
    headers: Dict<StatusKeyValue[]>
  }
  
  interface Cookies {
    cookies: Dict<StatusKeyValue[]>
  }
  
  interface Body {
    contentType: string
    payload: string
  }
  
  interface Auths {
    status: boolean
    cookies: Dict<Auth[]>
  }

  interface Auth {
	status: boolean
	code: string
	parameters: Dict<string>
}
  
  type Status = 'historic' | 'saved';

  