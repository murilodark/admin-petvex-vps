import { meAdminAuth } from '../../../core/http/generated/endpoints/admin-auth/admin-auth';
import type { PlatformAdminUser } from '../../../core/http/generated/models/platformAdminUser';

export const profileService = {
  async getProfile(): Promise<PlatformAdminUser> {
    const response = await meAdminAuth();
    return 'data' in response ? response.data : response;
  },
};
