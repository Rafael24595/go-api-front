import axios, { AxiosResponse } from "axios";

const url = "";

export const apiURL = (): string => {
  if(url != "") {
    return url;
  }
  
  let port = import.meta.env.VITE_SERVICE_API_MANAGER_PORT;
  if(port == undefined) {
    port = window.location.port;
    console.warn(`Warning: back port is undefined, default port '${port}' will be used.`);
  }
  
  return `${window.location.protocol}//${window.location.hostname}:${port}`;
}

const apiManager = axios.create({
  baseURL: apiURL(),
  withCredentials: true,
});

export const pushInterceptor = (
    onFulfilled?: ((value: AxiosResponse<any, any>) => AxiosResponse<any, any> | Promise<AxiosResponse<any, any>>) | null | undefined, 
    onRejected?: ((error: any) => any) | null)
  : number => {
  return apiManager.interceptors.response.use(
    onFulfilled,
    onRejected
  );
};

pushInterceptor(
  (response) => response,
  (error) => {
    //TODO: Remove log.
    console.error("API Error:", error.response || error.message);

    if(axios.isCancel(error)) {
      return Promise.reject();
    }

    return Promise.reject({
      statusCode: error.status,
      statusText: error.response.statusText,
      message: error.response.data || error.message
    });
  }
)

export default apiManager;
