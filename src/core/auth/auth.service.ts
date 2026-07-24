import { authStore } from './auth.store';
import { AdminLoginRequest } from '../http/generated/models/admin-auth';

export const authService = {
  login(credentials: AdminLoginRequest) {
    return authStore.login(credentials);
  },
  logout() {
    return authStore.logout();
  },
  getCurrentUser() {
    return authStore.loadMe();
  },
};
