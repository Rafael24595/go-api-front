import { Collection, ItemCollection } from "../../interfaces/collection/Collection";
import { Context } from "../../interfaces/context/Context";
import { Request } from "../../interfaces/request/Request";
import { Response } from "../../interfaces/response/Response";
import apiManager from "./ApiManager";
import { RequestCloneCollection } from "./RequestCloneCollection";
import { RequestPushToCollection } from "./RequestPushToCollection";
import { ResponseExecuteAction } from "./ResponseExecuteAction";

export const findContext = async (): Promise<Context> => {
  try {
    const apiResponse = await apiManager.get(`/api/v1/context`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const insertContext = async (context: Context): Promise<Context> => {
  try {
    const apiResponse = await apiManager.post(`/api/v1/context`, context);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAction = async (request: Request): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.get(`/api/v1/storage/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAllAction = async (): Promise<Request[]> => {
  try {
    const apiResponse = await apiManager.get(`/api/v1/storage`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const insertAction = async (request: Request, response?: Response): Promise<ResponseExecuteAction> => {
  try {
    const payload = { request, response };
    const apiResponse = await apiManager.post(`/api/v1/storage`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAction = async (request: Request): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.delete(`/api/v1/storage/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAllHistoric = async (): Promise<Request[]> => {
  try {
    const apiResponse = await apiManager.get(`/api/v1/historic`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const pushHistoric = async (request: Request, response?: Response): Promise<ResponseExecuteAction> => {
  try {
    const payload = { request, response };
    const apiResponse = await apiManager.post(`/api/v1/historic`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAllCollection = async (): Promise<ItemCollection[]> => {
  try {
    const apiResponse = await apiManager.get(`/api/v1/collection`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const insertCollection = async (collection: Collection): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.post(`/api/v1/collection`, collection);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const pushToCollection = async (payload: RequestPushToCollection): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.put(`/api/v1/collection`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCollection = async (collection: ItemCollection): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.delete(`/api/v1/collection/${collection._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const cloneCollection = async (collection: ItemCollection, name: string): Promise<ResponseExecuteAction> => {
  try {
    const payload: RequestCloneCollection = {
      collection_name: name,
    };
    const apiResponse = await apiManager.post(`/api/v1/collection/${collection._id}/clone`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const deleteFromCollection = async (collection: ItemCollection, request: Request): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.delete(`/api/v1/collection/${collection._id}/request/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const takeFromCollection = async (collection: ItemCollection, request: Request): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.put(`/api/v1/collection/${collection._id}/request/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};
