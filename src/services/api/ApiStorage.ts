import axios from "axios";

function baseURL(): string {
  const url = process.env.VITE_SERVICE_API_STORAGE;
  if(url != undefined) {
    return url
  }

  throw new Error("Storage service URI is not defined.")
}

const apiStorage = axios.create({
  baseURL: baseURL(),
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
    return Promise.reject({
      statusCode: error.status,
      statusText: error.response.statusText,
      message: error.response.data || error.message
    });
  }
);

export default apiStorage;