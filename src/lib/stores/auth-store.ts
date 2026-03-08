// Authentication store using Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { authService } from '@/lib/api';
import type { LoginFormData, RegisterFormData } from '@/lib/validation';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds from now
  expiresAt?: number; // timestamp when token expires
  tokenType?: string;
}

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user: User) => {
        set({ user, isAuthenticated: true, error: null });
      },

      setTokens: (tokens: AuthTokens) => {
        // Calculate expiry timestamp
        const expiresAt = Date.now() + (tokens.expiresIn * 1000);
        const tokensWithExpiry = { ...tokens, expiresAt };
        set({ tokens: tokensWithExpiry });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearAuth: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },

      login: async (data: LoginFormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(data);
          if (response.success && response.data) {
            set({
              user: response.data.user,
              tokens: response.data.tokens,
              isAuthenticated: true,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          set({ error: error.message || 'Login failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data: RegisterFormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          if (response.success && response.data) {
            set({
              user: response.data.user,
              tokens: response.data.tokens,
              isAuthenticated: true,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error: any) {
          set({ error: error.message || 'Registration failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updateProfile(data);
          if (response.success && response.data) {
            set({
              user: response.data,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Profile update failed');
          }
        } catch (error: any) {
          set({ error: error.message || 'Profile update failed' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'laro-auth-storage',
      storage: createJSONStorage(() => {
        // Safe localStorage access for SSR
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a mock storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export type { LoginFormData, RegisterFormData };

// Simplified auth store without complex async operations
// Auth operations will be handled by individual components or hooks
