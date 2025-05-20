import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { generateHash } from "../services/Utils";
import { Auths, fromRequest, ItemBody, ItemRequest, newItemRequest, newRequest, Request, toRequest } from "../interfaces/request/Request";
import { cleanCopy, ItemStatusKeyValue } from "../interfaces/StatusKeyValue";
import { fixOrder } from "../interfaces/StatusKeyValue";
import { fromResponse, ItemResponse, newItemResponse, Response, toResponse } from "../interfaces/response/Response";
import { findAction, insertAction, pushHistoric } from "../services/api/ServiceStorage";
import { ResponseExecuteAction } from "../services/api/Responses";
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

const VOID_FUNCTION = () => {};

interface StoreProviderRequestType {
  initialHash: string;
  actualHash: string;
  parent: string,
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
  waitingRequest: boolean;
  cancelRequest: () => void;
  getRequest: () => Request;
  getResponse: () => Response;
  cleanRequest: ()=> void;
  discardRequest: ()=> void;
  defineRequest: (request: Request, response?: Response, parent?: string, oldRequest?: Request) => void;
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
  fetchRequest: (request: Request, parent?: string, context?: string) => Promise<void>;
  insertRequest: (req: Request, res?: Response) => Promise<ResponseExecuteAction>;
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
  executionPromise: Optional<Promise<ResponseExecuteAction>>;
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
    executionPromise: undefined,
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

    if(actualHash != initialHash) {
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

  const getRequest = (): Request => {
    return toRequest(data.request);
  }

  const getResponse = (): Response => {
    return toResponse(data.response);
  }

  const cleanRequest = () => {
    defineRequestFromRequest(newRequest(userData.username));
  }

  const cleanCache = () => {
    excise(CACHE_KEY);
  }

  const discardRequest = () => {
    defineRequestData(data.backup, data.backup, data.response, data.parent, undefined);
  }

  const defineRequest = (newRequest: Request, newResponse?: Response, parent?: string, oldRequest?: Request) => {
    defineRequestFromRequest(newRequest, newResponse, parent, undefined, oldRequest);
  }

  const defineRequestFromRequest = (newRequest: Request, newResponse?: Response, parent?: string, context?: string, oldRequest?: Request) => {
    const itemRequest = fromRequest(newRequest);
    const itemResponse = newResponse ? fromResponse(newResponse) : newItemResponse(userData.username);
    defineRequestData(itemRequest, itemRequest, itemResponse, parent, context, oldRequest);
  }

  const defineRequestData = (backup: ItemRequest, newRequest: ItemRequest, newResponse?: ItemResponse, parent?: string, context?: string, oldRequest?: Request) => {
    newResponse = !newResponse ? newItemResponse(userData.username) : newResponse;
    setData(prevData => {
      if(oldRequest && oldRequest._id != newRequest._id) {
        remove(CACHE_KEY, oldRequest._id)
      }

      return {
        ...prevData,
        initialHash: "",
        actualHash: "",
        parent: parent || "",
        backup: { ...backup },
        request: { ...newRequest },
        response: { ...newResponse },
        executionPromise: undefined
      }
    });
    fetchContext(context, parent);
  }

  const updateRequest = (newRequest: Request, newResponse?: Response, oldRequest?: Request) => {
    const itemRequest = fromRequest(newRequest);
    const itemResponse = newResponse ? fromResponse(newResponse) : newItemResponse(userData.username);
    
    setData(prevData => {   
      if(oldRequest && oldRequest._id != newRequest._id) {
        remove(CACHE_KEY, oldRequest._id)
      }

      return {
        ...prevData,
        parent: prevData.parent,
        backup: prevData.backup,
        request: itemRequest,
        response: itemResponse
      }
    });
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

  const executeAction = async () => {
    const req = getRequest();

    const newReq = {...req};
    if(newReq.name == "") {
        const name = `temp-${req.method}-${req.timestamp}`;
        newReq.name = name;
    }

    updateRequest(newReq);

    let fetchResponse = executeFormAction(newReq, getContext());

    setDataFetch(() => ({
      waiting: true,
      cancel: fetchResponse.cancel
    }));

    let apiResponse = await fetchResponse.promise.catch(e => {
      if(e == undefined) {
        return;
      }
      push({
        title: `[${e.statusCode}] ${e.statusText}`,
        category: EAlertCategory.ERRO,
        content: e.message,
      })
    });

    setDataFetch(() => ({
      waiting: false,
      cancel: VOID_FUNCTION
    }));

    if(!apiResponse) {
        return;
    }

    updateRequest(newReq, apiResponse.response);

    apiResponse = await pushHistoric(req, apiResponse.response);
    
    newReq._id = apiResponse.request._id;
    updateRequest(newReq, apiResponse.response, req);

    fetchAll();
  };

  const fetchRequest = async (request: Request, parent?: string, context?: string) => {
    const cached: Optional<CacheActionData> = search(CACHE_KEY, request._id);
    if(cached != undefined) {
      defineRequestData(cached.backup, cached.request, cached.response, cached.parent, context);
      return;
    }
    
    const apiResponse = await findAction(request);
    defineRequestFromRequest(apiResponse.request, apiResponse.response, parent, context);
  }

  const insertRequest = async (req: Request, res?: Response): Promise<ResponseExecuteAction> => {
    if(req.status == "draft") {
        const name = prompt("Insert a name: ", req.name);
        if(name == null && name != req.name) {
            return {
              request: req,
              response: res
            };
        }            
        req.name = name;
    }

    const result = await insertAction(req, res);

    return result;
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
    if(cached.parent != undefined && cached.parent != "") {
      collected = " collected ";
    }

    let name = cached.request.name;
    if(name == undefined || name == "") {
      name = `${cached.request.method} ${cached.request.uri}`;
    }

    return `Unsafe${collected}request '${name}'.`;
  }

  const cacheLenght = () => {
    return length(CACHE_KEY);
  }

  return (
    <StoreRequest.Provider value={{ ...data, 
      waitingRequest: dataFetch.waiting,
      cancelRequest: dataFetch.cancel,
      getRequest, getResponse, cleanRequest,
      discardRequest, defineRequest, updateRequest,
      updateName, updateMethod, updateUri,
      updateQuery, updateHeader, updateCookie,
      updateBody, updateAuth, executeAction,
      fetchRequest, insertRequest, processUri,
      isParentCached, isCached, cacheComments, 
      cacheLenght }}>
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