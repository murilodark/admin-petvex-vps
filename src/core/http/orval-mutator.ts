import { api } from './api';
import { AxiosRequestConfig } from 'axios';

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return api.client({
    ...config,
    ...options,
  }).then((r) => {
    if (r.data && typeof r.data === 'object' && r.data !== null && 'data' in r.data) {
      return r.data.data;
    }

    return r.data;
  });
};

export default customInstance;
