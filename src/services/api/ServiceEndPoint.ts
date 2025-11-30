import { Request } from "../../interfaces/client/request/Request";
import { EndPoint, ItemEndPoint, LiteEndPoint } from "../../interfaces/mock/EndPoint";
import { Metrics } from "../../interfaces/mock/Metrics";
import { SignedPayload } from "../../interfaces/SignedPayload";
import { ConditionStep } from "../mock/ConditionStep";
import { authApiManager } from "./ApiManager";
import { queryHelper } from "./HelperClient";
import { RequestNode } from "./Requests";

export const bridgeConditionToStep = async (conditions: string): Promise<ConditionStep[]> => {
  try {
    const apiResponse = await authApiManager.post(`/bridge/mock/response/to/step`, conditions);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const bridgeStepToCondition = async (steps: ConditionStep[]): Promise<string> => {
  try {
    const apiResponse = await authApiManager.post(`/bridge/mock/response/from/step`, steps);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const bridgeEndPointToRequest = async (endPoint: ItemEndPoint | LiteEndPoint): Promise<Request> => {
  try {
    const apiResponse = await authApiManager.get(`/bridge/mock/endpoint/${endPoint._id}/to/request`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const sortEndPoints = async (nodes: RequestNode[]): Promise<string[]> => {
  try {
    const apiResponse = await authApiManager.put(`/sort/mock/endpoint`, nodes);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const exportAllEndPoints = async (): Promise<EndPoint[]> => {
  try {
    const apiResponse = await authApiManager.get(`/export/mock/endpoint`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const exportManyEndPoints = async (...ids: string[]): Promise<EndPoint[]> => {
  try {
    const apiResponse = await authApiManager.post(`/export/mock/endpoint`, ids);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const exportCurl = async (endPoint: string, inline?: boolean): Promise<string> => {
  try {
    const query = queryHelper(
      ["inline", inline]);

    const apiResponse = await authApiManager.get(`curl/endpoint/${endPoint}${query}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const importEndPoints = async (endPoints: EndPoint[]): Promise<string[]> => {
  try {
    const apiResponse = await authApiManager.post(`/import/mock/endpoint`, endPoints);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findAllEndPoint = async (): Promise<SignedPayload<LiteEndPoint[]>> => {
  try {
    const apiResponse = await authApiManager.get(`/mock/endpoint`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findEndPoint = async (endPoint: string): Promise<ItemEndPoint> => {
  try {
    const apiResponse = await authApiManager.get(`/mock/endpoint/${endPoint}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const insertEndPoint = async (endPoint: ItemEndPoint): Promise<string> => {
  try {
    const apiResponse = await authApiManager.post(`/mock/endpoint`, endPoint);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const removeEndPoint = async (endPoint: LiteEndPoint | ItemEndPoint): Promise<ItemEndPoint> => {
  try {
    const apiResponse = await authApiManager.delete(`/mock/endpoint/${endPoint._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findMetrics = async (endPoint: ItemEndPoint | LiteEndPoint): Promise<Metrics> => {
  try {
    const apiResponse = await authApiManager.get(`/mock/metrics/endpoint/${endPoint._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const removeMetrics = async (endPoint: ItemEndPoint): Promise<Metrics> => {
  try {
    const apiResponse = await authApiManager.delete(`/mock/metrics/endpoint/${endPoint._id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};
