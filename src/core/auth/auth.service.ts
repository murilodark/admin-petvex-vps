import { authStore } from './auth.store';
import type { AdminLoginRequest } from '../http/generated/models/adminLoginRequest';

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
