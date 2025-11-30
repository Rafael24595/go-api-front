import { v4 as uuidv4 } from 'uuid';

import { HttpMethod } from "../../../constants/HttpMethod";
import { joinStatusKeyValue, collectStatusKeyValue, detachStatusKeyValue, mergeStatusKeyValue } from "../../../services/Utils";
import { Dict } from "../../../types/Dict";
import { fixOrder, ItemStatusKeyValue, toItem } from "../../StatusKeyValue";
import { StatusValue } from "../../StatusValue";

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

export interface LiteRequest {
  _id: string;
  timestamp: number;
  name: string;
  method: string;
  uri: string;
  owner: string;
  modified: number;
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
  body: ItemBody;
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
  parameters: Dict<Dict<BodyParameter[]>>
}

export interface ItemBody {
  status: boolean
  content_type: string
  parameters: Dict<ItemBodyParameter[]>
}

export interface BodyParameter {
	order: number
	status: boolean
	is_file: boolean
	file_type: string
  file_name: string
	value: string
}

export interface ItemBodyParameter {
  id: string
  order: number
  status: boolean
  isFile: boolean
  fileType: string
  fileName: string
  key: string
  value: string
  focus: string
}

export interface CleanItemBodyParameter {
    order: number
    status: boolean
    isFile: boolean
    fileType: string
    fileName: string
    key: string
    value: string
}

export interface Auths {
  status: boolean
  auths: Dict<Auth>
}

export interface Auth {
  status: boolean
  type: string
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
    body: { status: true, content_type: "", parameters: {} },
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
    body: { status: true, content_type: "", parameters: {} },
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
    body: fromBody(request.body),
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
    body: toBody(request.body),
    auth: request.auth,
    owner: request.owner,
    modified: request.modified,
    status: request.status,
  }
}

export const toBody = (body: ItemBody): Body => {
  return {
    status: body.status,
    content_type: body.content_type,
    parameters: toBodyParameters(body.parameters)
  }
}

export const toBodyParameters = (items: Dict<ItemBodyParameter[]>): Dict<Dict<BodyParameter[]>> => {
  const parameters: Dict<Dict<BodyParameter[]>> = {};
  for (const [key, category] of Object.entries(items)) {
    if(parameters[key] == undefined) {
      parameters[key] = {};
    }
    
    for (const item of category) {
      if(parameters[key][item.key] == undefined) {
        parameters[key][item.key] = [];
      }
      parameters[key][item.key].push(toBodyParameter(item));
    }
  }
  return parameters;
}

export const toBodyParameter = (parameter: ItemBodyParameter): BodyParameter => {
  return {
    order: parameter.order,
    status: parameter.status,
    is_file: parameter.isFile,
    file_type: parameter.fileType,
    file_name: parameter.fileName,
    value: parameter.value
  };
}

export const fromBody = (body: Body): ItemBody => {
  return {
    status: body.status,
    content_type: body.content_type,
    parameters: fromBodyParameters(body.parameters)
  }
}

export const fromBodyParameters = (parameters: Dict<Dict<BodyParameter[]>>): Dict<ItemBodyParameter[]> => {
  const newParameters:Dict<ItemBodyParameter[]> = {};
  for (const [key, category] of Object.entries(parameters)) {
    newParameters[key] = orderItemBodyParameter(Object.entries(category)
      .flatMap(fromBodyParameter)
      .sort((a, b) => a.order - b.order)
    );
  }
  return newParameters;
}

export const fromBodyParameter = ([key, parameter]: [string, BodyParameter[]]): ItemBodyParameter[] => {
  return parameter.map(p => {
    return {
      id: `${p.order}-${uuidv4()}`,
      order: p.order,
      status: p.status,
      isFile: p.is_file,
      fileType: p.file_type,
      fileName: p.file_name,
      key: key,
      value: p.value,
      focus: ""
    }
  });
}

export const orderItemBodyParameter = (parameters: ItemBodyParameter[]): ItemBodyParameter[] => {
  return parameters.map((item, i) => {
    item.order = i;
    return item;
  });
}

export const cloneItemBodyParameter = (parameters: ItemBodyParameter[]): ItemBodyParameter[] => {
    return [...parameters].map((r, i) => ({
        ...r,
        order: i,
        focus: "",
    }));
}
