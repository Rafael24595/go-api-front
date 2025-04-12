import { Context } from "../../interfaces/context/Context";
import { Request } from "../../interfaces/request/Request";
import { UserData } from "../../interfaces/UserData";
import apiManager from "./ApiManager";
import { ResponseExecuteAction } from "./ResponseExecuteAction";

export const executeFormAction = async (request: Request, context: Context): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.post(`/api/v1/action`, { request, context });
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserData = async (): Promise<UserData> => {
  try {
    const apiResponse = await apiManager.get(`/api/v1/user`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};