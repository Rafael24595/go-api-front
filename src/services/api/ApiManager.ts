import axios from "axios";

function baseURL(): string {
  const url = `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_SERVICE_API_MANAGER_PORT}`;
  if(url != undefined) {
    return url
  }
  throw new Error("Manager service URI is not defined.")
}

const apiManager = axios.create({
  baseURL: baseURL(),
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
    return Promise.reject({
      statusCode: error.status,
      statusText: error.response.statusText,
      message: error.response.data || error.message
    });
  }
);

export default apiManager;