import { Request } from "../../interfaces/request/Request";
import apiManager from "./ApiManager";
import { ResponseExecuteAction } from "./ResponseExecuteAction";

export const executeFormAction = async (request: Request): Promise<ResponseExecuteAction> => {
    try {
      const response = await apiManager.post(`/api/v1/action`, request);
      return response.data;
    } catch (error) {
      throw error;
    }
  };