import { Request } from "../../interfaces/request/Request";
import apiManager from "./ApiManager";

export const executeFormAction = async (request: Request) => {
    try {
      const response = await apiManager.post(`/api/v1/action`, request);
      console.log(response)
      return response.data;
    } catch (error) {
      throw error;
    }
  };