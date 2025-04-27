import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { generateHash } from "../services/Utils";
import { Auths, Body, fromRequest, ItemRequest, newItemRequest, newRequest, Request, toRequest } from "../interfaces/request/Request";
import { cleanCopy, ItemStatusKeyValue } from "../interfaces/StatusKeyValue";
import { fixOrder } from "../interfaces/StatusKeyValue";
import { fromResponse, ItemResponse, newItemResponse, Response, toResponse } from "../interfaces/response/Response";
import { findAction, insertAction } from "../services/api/ServiceStorage";
import { ResponseExecuteAction } from "../services/api/ResponseExecuteAction";
import { useStoreCache } from "./StoreProviderCache";
import { Optional } from "../types/Optional";
import { CacheActionData } from "../interfaces/CacheActionData";
import { useStoreSession } from "./StoreProviderSession";
import { useStoreContext } from "./StoreProviderContext";

interface StoreProviderRequestType {
  initialHash: string;
  actualHash: string;
  parent: string,
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
  getRequest: () => Request;
  getResponse: () => Response;
  cleanRequest: ()=> void;
  defineRequest: (request: Request, response?: Response, parent?: string, oldRequest?: Request) => void;
  updateRequest: (newRequest: Request, newResponse?: Response, oldRequest?: Request) => void;
  updateName: (name: string) => void;
  updateMethod: (method: string) => void;
  updateUri: (uri: string) => void;
  updateQuery: (items: ItemStatusKeyValue[]) => void;
  updateHeader: (items: ItemStatusKeyValue[]) => void;
  updateCookie: (items: ItemStatusKeyValue[]) => void;
  updateBody: (body: Body) => void;
  updateAuth: (auth: Auths) => void;
  fetchRequest: (request: Request, parent?: string, context?: string) => Promise<void>;
  insertRequest: (req: Request, res?: Response) => Promise<ResponseExecuteAction>;
  isParentCached: (parent: string) => boolean;
  isCached: (request: Request) => boolean;
  cacheComments: () => string[];
  cacheLenght: () => number;
  processUri: () => void;
}

const TRIGGER_KEY = "StoreProviderRequestTrigger";
const CACHE_KEY = "StoreProviderRequestCache";

interface Payload {
  initialHash: string
  actualHash: string
  parent: string,
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
}

const StoreRequest = createContext<StoreProviderRequestType | undefined>(undefined);

export const StoreProviderRequest: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData, pushTrigger } = useStoreSession();
  const { fetchContext } = useStoreContext();

  const { gather, search, exists, insert, remove, length } = useStoreCache();

  const [data, setData] = useState<Payload>({
    initialHash: "",
    actualHash: "",
    parent: "",
    backup: newItemRequest(userData.username),
    request: newItemRequest(userData.username),
    response: newItemResponse(userData.username)
  });
  
  
  useEffect(() => {
    pushTrigger(TRIGGER_KEY, cleanRequest);
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
        response: { ...newResponse }
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

  const updateBody = (body: Body) => {
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
        const name = prompt("Insert a name: ");
        if(name == null) {
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
      getRequest, getResponse, cleanRequest,
      defineRequest, updateRequest, updateName,
      updateMethod, updateUri, updateQuery,
      updateHeader, updateCookie, updateBody,
      updateAuth, fetchRequest, insertRequest,
      processUri, isParentCached, isCached,
      cacheComments, cacheLenght }}>
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