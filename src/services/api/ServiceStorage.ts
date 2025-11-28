import { ItemCollection, ItemNodeRequest } from "../../interfaces/client/collection/Collection";
import { ItemRequest, LiteRequest, Request } from "../../interfaces/client/request/Request";
import { Response } from "../../interfaces/client/response/Response";
import { SignedPayload } from "../../interfaces/SignedPayload";
import { authApiManager } from "./ApiManager";
import { queryHelper } from "./HelperClient";
import { RequestNode, RequestSortNodes } from "./Requests";
import { ResponseExecuteAction } from "./Responses";

export const sortRequests = async (nodes: RequestNode[]): Promise<ItemCollection> => {
  try {
    const payload: RequestSortNodes = { nodes };
    const apiResponse = await authApiManager.put(`/sort/request`, payload);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const exportAllRequests = async (): Promise<ItemRequest[]> => {
  try {
    const apiResponse = await authApiManager.get(`/export/request`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const exportManyRequests = async (...ids: string[]): Promise<ItemRequest[]> => {
  try {
    const apiResponse = await authApiManager.post(`/export/request`, ids);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const exportCurl = async (request: string, context?: string, raw?: boolean, inline?: boolean): Promise<string> => {
  try {
    const query = queryHelper(
      ["id_context", context],
      ["raw", raw],
      ["inline", inline]);

    const apiResponse = await authApiManager.get(`curl/request/${request}${query}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const importRequests = async (request: ItemRequest[]): Promise<string[]> => {
  try {
    const apiResponse = await authApiManager.post(`/import/request`, request);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const importCurl = async (curls: string[], collection?: string): Promise<string> => {
  try {
    const query = queryHelper(
      ["collection", collection]);

    const apiResponse = await authApiManager.post(`curl/request${query}`, curls);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findAction = async (request: LiteRequest): Promise<ResponseExecuteAction> => {
  return findActionById(request._id);
};

export const findActionById = async (request: string): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.get(`/request/${request}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findAllAction = async (): Promise<SignedPayload<ItemNodeRequest[]>> => {
  try {
    const apiResponse = await authApiManager.get(`/request`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const insertAction = async (request: Request, response?: Response): Promise<ResponseExecuteAction> => {
  try {
    const payload = { request, response };
    const apiResponse = await authApiManager.post(`/request`, payload);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const updateAction = async (request: Request): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.put(`/request`, request);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const deleteAction = async (request: LiteRequest): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.delete(`/request/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};
