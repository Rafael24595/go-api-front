import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { generateHash } from "../services/Utils";
import { Auths, fromRequest, ItemBody, ItemRequest, newItemRequest, newRequest, Request, toRequest } from "../interfaces/request/Request";
import { cleanCopy, ItemStatusKeyValue } from "../interfaces/StatusKeyValue";
import { fixOrder } from "../interfaces/StatusKeyValue";
import { fromResponse, ItemResponse, newItemResponse, Response, toResponse } from "../interfaces/response/Response";
import { findAction, insertAction, pushHistoric } from "../services/api/ServiceStorage";
import { ResponseExecuteAction, ResponseFetch } from "../services/api/Responses";
import { useStoreCache } from "./StoreProviderCache";
import { Optional } from "../types/Optional";
import { CacheActionData } from "../interfaces/CacheActionData";
import { useStoreSession } from "./StoreProviderSession";
import { useStoreContext } from "./StoreProviderContext";
import { useStoreRequests } from "./StoreProviderRequests";
import { useAlert } from "../components/utils/alert/Alert";
import { executeFormAction } from "../services/api/ServiceManager";
import { EAlertCategory } from "../interfaces/AlertData";

const TRIGGER_KEY_VIEW = "StoreProviderRequestViewTrigger";
const TRIGGER_KEY_CACHE = "StoreProviderRequestCacheTrigger";
const CACHE_KEY = "StoreProviderRequestCache";

const VOID_FUNCTION = () => { };

interface StoreProviderRequestType {
  initialHash: string;
  actualHash: string;
  parent: string,
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
  waitingRequest: boolean;
  cancelRequest: () => void;
  cleanRequest: () => void;
  discardRequest: () => void;
  defineFreeRequest: (request: Request, response?: Response, oldRequest?: Request) => void;
  defineGroupRequest: (parent: string, context: string, request: Request, response?: Response, oldRequest?: Request) => void;
  updateRequest: (newRequest: Request, newResponse?: Response, oldRequest?: Request) => void;
  updateName: (name: string) => void;
  updateMethod: (method: string) => void;
  updateUri: (uri: string) => void;
  updateQuery: (items: ItemStatusKeyValue[]) => void;
  updateHeader: (items: ItemStatusKeyValue[]) => void;
  updateCookie: (items: ItemStatusKeyValue[]) => void;
  updateBody: (body: ItemBody) => void;
  updateAuth: (auth: Auths) => void;
  executeAction: () => Promise<void>;
  fetchFreeRequest: (request: Request) => Promise<void>;
  fetchGroupRequest: (parent: string, context: string, request: Request) => Promise<void>;
  releaseAction: () => Promise<ResponseExecuteAction>;
  insertRequest: (request: Request, response?: Response) => Promise<ResponseExecuteAction>;
  isParentCached: (parent: string) => boolean;
  isCached: (request: Request) => boolean;
  cacheComments: () => string[];
  cacheLenght: () => number;
  processUri: () => void;
}

interface Payload {
  initialHash: string
  actualHash: string
  parent: string,
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
}

interface PayloadFectch {
  waiting: boolean;
  cancel: () => void;
}

const StoreRequest = createContext<StoreProviderRequestType | undefined>(undefined);

