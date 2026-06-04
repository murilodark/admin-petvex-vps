import { getMe } from '../../../core/http/generated/endpoints/endpoints';

export const profileService = {
  async getProfile() {
    return getMe();
  },
};
