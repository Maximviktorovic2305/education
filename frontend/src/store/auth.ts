'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { authApi } from '@/api/auth';

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
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка входа в систему',
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
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка регистрации',
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
          console.error('Ошибка при выходе из системы:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: null,
          });
        }
      },
      
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('Отсутствует refresh token');
        }
        
        try {
          const response = await authApi.refreshToken({ refresh_token: refreshToken });
          
          set({
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          });
        } catch (error) {
          // Если refresh token недействителен, разлогиниваем пользователя
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: 'Сессия истекла, необходимо войти заново',
          });
          throw error;
        }
      },
      
      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      initializeAuth: () => {
        const state = get();
        // Проверяем, есть ли сохранённые токены
        if (state.refreshToken && !state.isAuthenticated) {
          // Пытаемся обновить токен при инициализации
          state.refreshAccessToken().catch(() => {
            // Если не получилось, очищаем состояние
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
        // После восстановления состояния инициализируем авторизацию
        if (state) {
          state.initializeAuth();
        }
      },
    }
  )
);