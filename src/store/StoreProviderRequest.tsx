import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { generateHash } from "../services/Utils";
import { Auths, Body, fromRequest, ItemRequest, newItemRequest, Request, toRequest } from "../interfaces/request/Request";
import { cleanCopy, ItemStatusKeyValue } from "../interfaces/StatusKeyValue";
import { fixOrder } from "../interfaces/StatusKeyValue";
import { fromResponse, ItemResponse, newItemResponse, Response, toResponse } from "../interfaces/response/Response";
import { findAction, insertAction } from "../services/api/ServiceStorage";
import { ResponseExecuteAction } from "../services/api/ResponseExecuteAction";
import { CacheActionData } from "../interfaces/CacheActionData";
import { Dict } from "../types/Dict";

interface StoreProviderRequestType {
  initialHash: string;
  actualHash: string;
  parent: string,
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
  getRequest: () => Request;
  getResponse: () => Response;
  defineRequest: (request: Request, response?: Response, parent?: string) => void;
  updateRequest: (request: Request, response?: Response) => void;
  updateName: (name: string) => void;
  updateMethod: (method: string) => void;
  updateUri: (uri: string) => void;
  updateQuery: (items: ItemStatusKeyValue[]) => void;
  updateHeader: (items: ItemStatusKeyValue[]) => void;
  updateCookie: (items: ItemStatusKeyValue[]) => void;
  updateBody: (body: Body) => void;
  updateAuth: (auth: Auths) => void;
  fetchRequest: (request: Request, parent?: string) => Promise<void>;
  insertRequest: (req: Request, res?: Response) => Promise<ResponseExecuteAction>;
  isParentCached: (parent: string) => boolean;
  isCached: (request: Request) => boolean;
  processUri: () => void;
}

interface Payload {
  cache: Dict<CacheActionData>
  initialHash: string
  actualHash: string
  parent: string,
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
}

const StoreContext = createContext<StoreProviderRequestType | undefined>(undefined);

export const StoreProviderRequest: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    cache: {},
    initialHash: "",
    actualHash: "",
    parent: "",
    backup: newItemRequest("anonymous"),
    request: newItemRequest("anonymous"),
    response: newItemResponse("anonymous")
  });

  useEffect(() => {
    updateStatus(data.request);
  }, [data.request]);

  const updateStatus = async (request: ItemRequest) => {
    let initialHash = data.initialHash;
    if (data.initialHash == "") {
      initialHash = await calculateHash(data.backup);
    }

    const actualHash = await calculateHash(data.request);

    const newCache = { ...data.cache };
    if(actualHash != initialHash) {
      newCache[request._id] = {
        parent: data.parent,
        backup: data.backup,
        request: request,
        response: data.response
      };
    } else {
      delete newCache[request._id];
    }

    setData(prevData => ({
      ...prevData,
      initialHash,
      actualHash,
      cache: newCache
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

  const defineRequest = (request: Request, response?: Response, parent?: string) => {
    const itemRequest = fromRequest(request);
    const itemResponse = response ? fromResponse(response) : newItemResponse("anonymous");
    defineItemRequest(itemRequest, itemRequest, itemResponse, parent);
  }

  const defineItemRequest = (backup: ItemRequest, request: ItemRequest, response?: ItemResponse, parent?: string) => {
    response = !response ? newItemResponse("anonymous") : response;
    setData(prevData => ({
      ...prevData,
      initialHash: "",
      actualHash: "",
      parent: parent || "",
      backup: backup,
      request: request,
      response: response
    }));
  }

  const updateRequest = (request: Request, response?: Response) => {
    const itemRequest = fromRequest(request);
    const itemResponse = response ? fromResponse(response) : newItemResponse("anonymous");
    setData(prevData => ({
      ...prevData,
      parent: "",
      backup: itemRequest,
      request: itemRequest,
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

  const fetchRequest = async (request: Request, parent?: string) => {
    const cached = data.cache[request._id];
    if(cached != undefined) {
      defineItemRequest(cached.backup, cached.request, cached.response, cached.parent);
      return;
    }
    
    const apiResponse = await findAction(request);
    defineRequest(apiResponse.request, apiResponse.response, parent);
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

    return insertAction(req, res);
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
    return Object.values(data.cache)
      .find(c => c.parent == parent) != undefined;
  }

  const isCached = (request: Request) => {
    return data.cache[request._id] != undefined;
  }

  return (
    <StoreContext.Provider value={{ ...data, 
      getRequest, getResponse, defineRequest, 
      updateRequest, updateName, updateMethod, 
      updateUri, updateQuery, updateHeader, 
      updateCookie, updateBody, updateAuth,
      fetchRequest, insertRequest, processUri,
      isParentCached, isCached }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreRequest = (): StoreProviderRequestType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderClient");
  }
  return context;
};