'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { authApi } from '@/api/auth';
import { ApiException } from '@/api/client';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.login(credentials);
          
          set({
            user: response.user,
            isAuthenticated: true,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof ApiException 
            ? error.message 
            : error instanceof Error 
            ? error.message 
            : 'Login failed';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
      
      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.register(data);
          
          set({
            user: response.user,
            isAuthenticated: true,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof ApiException 
            ? error.message 
            : error instanceof Error 
            ? error.message 
            : 'Registration failed';
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
      
      logout: async () => {
        const { refreshToken } = get();
        
        try {
          if (refreshToken) {
            await authApi.logout({ refresh_token: refreshToken });
          }
        } catch (error) {
          // Log error but don't prevent logout
          console.error('Logout error:', error instanceof ApiException ? error.message : 'Unknown error');
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: null,
          });
          
          // Clear user stats data
          try {
            const { useUserStatsStore } = await import('./userStats');
            useUserStatsStore.getState().clearUserData();
          } catch (error) {
            console.error('Failed to clear user stats:', error);
          }
        }
      },
      
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new ApiException('No refresh token available', 401);
        }
        
        try {
          const response = await authApi.refreshToken({ refresh_token: refreshToken });
          
          set({
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          });
        } catch (error) {
          // If refresh token is invalid, logout user
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: 'Session expired, please login again',
          });
          throw error;
        }
      },
      
      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      updateUser: (user: User) => set({ user }),
      
      initializeAuth: () => {
        const state = get();
        // Check if we have saved tokens
        if (state.refreshToken && !state.isAuthenticated) {
          // Try to refresh token on initialization
          state.refreshAccessToken().catch(() => {
            // If failed, clear state
            state.logout();
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        // After state restoration, initialize auth
        if (state) {
          state.initializeAuth();
        }
      },
    }
  )
);