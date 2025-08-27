import { Collection, ItemCollection, ItemNodeCollection, ItemNodeRequest, LiteItemCollection } from "../../interfaces/collection/Collection";
import { Context } from "../../interfaces/context/Context";
import { ItemRequest, LiteRequest, Request } from "../../interfaces/request/Request";
import { Response } from "../../interfaces/response/Response";
import { authApiManager } from "./ApiManager";
import { RequestCloneCollection, RequestImportContext, RequestNode, RequestRequestCollect, RequestSortNodes } from "./Requests";
import { ResponseExecuteAction } from "./Responses";

export const findUserContext = async (): Promise<Context> => {
  try {
    const apiResponse = await authApiManager.get(`/context`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findContext = async (id: string): Promise<Context> => {
  try {
    const apiResponse = await authApiManager.get(`/context/${id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const insertContext = async (context: Context): Promise<string> => {
  try {
    const apiResponse = await authApiManager.put(`/context`, context);
    return apiResponse.data;
  } catch (error) {
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
    throw error;
  }
};

export const findAllAction = async (): Promise<ItemNodeRequest[]> => {
  try {
    const apiResponse = await authApiManager.get(`/request`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const insertAction = async (request: Request, response?: Response): Promise<ResponseExecuteAction> => {
  try {
    const payload = { request, response };
    const apiResponse = await authApiManager.post(`/request`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const updateAction = async (request: Request): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.put(`/request`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const sortRequests = async (nodes: RequestNode[]): Promise<ItemCollection> => {
  try {
    const payload: RequestSortNodes = { nodes };
    const apiResponse = await authApiManager.put(`/sort/request`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAction = async (request: LiteRequest): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.delete(`/request/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAllHistoric = async (): Promise<ItemNodeRequest[]> => {
  try {
    const apiResponse = await authApiManager.get(`/historic`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const pushHistoric = async (request: Request, response?: Response): Promise<ResponseExecuteAction> => {
  try {
    const payload = { request, response };
    const apiResponse = await authApiManager.post(`/historic`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const deleteHistoric = async (request: LiteRequest): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.delete(`/historic/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findCollection = async (collection: LiteItemCollection): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.get(`/collection/${collection._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findCollectionLite = async (collection: LiteItemCollection): Promise<LiteItemCollection> => {
  try {
    const apiResponse = await authApiManager.get(`/collection/${collection._id}/lite`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAllCollection = async (): Promise<ItemNodeCollection[]> => {
  try {
    const apiResponse = await authApiManager.get(`/collection`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const sortCollections = async (nodes: RequestNode[]): Promise<ItemCollection> => {
  try {
    const payload: RequestSortNodes = { nodes };
    const apiResponse = await authApiManager.put(`/sort/collection`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const sortCollectionRequests = async (id: string, nodes: RequestNode[]): Promise<ItemCollection> => {
  try {
    const payload: RequestSortNodes = { nodes };
    const apiResponse = await authApiManager.put(`/sort/collection/${id}/request`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const insertCollection = async (collection: Collection): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.post(`/collection`, collection);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const requestCollect = async (payload: RequestRequestCollect): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.put(`/collection`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCollection = async (request: LiteItemCollection): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.delete(`/collection/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const cloneCollection = async (collection: ItemCollection, name: string): Promise<ItemCollection> => {
  try {
    const payload: RequestCloneCollection = {
      collection_name: name,
    };
    const apiResponse = await authApiManager.post(`/collection/${collection._id}/clone`, payload);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const takeFromCollection = async (collection: LiteItemCollection, request: LiteRequest): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.put(`/collection/${collection._id}/request/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const deleteFromCollection = async (collection: LiteItemCollection, request: LiteRequest): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.delete(`/collection/${collection._id}/request/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const importRequests = async (request: ItemRequest[]): Promise<ItemRequest[]> => {
  try {
    const apiResponse = await authApiManager.post(`/import/request`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const importCollections = async (collections: ItemCollection[]): Promise<ItemCollection[]> => {
  try {
    const apiResponse = await authApiManager.post(`/import/collection`, collections);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const importToCollection = async (collection: string, request: ItemRequest[]): Promise<ItemCollection[]> => {
  try {
    const apiResponse = await authApiManager.post(`/import/collection/${collection}`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const imporOpenApi = async (form: FormData): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.post(`/import/openapi`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const importContext = async (target: Context, source: Context): Promise<ItemCollection> => {
  try {
    const request: RequestImportContext = {
      source, target
    };

    const apiResponse = await authApiManager.post(`/import/context`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};
