import { authStore } from '../../../core/auth/auth.store';
import type { AdminLoginRequest } from '../../../core/http/generated/models/adminLoginRequest';

export const authService = {
  async authenticate(credentials: AdminLoginRequest) {
    return authStore.login(credentials);
  },
  async logout() {
    return authStore.logout();
  },
};
