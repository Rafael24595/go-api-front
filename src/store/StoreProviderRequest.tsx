import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { generateHash } from "../services/Utils";
import { Auths, Body, fromRequest, ItemRequest, newItemRequest, Request, toRequest } from "../interfaces/request/Request";
import { cleanCopy, ItemStatusKeyValue } from "../interfaces/StatusKeyValue";
import { fixOrder } from "../interfaces/StatusKeyValue";
import { fromResponse, ItemResponse, newItemResponse, Response, toResponse } from "../interfaces/response/Response";
import { findAction, insertAction } from "../services/api/ServiceStorage";
import { ResponseExecuteAction } from "../services/api/ResponseExecuteAction";

interface StoreProviderRequestType {
  initialHash: string;
  actualHash: string;
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
  getRequest: () => Request;
  getResponse: () => Response;
  defineRequest: (request: Request, response?: Response) => void;
  updateRequest: (request: Request, response?: Response) => void;
  updateName: (name: string) => void;
  updateMethod: (method: string) => void;
  updateUri: (uri: string) => void;
  updateQuery: (items: ItemStatusKeyValue[]) => void;
  updateHeader: (items: ItemStatusKeyValue[]) => void;
  updateBody: (body: Body) => void;
  updateAuth: (auth: Auths) => void;
  fetchRequest: (request: Request) => Promise<void>;
  insertRequest: (req: Request, res?: Response) => Promise<ResponseExecuteAction>;
  processUri: () => void;
}

interface Payload {
  initialHash: "",
  actualHash: "",
  backup: ItemRequest;
  request: ItemRequest;
  response: ItemResponse;
}

const StoreContext = createContext<StoreProviderRequestType | undefined>(undefined);

export const StoreProviderRequest: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    initialHash: "",
    actualHash: "",
    backup: newItemRequest("anonymous"),
    request: newItemRequest("anonymous"),
    response: newItemResponse("anonymous")
  });

  useEffect(() => {
    if (data.initialHash == "") {
      setHash("initialHash", data.backup);
      setHash("actualHash", data.backup);
    }

    if (data.request) {
      setHash("actualHash", data.request);
    }

  }, [data.request]);

  const setHash = async (key: string, request: ItemRequest) => {
    const newHash = await generateHash(toRequest(request));
    setData(prevData => ({
      ...prevData,
      [key]: newHash
    }));
    return newHash;
  }

  const getRequest = (): Request => {
    return toRequest(data.request);
  }

  const getResponse = (): Response => {
    return toResponse(data.response);
  }

  const defineRequest = (request: Request, response?: Response) => {
    const itemRequest = fromRequest(request);
    const itemResponse = response ? fromResponse(response) : newItemResponse("anonymous");
    setData(prevData => ({
      ...prevData,
      initialHash: "",
      actualHash: "",
      backup: itemRequest,
      request: itemRequest,
      response: itemResponse
    }));
  }

  const updateRequest = (request: Request, response?: Response) => {
    const itemRequest = fromRequest(request);
    const itemResponse = response ? fromResponse(response) : newItemResponse("anonymous");
    setData(prevData => ({
      ...prevData,
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

  const fetchRequest = async (request: Request) => {
    const apiResponse = await findAction("anonymous", request);
    defineRequest(apiResponse.request, apiResponse.response);
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

    //TODO: Manage user session.
    return insertAction("anonymous", req, res);
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

  return (
    <StoreContext.Provider value={{ ...data, 
      getRequest, getResponse, defineRequest, 
      updateRequest, updateName, updateMethod, 
      updateUri, updateQuery, updateHeader,
      updateBody, updateAuth, fetchRequest,
      insertRequest, processUri }}>
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