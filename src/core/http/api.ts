import axios from 'axios';
import { apiConfig } from '../config/api.config';
import { tokenStorage } from '../storage/token.storage';

const client = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  client,
};
