import { Context } from "../../interfaces/context/Context";
import { Request } from "../../interfaces/request/Request";
import { Response } from "../../interfaces/response/Response";
import apiManager from "./ApiManager";
import { ResponseExecuteAction } from "./ResponseExecuteAction";

export const findContext = async (user: string): Promise<Context> => {
  try {
      const apiResponse = await apiManager.get(`/api/v1/context/${user}`);
      return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const insertContext = async (user: string, context: Context): Promise<Context> => {
  try {
      const apiResponse = await apiManager.post(`/api/v1/context/${user}`, context);
      return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAction = async (user: string, request: Request): Promise<ResponseExecuteAction> => {
  try {
      const apiResponse = await apiManager.get(`/api/v1/storage/${user}/${request._id}`);
      return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAllAction = async (user: string): Promise<Request[]> => {
  try {
      const apiResponse = await apiManager.get(`/api/v1/storage/${user}`);
      return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const insertAction = async (user: string, request: Request, response?: Response): Promise<ResponseExecuteAction> => {
    try {
        const payload = { request, response };
        const apiResponse = await apiManager.post(`/api/v1/storage/${user}`, payload);
        return apiResponse.data;
    } catch (error) {
      throw error;
    }
};

export const deleteAction = async (user: string, request: Request): Promise<ResponseExecuteAction> => {
  try {
      const apiResponse = await apiManager.delete(`/api/v1/storage/${user}/${request._id}`);
      return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const findAllHistoric = async (user: string): Promise<Request[]> => {
  try {
      const apiResponse = await apiManager.get(`/api/v1/historic/${user}`);
      return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const pushHistoric = async (user: string, request: Request, response?: Response): Promise<ResponseExecuteAction> => {
    try {
        const payload = { request, response };
        const apiResponse = await apiManager.post(`/api/v1/historic/${user}`, payload);
        return apiResponse.data;
    } catch (error) {
      throw error;
    }
};
