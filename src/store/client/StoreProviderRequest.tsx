import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { Auths, fromRequest, ItemBody, ItemRequest, LiteRequest, newItemRequest, newRequest, Request, toRequest } from "../../interfaces/client/request/Request";
import { cleanCopy, ItemStatusKeyValue } from "../../interfaces/StatusKeyValue";
import { fixOrder } from "../../interfaces/StatusKeyValue";
import { fromResponse, ItemResponse, newItemResponse, Response, toResponse } from "../../interfaces/client/response/Response";
import { findActionById, insertAction } from "../../services/api/ServiceStorage";
import { ResponseExecuteAction, ResponseFetch } from "../../services/api/Responses";
import { useStoreCache } from "../StoreProviderCache";
import { Optional } from "../../types/Optional";
import { CacheActionData } from "../../interfaces/client/Cache";
import { useStoreSession } from "../system/StoreProviderSession";
import { useStoreContext } from "./StoreProviderContext";
import { useStoreCollections } from "./StoreProviderCollections";
import { useAlert } from "../../components/utils/alert/Alert";
import { executeFormAction } from "../../services/api/ServiceManager";
import { EAlertCategory } from "../../interfaces/AlertData";
import { CacheRequestFocus } from "../../interfaces/client/Cache";
import { UserData } from "../../interfaces/system/UserData";
import { CACHE_CATEGORY_FOCUS } from "../Constants";
import { pushHistoric } from "../../services/api/ServiceHistory";
import { EventAction, Events, InitialEvent } from "../../types/EventAction";

const TRIGGER_KEY_VIEW = "StoreProviderRequestViewTrigger";

export const CACHE_CATEGORY_STORE = "StoreRequest";
export const CACHE_KEY_FOCUS = "FocusRequest";

const VOID_FUNCTION = () => { };

interface StoreProviderRequestType {
  parent: string,
  request: ItemRequest;
  response: ItemResponse;
  waitingRequest: boolean;
  event: EventAction;

  cancelRequest: () => void;
  cleanRequest: () => void;
  discardRequest: (request?: LiteRequest) => void;
  defineRequest: (request: Request) => void;

  updateMethod: (method: string) => void;
  updateUri: (uri: string) => void;
  updateQuery: (items: ItemStatusKeyValue[]) => void;
  updateHeader: (items: ItemStatusKeyValue[]) => void;
  updateCookie: (items: ItemStatusKeyValue[]) => void;
  updateBody: (body: ItemBody) => void;
  updateAuth: (auth: Auths) => void;

  executeAction: () => Promise<void>;

  fetchFreeRequest: (request: LiteRequest) => Promise<void>;
  fetchGroupRequest: (parent: string, context: string, request: LiteRequest) => Promise<void>;

  releaseAction: () => Promise<ResponseExecuteAction>;
  insertRequest: (request: Request, response?: Response) => Promise<ResponseExecuteAction>;

  isModified: () => boolean;
  isParentCached: (parent: string) => boolean;
  isCached: (request: LiteRequest) => boolean;
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
  context: Optional<string>
}

interface PayloadFectch {
  waiting: boolean;
  cancel: () => void;
}

const StoreRequest = createContext<StoreProviderRequestType | undefined>(undefined);

