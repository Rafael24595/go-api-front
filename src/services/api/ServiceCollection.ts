import { Collection, ItemCollection, ItemNodeCollection, LiteItemCollection } from "../../interfaces/client/collection/Collection";
import { ItemRequest, LiteRequest } from "../../interfaces/client/request/Request";
import { SignedPayload } from "../../interfaces/SignedPayload";
import { authApiManager } from "./ApiManager";
import { RequestCloneCollection, RequestNode, RequestRequestCollect, RequestSortNodes } from "./Requests";
import { ResponseExecuteAction } from "./Responses";

export const sortCollections = async (nodes: RequestNode[]): Promise<ItemCollection> => {
  try {
    const payload: RequestSortNodes = { nodes };
    const apiResponse = await authApiManager.put(`/sort/collection`, payload);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const sortCollectionRequests = async (id: string, nodes: RequestNode[]): Promise<ItemCollection> => {
  try {
    const payload: RequestSortNodes = { nodes };
    const apiResponse = await authApiManager.put(`/sort/collection/${id}/request`, payload);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const exportAllCollections = async (): Promise<ItemCollection[]> => {
  try {
    const apiResponse = await authApiManager.get(`/export/collection`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const exportManyCollections = async (...ids: string[]): Promise<ItemCollection[]> => {
  try {
    const apiResponse = await authApiManager.post(`/export/collection`, ids);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
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
    //TODO: Handle error.
    throw error;
  }
};

export const importCollections = async (collections: ItemCollection[]): Promise<ItemCollection[]> => {
  try {
    const apiResponse = await authApiManager.post(`/import/collection`, collections);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const importToCollection = async (collection: string, request: ItemRequest[]): Promise<ItemCollection[]> => {
  try {
    const apiResponse = await authApiManager.post(`/import/collection/${collection}`, request);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findCollection = async (collection: LiteItemCollection): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.get(`/collection/${collection._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findCollectionLite = async (collection: LiteItemCollection): Promise<LiteItemCollection> => {
  try {
    const apiResponse = await authApiManager.get(`/collection/${collection._id}/lite`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findAllCollection = async (): Promise<SignedPayload<ItemNodeCollection[]>> => {
  try {
    const apiResponse = await authApiManager.get(`/collection`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const insertCollection = async (collection: Collection): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.post(`/collection`, collection);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const requestCollect = async (payload: RequestRequestCollect): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.put(`/collection`, payload);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const deleteCollection = async (request: LiteItemCollection): Promise<ItemCollection> => {
  try {
    const apiResponse = await authApiManager.delete(`/collection/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
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
    //TODO: Handle error.
    throw error;
  }
};

export const takeFromCollection = async (collection: LiteItemCollection, request: LiteRequest): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.put(`/collection/${collection._id}/request/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const deleteFromCollection = async (collection: LiteItemCollection, request: LiteRequest): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.delete(`/collection/${collection._id}/request/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};
