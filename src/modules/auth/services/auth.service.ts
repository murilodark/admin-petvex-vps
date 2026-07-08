import { authStore } from '../../../core/auth/auth.store';
import { LoginCredentials } from '../../../core/http/generated/models/loginCredentials';

export const authService = {
  async authenticate(credentials: LoginCredentials) {
    return authStore.login(credentials);
  },
  async logout() {
    return authStore.logout();
  },
};
