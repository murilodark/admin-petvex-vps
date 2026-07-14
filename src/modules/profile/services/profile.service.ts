import { meAdminAuthMe } from '../../../core/http/generated/endpoints/admin-auth/admin-auth';

export const profileService = {
  async getProfile() {
    return meAdminAuthMe();
  },
};
