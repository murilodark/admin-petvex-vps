import { authStore } from './auth.store';
import { LoginCredentials } from '../http/generated/models/loginCredentials';

export const authService = {
  login(credentials: LoginCredentials) {
    return authStore.login(credentials);
  },
  logout() {
    return authStore.logout();
  },
  getCurrentUser() {
    return authStore.loadMe();
  },
};
