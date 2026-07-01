import type { PlatformAdminUser } from '../http/generated/models/platformAdminUser';

const ADMIN_USER_KEY = 'petvex_platform_admin_user';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAdminUser(value: unknown): value is PlatformAdminUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.role === 'string' &&
    typeof value.status === 'string' &&
    (typeof value.last_login_at === 'string' || value.last_login_at === null)
  );
}

export const adminUserStorage = {
  getAdminUser(): PlatformAdminUser | null {
    const rawAdminUser = localStorage.getItem(ADMIN_USER_KEY);

    if (!rawAdminUser) {
      return null;
    }

    try {
      const parsedAdminUser: unknown = JSON.parse(rawAdminUser);
      return isAdminUser(parsedAdminUser) ? parsedAdminUser : null;
    } catch {
      this.clearAdminUser();
      return null;
    }
  },

  setAdminUser(adminUser: PlatformAdminUser): void {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
  },

  clearAdminUser(): void {
    localStorage.removeItem(ADMIN_USER_KEY);
  },
};
