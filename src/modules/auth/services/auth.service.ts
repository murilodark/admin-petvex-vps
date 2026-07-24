import { authStore } from '../../../core/auth/auth.store';
import { AdminLoginRequest } from '../../../core/http/generated/models/admin-auth';

export const authService = {
  async authenticate(credentials: AdminLoginRequest) {
    return authStore.login(credentials);
  },
  async logout() {
    return authStore.logout();
  },
};
