import { ItemNodeRequest } from "../../interfaces/client/collection/Collection";
import { LiteRequest, Request } from "../../interfaces/client/request/Request";
import { Response } from "../../interfaces/client/response/Response";
import { SignedPayload } from "../../interfaces/SignedPayload";
import { authApiManager } from "./ApiManager";
import { ResponseExecuteAction } from "./Responses";

export const findAllHistoric = async (): Promise<SignedPayload<ItemNodeRequest[]>> => {
  try {
    const apiResponse = await authApiManager.get(`/historic`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const pushHistoric = async (request: Request, response?: Response): Promise<ResponseExecuteAction> => {
  try {
    const payload = { request, response };
    const apiResponse = await authApiManager.post(`/historic`, payload);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const deleteHistoric = async (request: LiteRequest): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await authApiManager.delete(`/historic/${request._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};