export const StoreProviderRequest: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData, pushTrigger } = useStoreSession();
  const { fetchContext } = useStoreContext();
  const { getContext } = useStoreContext();
  const { fetchAll } = useStoreRequests();

  const { push } = useAlert();

  const { gather, search, exists, insert, excise, remove, length } = useStoreCache();

  const [data, setData] = useState<Payload>({
    initialHash: "",
    actualHash: "",
    parent: "",
    backup: newItemRequest(userData.username),
    request: newItemRequest(userData.username),
    response: newItemResponse(userData.username),
  });

  const [dataFetch, setDataFetch] = useState<PayloadFectch>({
    waiting: false,
    cancel: VOID_FUNCTION
  });

  useEffect(() => {
    pushTrigger(TRIGGER_KEY_VIEW, cleanRequest);
    pushTrigger(TRIGGER_KEY_CACHE, cleanCache);
  }, []);

  useEffect(() => {
    updateStatus(data.request);
  }, [data.request]);

  const updateStatus = async (request: ItemRequest) => {
    let initialHash = data.initialHash;
    if (data.initialHash == "") {
      initialHash = await calculateHash(data.backup);
    }

    const actualHash = await calculateHash(data.request);

    if (actualHash != initialHash) {
      insert(CACHE_KEY, request._id, {
        parent: data.parent,
        backup: data.backup,
        request: request,
        response: data.response
      });
    } else {
      remove(CACHE_KEY, request._id);
    }

    setData(prevData => ({
      ...prevData,
      initialHash,
      actualHash
    }));
  }

  const calculateHash = async (request: ItemRequest) => {
    return await generateHash(toRequest(request));
  }

  const cleanRequest = () => {
    defineFreeRequest(newRequest(userData.username));
  }

  const cleanCache = () => {
    excise(CACHE_KEY);
  }

  const discardRequest = () => {
    releaseItemRequest(data.backup, data.response, toRequest(data.request));
  }

  const defineFreeRequest = (request: Request, response?: Response, oldRequest?: Request) => {
    defineRequest(request, response, oldRequest);
  }

  const defineGroupRequest = (parent: string, context: string, request: Request, response?: Response, oldRequest?: Request) => {
    defineRequest(request, response, oldRequest, parent, context);
  }

  const defineRequest = (request: Request, response?: Response, oldRequest?: Request, parent?: string, context?: string) => {
    const itemRequest = fromRequest(request);
    const itemResponse = response ? fromResponse(response) : newItemResponse(userData.username);
    defineItemRequest(itemRequest, itemRequest, itemResponse, oldRequest, parent, context);
  }

  const defineItemRequest = (backup: ItemRequest, request: ItemRequest, response?: ItemResponse, oldRequest?: Request, parent?: string, context?: string) => {
    const loadResponse = dataFetch.waiting && data.request._id == request._id;
    response = loadResponse ? undefined : response;
    
    response = !response ? newItemResponse(userData.username) : response;

    evalueCancelRequest(request);

    setData(prevData => {
      if (oldRequest && oldRequest._id != request._id) {
        remove(CACHE_KEY, oldRequest._id);
      }

      return {
        ...prevData,
        initialHash: "",
        actualHash: "",
        parent: parent || "",
        backup: { ...backup },
        request: { ...request },
        response: { ...response },
      }
    });

    fetchContext(context, parent);
  }

  const updateRequest = (request: Request, response?: Response, oldRequest?: Request) => {
    const itemRequest = fromRequest(request);
    const itemResponse = response ? fromResponse(response) : newItemResponse(userData.username);
    updateItemRequest(itemRequest, itemResponse, oldRequest)
  }

  const updateItemRequest = (request: ItemRequest, response?: ItemResponse, oldRequest?: Request) => {
    const loadResponse = dataFetch.waiting && data.request._id == request._id;
    response = loadResponse ? undefined : response;

    response = !response ? newItemResponse(userData.username) : response;

    evalueCancelRequest(request);

    setData(prevData => {
      if (oldRequest && oldRequest._id != request._id) {
        remove(CACHE_KEY, oldRequest._id);
      }

      return {
        ...prevData,
        request: request,
        response: response
      }
    });
  }

  const releaseRequest = (request: Request, response: Response, oldRequest: Request) => {
    const itemRequest = fromRequest(request);
    const itemResponse = fromResponse(response);
    releaseItemRequest(itemRequest, itemResponse, oldRequest)
  }

  const releaseItemRequest = (request: ItemRequest, response: ItemResponse, oldRequest: Request) => {
    const loadResponse = dataFetch.waiting && data.request._id == request._id;
    response = loadResponse ? newItemResponse(userData.username) : response;

    setData(prevData => {
      if (oldRequest && oldRequest._id != request._id) {
        remove(CACHE_KEY, oldRequest._id);
      }

      return {
        ...prevData,
        initialHash: "",
        actualHash: "",
        backup: { ...request },
        request: { ...request },
        response: { ...response },
      }
    });
  }

  const evalueCancelRequest = (newRequest: ItemRequest): boolean => {
    if (data.request._id == newRequest._id) {
      return false;
    }

    dataFetch.cancel();

    cleanFetchData();

    if (dataFetch.waiting) {
      push({
        category: EAlertCategory.WARN,
        content: "Request cancelled"
      });
    }

    return true;
  }

  const fixRequest = (request: Request, oldRequest?: Request) => {
    const itemRequest = fromRequest(request);
    setData(prevData => {
      if (oldRequest && oldRequest._id != request._id) {
        remove(CACHE_KEY, oldRequest._id);
      }
      return {
        ...prevData,
        request: {
          ...prevData.request,
          _id: itemRequest._id,
          modified: itemRequest.modified,
          owner: itemRequest.owner,
          timestamp: itemRequest.timestamp
        }
    }});
  }

  const updateResponse = (response?: Response) => {
    const itemResponse = response ? fromResponse(response) : newItemResponse(userData.username);
    setData(prevData => ({
      ...prevData,
      response: itemResponse
    }));
  }

  const updateName = (name: string) => {
    setData(prevData => ({
      ...prevData,
      request: {
        ...prevData.request,
        name
      }
    }));
  };

  const updateMethod = (method: string) => {
    setData(prevData => ({
      ...prevData,
      request: {
        ...prevData.request,
        method
      }
    }));
  };

  const updateUri = (uri: string) => {
    setData(prevData => ({
      ...prevData,
      request: {
        ...prevData.request,
        uri
      }
    }));
  };

  const updateQuery = (items: ItemStatusKeyValue[]) => {
    setData(prevData => ({
      ...prevData,
      request: {
        ...prevData.request,
        query: items
      }
    }));
  };

  const updateHeader = (items: ItemStatusKeyValue[]) => {
    setData(prevData => ({
      ...prevData,
      request: {
        ...prevData.request,
        header: items
      }
    }));
  };

  const updateCookie = (items: ItemStatusKeyValue[]) => {
    setData(prevData => ({
      ...prevData,
      request: {
        ...prevData.request,
        cookie: items
      }
    }));
  };

  const updateBody = (body: ItemBody) => {
    setData(prevData => ({
      ...prevData,
      request: {
        ...prevData.request,
        body
      }
    }));
  };

  const updateAuth = (auth: Auths) => {
    setData(prevData => ({
      ...prevData,
      request: {
        ...prevData.request,
        auth
      }
    }));
  };

  const fetchFreeRequest = async (request: Request) => {
    fetchRequest(request);
  }

  const fetchGroupRequest = async (parent: string, context: string, request: Request) => {
    fetchRequest(request, parent, context);
  }

  const fetchRequest = async (request: Request, parent?: string, context?: string) => {
    const cached: Optional<CacheActionData> = search(CACHE_KEY, request._id);
    if (cached != undefined) {
      defineItemRequest(cached.backup, cached.request, cached.response, undefined, cached.parent, context);
      return;
    }

    const apiResponse = await findAction(request);
    defineRequest(apiResponse.request, apiResponse.response, undefined, parent, context);
  }

  const executeAction = async () => {
    const context = getContext();
    const base = toRequest(data.request);
    const request = { ...base };

    if (request.name == "") {
      request.name = `temp-${request.method}-${request.timestamp}`;
    }

    updateRequest(request);

    let fetchResponse = executeFormAction(request, context);

    defineFetchData(fetchResponse);

    let apiResponse = await fetchResponse.promise.catch(e => {
      if (e == undefined) {
        return;
      }
      push({
        title: `[${e.statusCode}] ${e.statusText}`,
        category: EAlertCategory.ERRO,
        content: e.message,
      })
    });

    cleanFetchData();

    if (!apiResponse) {
      return;
    }

    updateResponse(apiResponse.response);

    apiResponse = await pushHistoric(request, apiResponse.response);

    fixRequest(apiResponse.request, base);

    fetchAll();
  };
  
  const releaseAction = async () => {
    const request = toRequest(data.request);
    const response = toResponse(data.response);

    let apiResponse = await insertRequest(request, response);

    const fixRequest = { ...request };
    const fixResponse = { ...response };

    fixRequest._id = apiResponse.request._id;
    fixRequest.name = apiResponse.request.name;

    releaseRequest(fixRequest, fixResponse, request);

    apiResponse = await pushHistoric(apiResponse.request, apiResponse.response);

    fetchAll();

    return apiResponse;
  };

  const insertRequest = async (request: Request, response?: Response): Promise<ResponseExecuteAction> => {
    if (request.status == "draft") {
      const name = prompt("Insert a name: ", request.name);
      if (name == null && name != request.name) {
        return {
          request: request,
          response: response
        };
      }
      request.name = name;
    }
    return await insertAction(request, response);
  };

  const processUri = () => {
    const url = new URL(data.request.uri);
    const queryParams = new URLSearchParams(url.search);

    let newQueries = cleanCopy(data.request.query);
    let counter = 0;

    for (const [key, value] of queryParams.entries()) {
      const item: ItemStatusKeyValue = {
        id: "",
        order: counter,
        status: true,
        key: key,
        value: value,
        focus: "",
      };
      newQueries.push(item);
      counter++;
    }

    newQueries = fixOrder(newQueries);

    updateUri(url.toString());
    updateQuery(newQueries);
  }

  const isParentCached = (parent: string) => {
    return exists(CACHE_KEY, (_: string, i: CacheActionData) => i.parent == parent);
  }

  const isCached = (request: Request) => {
    return search(CACHE_KEY, request._id) != undefined;
  }

  const cacheComments = () => {
    const requests: CacheActionData[] = gather(CACHE_KEY);
    return requests.map(cacheComment);
  }

  const cacheComment = (cached: CacheActionData) => {
    let collected = " ";
    if (cached.parent != undefined && cached.parent != "") {
      collected = " collected ";
    }

    let name = cached.request.name;
    if (name == undefined || name == "") {
      name = `${cached.request.method} ${cached.request.uri}`;
    }

    return `Unsafe${collected}request '${name}'.`;
  }

  const cacheLenght = () => {
    return length(CACHE_KEY);
  }

  const defineFetchData = (fetch: ResponseFetch<any>) => {
    setDataFetch(() => ({
      waiting: true,
      cancel: fetch.cancel
    }));
  }

  const cleanFetchData = () => {
    setDataFetch(() => ({
      waiting: false,
      cancel: VOID_FUNCTION
    }));
  }

  return (
    <StoreRequest.Provider value={{
      ...data,
      waitingRequest: dataFetch.waiting,
      cancelRequest: dataFetch.cancel,
      cleanRequest, discardRequest, defineFreeRequest, 
      defineGroupRequest, updateRequest, updateName, 
      updateMethod, updateUri, updateQuery,
      updateHeader, updateCookie, updateBody, 
      updateAuth, executeAction, fetchFreeRequest,
      fetchGroupRequest, releaseAction, insertRequest, 
      processUri, isParentCached, isCached,
      cacheComments, cacheLenght
    }}>
      {children}
    </StoreRequest.Provider>
  );
};

export const useStoreRequest = (): StoreProviderRequestType => {
  const context = useContext(StoreRequest);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderRequest");
  }
  return context;
};