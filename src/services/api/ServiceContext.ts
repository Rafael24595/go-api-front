import { Context } from "../../interfaces/client/context/Context";
import { authApiManager } from "./ApiManager";
import { RequestImportContext } from "./Requests";

export const importContext = async (target: Context, source: Context): Promise<string> => {
  try {
    const request: RequestImportContext = {
      source, target
    };

    const apiResponse = await authApiManager.post(`/import/context`, request);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findUserContext = async (): Promise<Context> => {
  try {
    const apiResponse = await authApiManager.get(`/context`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const findContext = async (id: string): Promise<Context> => {
  try {
    const apiResponse = await authApiManager.get(`/context/${id}`);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};

export const insertContext = async (context: Context): Promise<string> => {
  try {
    const apiResponse = await authApiManager.put(`/context`, context);
    return apiResponse.data;
  } catch (error) {
    //TODO: Handle error.
    throw error;
  }
};
