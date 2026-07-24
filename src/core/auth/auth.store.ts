import { useSyncExternalStore } from 'react';
import { tokenStorage } from '../storage/token.storage';
import {
  loginAdminAuthLogin,
  logoutAdminAuthLogout,
  meAdminAuthMe,
} from '../http/generated/endpoints/admin-auth/admin-auth';
import type {
  AdminLoginRequest,
  LoginAdminAuthLogin200,
  LoginAdminAuthLogin200Data,
} from '../http/generated/models/admin-auth';

export interface AuthUser {
  id?: number | string;
  name?: string;
  email?: string;
  is_global_admin?: boolean;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type Listener = (state: AuthState) => void;

let state: AuthState = {
  token: tokenStorage.getToken(),
  user: null,
  isAuthenticated: !!tokenStorage.getToken(),
  isLoading: !!tokenStorage.getToken(), // If has token, load me
};

const listeners = new Set<Listener>();

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

  async login(credentials: AdminLoginRequest): Promise<LoginAdminAuthLogin200> {
    this._setState({ isLoading: true });
    try {
      const payload: AdminLoginRequest = {
        email: credentials.email ?? '',
        password: credentials.password ?? '',
      };
      const response = await loginAdminAuthLogin(payload);
      
      // Our customInstance mutator automatically unwraps response.data when the 'data' key exists.
      // Therefore, at runtime, 'response' might be the unwrapped LoginAdminAuthLogin200Data or the wrapped LoginAdminAuthLogin200.
      // We extract the token in a robust, type-safe manner without 'any'.
      let token: string | undefined;

      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object' && 'token' in response.data) {
          token = (response.data as LoginAdminAuthLogin200Data).token;
        } else if ('token' in response) {
          token = (response as unknown as LoginAdminAuthLogin200Data).token;
        }
      }

      if (!token) {
        throw new Error('Login response did not include a token.');
      }

      this.setToken(token);

      const meResponse = await meAdminAuthMe();

      // meAdminAuthMe is typed to return MeAdminAuthMe200, but at runtime the mutator unwraps meResponse.data.
      // We safely resolve this to the AuthUser type.
      let currentUser: AuthUser | null = null;
      if (meResponse) {
        if (typeof meResponse === 'object' && 'data' in meResponse) {
          currentUser = (meResponse.data as unknown as AuthUser) ?? null;
        } else {
          currentUser = (meResponse as unknown as AuthUser) ?? null;
        }
      }

      this._setState({
        token,
        user: currentUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return response;
    } catch (error) {
      this._setState({ isLoading: false, isAuthenticated: false, token: null });
      tokenStorage.clearToken();
      throw error;
    }
  },

  async logout() {
    this._setState({ isLoading: true });
    try {
      await logoutAdminAuthLogout();
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
      this._setState({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    this._setState({ isLoading: true });
    try {
      const meResponse = await meAdminAuthMe();

      let currentUser: AuthUser | null = null;
      if (meResponse) {
        if (typeof meResponse === 'object' && 'data' in meResponse) {
          currentUser = (meResponse.data as unknown as AuthUser) ?? null;
        } else {
          currentUser = (meResponse as unknown as AuthUser) ?? null;
        }
      }

      this._setState({
        token,
        user: currentUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      this.clearSession();
    }
  },

  setToken(token: string) {
    tokenStorage.setToken(token);
    this._setState({ token, isAuthenticated: true });
  },

  clearSession() {
    tokenStorage.clearToken();
    this._setState({
      token: null,
      user: null,
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
    login: (credentials: AdminLoginRequest) => authStore.login(credentials),
    logout: () => authStore.logout(),
    loadMe: () => authStore.loadMe(),
    setToken: (token: string) => authStore.setToken(token),
    clearSession: () => authStore.clearSession(),
  };
}
