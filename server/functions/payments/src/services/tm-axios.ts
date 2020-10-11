import axios, { AxiosInstance } from 'axios';

const instance: AxiosInstance = axios.create({
  baseURL: process.env.PUBLIC_API_BASE_URL,
});

instance.defaults.headers.common['Content-Type'] = 'application/json';

instance.interceptors.request.use(undefined, error => {
  console.error('Request Error: ', error);
  return Promise.reject(error);
});

instance.interceptors.response.use(
  response => {
    console.log(
      `Status: ${response?.status} (${response?.statusText}). URL: ${response?.config?.url}`
    );
    return response;
  },
  error => {
    console.log(
      `Error: ${error?.response?.status} (${error?.response?.statusText})`
    );
    console.log('URL: ', error?.config?.url);
    console.log('Payload: ', error?.config?.data);
    return Promise.reject(error);
  }
);

export default instance;
