import axios from "axios";

function baseURL(): string {
  const url = import.meta.env.VITE_SERVICE_API_MANAGER;
  if(url != undefined) {
    return url
  }
  throw new Error("Manager service URI is not defined.")
}

const apiManager = axios.create({
  baseURL: baseURL(),
  timeout: 10000,
});

apiManager.interceptors.request.use(
  (config) => {
    //TODO: Implement user token.
    return config;
  },
  (error) => Promise.reject(error)
);

apiManager.interceptors.response.use(
  (response) => response,
  (error) => {
    //TODO: Manage exceptions.
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiManager;