import { useSyncExternalStore } from 'react';
import { tokenStorage } from '../storage/token.storage';
import { User } from '../http/generated/models/user';
import { postAuthLogin, postAuthLogout, getMe } from '../http/generated/endpoints/endpoints';
import { LoginCredentials } from '../http/generated/models/loginCredentials';

export interface AuthState {
  token: string | null;
  user: User | null;
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

  async login(credentials: LoginCredentials) {
    this._setState({ isLoading: true });
    try {
      const response = await postAuthLogin(credentials);
      const token = response.token;
      
      this.setToken(token);
      
      let currentUser = response.user;
      if (!currentUser) {
        // fetch me if user wasn't returned in the response
        currentUser = await getMe();
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
      await postAuthLogout();
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
      const user = await getMe();
      this._setState({
        token,
        user,
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
    login: (credentials: LoginCredentials) => authStore.login(credentials),
    logout: () => authStore.logout(),
    loadMe: () => authStore.loadMe(),
    setToken: (token: string) => authStore.setToken(token),
    clearSession: () => authStore.clearSession(),
  };
}
