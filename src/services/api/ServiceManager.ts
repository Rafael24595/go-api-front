import { Context } from "../../interfaces/context/Context";
import { Record, SystemMetadata } from "../../interfaces/Metadata";
import { Request } from "../../interfaces/request/Request";
import { UserData } from "../../interfaces/UserData";
import { apiManager, sessionApiManager, authApiManager } from "./ApiManager";
import { RequestAuthentication, RequestLogin, RequestSignin } from "./Requests";
import { ResponseExecuteAction, ResponseFetch } from "./Responses";

export const executeFormAction = (request: Request, context: Context): ResponseFetch<ResponseExecuteAction> => {
  const controller = new AbortController();

  const payload = { request, context };

  const promise = authApiManager.post(`/action`, payload, { signal: controller.signal })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });

  return {
    promise,
    cancel: () => controller.abort(),
  };
};

export const fetchLogin = async (username: string, password: string): Promise<UserData> => {
  try {
    const request: RequestLogin =  {
      username, password
    };

    const apiResponse = await sessionApiManager.post(`/login`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLogout = async (): Promise<UserData> => {
  try {
    const apiResponse = await sessionApiManager.delete(`/login`);
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

    const apiResponse = await authApiManager.post(`/user`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserData = async (): Promise<UserData> => {
  try {
    const apiResponse = await authApiManager.get(`/user`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchRemove = async (): Promise<UserData> => {
  try {
    const apiResponse = await authApiManager.delete(`/user`);
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

    const apiResponse = await authApiManager.put(`/user/verify`, request);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchRefresh = async (): Promise<UserData> => {
  try {
    const apiResponse = await sessionApiManager.get(`/token/refresh`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSystemMetadata = async (): Promise<SystemMetadata> => {
  try {
    const apiResponse = await apiManager.get(`/system/metadata`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSystemRecords = async (): Promise<Record[]> => {
  try {
    const apiResponse = await authApiManager.get(`/system/log`);
    return apiResponse.data;
  } catch (error) {
    throw error;
  }
};