import axios from "axios";

function baseURL(): string {
  const url = process.env.REACT_APP_SERVICE_API_MANAGER;
  if(url != undefined) {
    return url
  }
  throw new Error("Manager service URI is not defined.")
}

const apiStorage = axios.create({
  baseURL: baseURL(),
  timeout: 10000,
});

apiStorage.interceptors.request.use(
  (config) => {
    //TODO: Implement user token.
    return config;
  },
  (error) => Promise.reject(error)
);

apiStorage.interceptors.response.use(
  (response) => response,
  (error) => {
    //TODO: Manage exceptions.
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiStorage;