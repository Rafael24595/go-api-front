import { useRef, Dispatch, SetStateAction } from "react";
import { fromRequest, ItemRequest, LiteRequest, newItemRequest, Request, toRequest } from "../../../interfaces/client/request/Request";
import { fromResponse, ItemResponse, newItemResponse, Response } from "../../../interfaces/client/response/Response";
import { findActionById } from "../../../services/api/ServiceStorage";
import { ResponseExecuteAction, ResponseFetch } from "../../../services/api/Responses";
import { useStoreCache } from "../../StoreProviderCache";
import { Optional } from "../../../types/Optional";
import { CacheActionData } from "../../../interfaces/client/Cache";
import { useStoreSession } from "../../system/StoreProviderSession";
import { useStoreContext } from "../context/StoreProviderContext";
import { useAlert } from "../../../components/utils/alert/Alert";
import { EAlertCategory } from "../../../interfaces/AlertData";
import { CacheRequestFocus } from "../../../interfaces/client/Cache";
import { UserData } from "../../../interfaces/system/UserData";
import { CACHE_CATEGORY_FOCUS } from "../../Constants";
import { Events } from "../../../types/EventAction";
import { CACHE_CATEGORY_STORE, CACHE_KEY_FOCUS, Payload } from "./Helper";
import { VOID_FUNCTION } from "../../../types/Helper";

interface StoreControllerRequestType {
  setData: Dispatch<SetStateAction<Payload>>
  pushEvent: (reason: string, source?: string | undefined, target?: string | undefined) => void
}

interface PayloadFectch {
  waiting: boolean;
  cancel: () => void;
}

export const useRequestController = ({ setData, pushEvent }: StoreControllerRequestType) => {
  const { search, remove, excise } = useStoreCache();
  const { fetchUser } = useStoreSession();
  const { fetchContext } = useStoreContext();
  const { push } = useAlert();

  const backupRef = useRef<ItemRequest>(newItemRequest(""));
  const requestRef = useRef<ItemRequest>(newItemRequest(""));
  const responseRef = useRef<ItemResponse>(newItemResponse(""));

  const fetchRef = useRef<PayloadFectch>({
    waiting: false,
    cancel: VOID_FUNCTION
  });

  const fetchRequest = async (userData: UserData, request: string, parent?: string, context?: string) => {
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

  const focusLastRequest = (userData: UserData) => {
    const focus: Optional<CacheRequestFocus> = search(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
    if (focus != undefined) {
      return fetchRequest(userData, focus.request, focus.parent, focus.context);
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

  const releaseRequest = (userData: UserData, request: ItemRequest, response: ItemResponse, oldRequest: Request) => {
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

  const updateRequest = (userData: UserData, request: ItemRequest, response: ItemResponse) => {
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

  const updateResponse = (userData: UserData, response?: Response) => {
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

  const discardRequest = (userData: UserData, request?: LiteRequest) => {
    if (!request || request._id == backupRef.current._id) {
      releaseRequest(userData, backupRef.current, responseRef.current, toRequest(requestRef.current));
    } else {
      remove(CACHE_CATEGORY_STORE, request._id);

      setData(prevData => {
        return { ...prevData };
      });
    }

    pushEvent(Events.DISCARD);
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

  const cleanCache = () => {
    remove(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
    excise(CACHE_CATEGORY_STORE);
  }

  return {
    backupRef,
    requestRef,
    responseRef,
    fetchRef,


    fetchRequest, focusLastRequest, defineRequest,
    releaseRequest, updateRequest, discardRequest,
    updateResponse, defineFetchData, cleanFetchData,
    cleanCache,
  }
}
