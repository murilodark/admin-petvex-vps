import { useSyncExternalStore } from 'react';
import { tokenStorage } from '../storage/token.storage';
import { adminUserStorage } from '../storage/admin-user.storage';
import {
  loginAdminAuth,
  logoutAdminAuth,
  meAdminAuth,
} from '../http/generated/endpoints/admin-auth/admin-auth';
import type {
  AdminLoginRequest,
  LoginAdminAuth200,
  LoginAdminAuth200Data,
  MeAdminAuth200,
  PlatformAdminUser,
} from '../http/generated/models';

export interface AuthState {
  token: string | null;
  adminUser: PlatformAdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type Listener = (state: AuthState) => void;

const storedToken = tokenStorage.getToken();

let state: AuthState = {
  token: storedToken,
  adminUser: storedToken ? adminUserStorage.getAdminUser() : null,
  isAuthenticated: !!storedToken,
  isLoading: !!storedToken,
};

const listeners = new Set<Listener>();

function resolveLoginData(
  response: LoginAdminAuth200 | LoginAdminAuth200Data,
): LoginAdminAuth200Data {
  if ('token' in response && 'admin' in response) {
    return response;
  }

  return response.data;
}

function resolveAdminUser(response: MeAdminAuth200 | PlatformAdminUser): PlatformAdminUser {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

export const authStore = {
  get state() {
    return state;
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  _setState(newState: Partial<AuthState>) {
    state = { ...state, ...newState };
    listeners.forEach((listener) => listener(state));
  },

  async login(credentials: AdminLoginRequest) {
    this._setState({ isLoading: true });
    try {
      const response = resolveLoginData(await loginAdminAuth(credentials));
      const { token, admin } = response;

      tokenStorage.setToken(token);
      adminUserStorage.setAdminUser(admin);

      this._setState({
        token,
        adminUser: admin,
        isAuthenticated: true,
        isLoading: false,
      });

      return response;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  },

  async logout() {
    this._setState({ isLoading: true });
    try {
      await logoutAdminAuth();
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      this.clearSession();
      // Redirect to /login
      window.location.href = '/login';
    }
  },

  async loadMe() {
    const token = tokenStorage.getToken();
    if (!token) {
      this.clearSession();
      return;
    }
    this._setState({ isLoading: true });
    try {
      const adminUser = resolveAdminUser(await meAdminAuth());
      adminUserStorage.setAdminUser(adminUser);

      this._setState({
        token,
        adminUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load platform admin user:', error);
      this.clearSession();
    }
  },

  setToken(token: string) {
    tokenStorage.setToken(token);
    this._setState({ token, isAuthenticated: true });
  },

  clearSession() {
    tokenStorage.clearToken();
    adminUserStorage.clearAdminUser();
    this._setState({
      token: null,
      adminUser: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
};

export function useAuth() {
  const authState = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.state
  );

  return {
    ...authState,
    user: authState.adminUser,
    me: authState.adminUser,
    login: (credentials: AdminLoginRequest) => authStore.login(credentials),
    logout: () => authStore.logout(),
    loadMe: () => authStore.loadMe(),
    setToken: (token: string) => authStore.setToken(token),
    clearSession: () => authStore.clearSession(),
  };
}
