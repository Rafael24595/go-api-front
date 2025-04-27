import { Context } from "../../interfaces/context/Context";
import { Request } from "../../interfaces/request/Request";
import { UserData } from "../../interfaces/UserData";
import apiManager from "./ApiManager";
import { RequestAuthentication, RequestLogin, RequestSignin } from "./Requests";
import { ResponseExecuteAction } from "./Responses";

export const executeFormAction = async (request: Request, context: Context): Promise<ResponseExecuteAction> => {
  try {
    const apiResponse = await apiManager.post(`/api/v1/action`, { request, context });
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLogin = async (username: string, password: string): Promise<UserData> => {
  try {
    const request: RequestLogin =  {
      username, password
    };

    const apiResponse = await apiManager.post(`/api/v1/login`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLogout = async (): Promise<UserData> => {
  try {
    const apiResponse = await apiManager.delete(`/api/v1/login`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSignin = async (username: string, password1: string, password2: string, isAdmin: boolean): Promise<UserData> => {
  try {
    const request: RequestSignin =  {
      username: username,
      password_1: password1,
      password_2: password2,
      is_admin: isAdmin
    };

    const apiResponse = await apiManager.post(`/api/v1/user`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchRemove = async (): Promise<UserData> => {
  try {
    const apiResponse = await apiManager.delete(`/api/v1/user`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAuthenticate = async (oldPassword: string, newPassword1: string, newPassword2: string): Promise<UserData> => {
  try {
    const request: RequestAuthentication =  {
      old_password: oldPassword,
      new_password_1: newPassword1,
      new_password_2: newPassword2
    };

    const apiResponse = await apiManager.put(`/api/v1/user/verify`, request);
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