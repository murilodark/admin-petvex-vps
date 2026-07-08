import { api } from './api';
import { tokenStorage } from '../storage/token.storage';
import { parseApiError } from './errors';

// Configure standard response structures and intercept 401 errors
api.client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error && error.response && error.response.status === 401) {
      tokenStorage.clearToken();
      
      if (window.location.pathname !== '/login' && !window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    
    const parsedError = parseApiError(error);
    return Promise.reject(parsedError);
  }
);

export const initInterceptors = () => {
  // Loaded for side-effects
};
