import axios, { AxiosInstance, AxiosResponse } from "axios";

const url = "";
const api = "/api/v1";

let isRefreshing = false;
let failedQueue: any[] = [];
let refreshHandlers: ((...any: any) => any)[] = [];

export const putRefreshHandler = (handler: (...any: any) => any) => {
  refreshHandlers.push(handler);
}

const resolveQueue = () => {
  failedQueue.forEach(prom => prom.resolve());
  failedQueue = [];
};

const rejectQueue = (error: any) => {
  failedQueue.forEach(prom => prom.reject(error));
  failedQueue = [];
};

export const hostURL = (): string => {
  if (url != "") {
    return url;
  }

  let port = import.meta.env.VITE_SERVICE_API_MANAGER_PORT;
  if (port == undefined) {
    port = window.location.port;
    console.warn(`Warning: back port is undefined, default port '${port}' will be used.`);
  }

  return `${window.location.protocol}//${window.location.hostname}:${port}`;
}

export const apiURL = (): string => {
  return `${hostURL()}${api}`;
}

export const apiManager = axios.create({
  baseURL: apiURL()
});

export const authApiManager = axios.create({
  baseURL: apiURL(),
  withCredentials: true
});

export const sessionApiManager = axios.create({
  baseURL: apiURL(),
  withCredentials: true
});

export const pushInterceptor = (
  manager: AxiosInstance,
  onFulfilled?: ((value: AxiosResponse<any, any>) => AxiosResponse<any, any> | Promise<AxiosResponse<any, any>>) | null | undefined,
  onRejected?: ((error: any) => any) | null)
  : number => {
  return manager.interceptors.response.use(
    onFulfilled,
    onRejected
  );
};

const response = (response: AxiosResponse<any, any>) => {
  return response;
}

const cancelRequest = (error: any) => {
  if (axios.isCancel(error)) {
    return Promise.reject();
  }

  return Promise.reject({
    statusCode: error.status,
    statusText: error.response?.statusText,
    message: error.response.data || error.message
  });
}

const refresh = async (error: any) => {
  const originalRequest = error.config;

  if (error.response?.status !== 498 || originalRequest._retry) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(() => apiManager(originalRequest));
  }

  isRefreshing = true;

  try {
    for (const func of refreshHandlers) {
      await func();
    }
    resolveQueue();
    return apiManager(originalRequest);
  } catch (err) {
    rejectQueue(err);
    location.reload();
    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
}

const combinedErrorHandler = async (error: any) => {
  try {
    return await refresh(error);
  } catch (refreshError) {
    return cancelRequest(refreshError);
  }
};

pushInterceptor(
  apiManager,
  response,
  cancelRequest,
)

pushInterceptor(
  sessionApiManager,
  response,
  cancelRequest,
)

pushInterceptor(
  authApiManager,
  response,
  combinedErrorHandler,
)