export const StoreProviderRequest: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData, loaded, fetchUser, pushTrigger, trimTrigger } = useStoreSession();
  const { fetchContext } = useStoreContext();
  const { getContext } = useStoreContext();
  const { fetchAll } = useStoreCollections();
  const { push } = useAlert();
  const { gather, search, exists, insert, excise, remove, length } = useStoreCache();

  const requestRef = useRef<ItemRequest>(newItemRequest(userData.username));
  const fetchRef = useRef<PayloadFectch>({
    waiting: false,
    cancel: VOID_FUNCTION
  });

  const [data, setData] = useState<Payload>({
    initialHash: "",
    actualHash: "",
    parent: "",
    backup: newItemRequest(userData.username),
    request: newItemRequest(userData.username),
    response: newItemResponse(userData.username),
    context: undefined
  });

  const [event, setEventAction] = useState<EventAction>(InitialEvent);

  useEffect(() => {
    pushTrigger(TRIGGER_KEY_VIEW, onSessionChange);

    if (loaded) {
      focusLastRequest();
    }

    return () => {
      trimTrigger(TRIGGER_KEY_VIEW);
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    requestRef.current = data.request;

    updateStatus(data);
  }, [data.request]);

  const updateStatus = async (data: Payload) => {
    let initialHash = data.initialHash;
    if (data.initialHash == "") {
      initialHash = calculateHash(data.backup);
    }

    const actualHash = calculateHash(data.request);
    if (actualHash != initialHash) {
      insert(CACHE_CATEGORY_STORE, data.request._id, {
        parent: data.parent,
        backup: data.backup,
        request: data.request,
        response: data.response
      });
    } else {
      remove(CACHE_CATEGORY_STORE, data.request._id);
    }

    if (data.backup._id != "") {
      remove(CACHE_CATEGORY_STORE, "");
    }

    insert(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS, {
      request: data.request._id,
      parent: data.parent,
      context: data.context
    })

    setData(prevData => ({
      ...prevData,
      initialHash,
      actualHash
    }));
  }

  const onSessionChange = useCallback(async (newUser: UserData, oldUser: UserData) => {
    if (newUser.username != oldUser.username || !focusLastRequest()) {
      const request = newRequest(newUser.username);
      defineRequest(request);
      cleanCache();
    }
  }, []);

  const fetchFreeRequest = async (request: LiteRequest) => {
    fetchRequest(request._id);
  }

  const fetchGroupRequest = async (parent: string, context: string, request: LiteRequest) => {
    fetchRequest(request._id, parent, context);
  }

  const fetchRequest = async (request: string, parent?: string, context?: string) => {
    const cached: Optional<CacheActionData> = search(CACHE_CATEGORY_STORE, request);
    if (cached != undefined) {
      if (cached.request.owner != userData.username) {
        return false;
      }

      restoreRequest(cached.backup, cached.request, cached.response, undefined, cached.parent, context);
      return false;
    }

    if (request == "") {
      return false;
    }

    const action = await findActionById(request)
      .catch(err => {
        if (err.statusCode == 404) {
          fetchUser();
          return;
        }
        throw err;
      });

    if (action?.request == undefined) {
      return false;
    }

    if (action.request.owner != userData.username) {
      fetchUser();
      return false;
    }

    defineRequest(action.request, action.response, undefined, parent, context);

    return true;
  }

  const focusLastRequest = () => {
    const focus: Optional<CacheRequestFocus> = search(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
    if (focus != undefined) {
      return fetchRequest(focus.request, focus.parent, focus.context);
    }
    return false;
  }

  const defineRequest = (request: Request, response?: Response, oldRequest?: Request, parent?: string, context?: string) => {
    const itemRequest = fromRequest(request);
    const itemResponse = response ? fromResponse(response) : newItemResponse(request.owner);
    restoreRequest(itemRequest, itemRequest, itemResponse, oldRequest, parent, context);
  }

  const restoreRequest = (backup: ItemRequest, request: ItemRequest, response: ItemResponse, oldRequest?: Request, parent?: string, context?: string) => {
    if (fetchRef.current.waiting && requestRef.current._id == request._id) {
      response = newItemResponse(request.owner);
    }

    evalueCancelRequest(request);

    if (oldRequest && oldRequest._id != request._id) {
      remove(CACHE_CATEGORY_STORE, oldRequest._id);
    }

    setData(prevData => {
      return {
        ...prevData,
        initialHash: "",
        actualHash: "",
        parent: parent || "",
        backup: { ...backup },
        request: { ...request },
        response: { ...response },
        context: context,
      }
    });

    fetchContext(context, parent);

    pushEvent(Events.DEFINE);
  }

  const releaseRequest = (request: ItemRequest, response: ItemResponse, oldRequest: Request) => {
    if (fetchRef.current.waiting && requestRef.current._id == request._id) {
      response = newItemResponse(userData.username);
    }

    if (oldRequest && oldRequest._id != request._id) {
      remove(CACHE_CATEGORY_STORE, oldRequest._id);
    }

    setData(prevData => {
      return {
        ...prevData,
        initialHash: "",
        actualHash: "",
        backup: { ...request },
        request: { ...request },
        response: { ...response },
      }
    });

    pushEvent(Events.RELEASE);
  }

  const updateRequest = (request: ItemRequest, response: ItemResponse) => {
    if (fetchRef.current.waiting && requestRef.current._id == request._id) {
      response = newItemResponse(userData.username);
    }

    evalueCancelRequest(request);

    setData(prevData => {
      return {
        ...prevData,
        request: request,
        response: response
      }
    });

    pushEvent(Events.UPDATE);
  }

  const updateResponse = (response?: Response) => {
    const itemResponse = response ? fromResponse(response) : newItemResponse(userData.username);
    setData(prevData => ({
      ...prevData,
      response: itemResponse
    }));
  }

  const evalueCancelRequest = (newRequest: ItemRequest): boolean => {
    if (requestRef.current._id == newRequest._id) {
      return false;
    }

    fetchRef.current.cancel();

    cleanFetchData();

    if (fetchRef.current.waiting) {
      push({
        category: EAlertCategory.WARN,
        content: "Request cancelled"
      });
    }

    return true;
  }

  const discardRequest = (request?: LiteRequest) => {
    if (!request || request._id == data.backup._id) {
      releaseRequest(data.backup, data.response, toRequest(data.request));
    } else {
      remove(CACHE_CATEGORY_STORE, request._id);

      setData(prevData => {
        return { ...prevData };
      });
    }

    pushEvent(Events.DISCARD);
  }

  const cleanCache = () => {
    remove(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
    excise(CACHE_CATEGORY_STORE);
  }

  const cleanRequest = () => {
    const request = newRequest(userData.username);
    defineRequest(request);
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
    const context = getContext();
    const base = toRequest(data.request);
    const request = { ...base };

    if (request.name == "") {
      request.name = `temp-${request.method}-${request.timestamp}`;
    }

    const itemRequest = fromRequest(request);
    const itemResponse = newItemResponse(userData.username);
    updateRequest(itemRequest, itemResponse);

    const fetchResponse = executeFormAction(request, context);
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

    fixRequestData(apiResponse.request, base);

    fetchAll();
  };

  const fixRequestData = (request: Request, oldRequest?: Request) => {
    let itemRequest = fromRequest(request);
    if (oldRequest && oldRequest._id != request._id) {
      remove(CACHE_CATEGORY_STORE, oldRequest._id);
    }

    setData(prevData => {
      const prevRequest = oldRequest ? fromRequest(oldRequest) : prevData.request;

      itemRequest = {
        ...prevRequest,
        _id: itemRequest._id,
        modified: itemRequest.modified,
        owner: itemRequest.owner,
        timestamp: itemRequest.timestamp
      }

      return {
        ...prevData,
        request: itemRequest
      }
    });
  }

  const releaseAction = async () => {
    const request = toRequest(data.request);
    const response = toResponse(data.response);

    let apiResponse = await insertRequest(request, response);

    const fixRequest = { ...request };
    const fixResponse = { ...response };

    fixRequest._id = apiResponse.request._id;
    fixRequest.name = apiResponse.request.name;
    fixRequest.status = apiResponse.request.status;

    const itemRequest = fromRequest(fixRequest);
    const itemResponse = fromResponse(fixResponse);
    releaseRequest(itemRequest, itemResponse, request);

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

    const result = await insertAction(request, response)

    fetchAll();

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

  const isModified = () => {
    return data.initialHash != data.actualHash;
  }

  const isParentCached = (parent: string) => {
    return exists(CACHE_CATEGORY_STORE, (_: string, i: CacheActionData) => i.parent == parent);
  }

  const isCached = (request: LiteRequest) => {
    return search(CACHE_CATEGORY_STORE, request._id) != undefined;
  }

  const cacheComments = () => {
    const requests: CacheActionData[] = gather(CACHE_CATEGORY_STORE);
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

    return `Unsaved${collected}request '${name}'.`;
  }

  const cacheLenght = () => {
    return length(CACHE_CATEGORY_STORE);
  }

  const defineFetchData = (fetch: ResponseFetch<ResponseExecuteAction>) => {
    fetchRef.current = {
      waiting: true,
      cancel: fetch.cancel
    };
  }

  const cleanFetchData = () => {
    fetchRef.current = {
      waiting: false,
      cancel: VOID_FUNCTION
    };
  }

  const pushEvent = (reason: string, source?: string, target?: string) => {
    setEventAction({ reason, source, target });
  }

  return (
    <StoreRequest.Provider value={{
      ...data,
      waitingRequest: fetchRef.current.waiting,
      cancelRequest: fetchRef.current.cancel,
      event,
      cleanRequest, discardRequest, defineRequest,
      updateMethod, updateUri, updateQuery,
      updateHeader, updateCookie, updateBody,
      updateAuth, executeAction, fetchFreeRequest,
      fetchGroupRequest, releaseAction, insertRequest,
      processUri, isModified, isParentCached, isCached,
      cacheComments, cacheLenght
    }}>
      {children}
    </StoreRequest.Provider>
  );
};

const calculateHash = (request: ItemRequest) => {
  return JSON.stringify(toRequest(request));
}

export const useStoreRequest = (): StoreProviderRequestType => {
  const context = useContext(StoreRequest);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderRequest");
  }
  return context;
};