'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';
import { userApi } from '@/api/user';
import { queryKeys } from '@/lib/queryKeys';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '@/lib/queryClient';
import type { LoginRequest, RegisterRequest, UpdateUserRequest } from '@/types';

// Authentication mutations
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      // Store tokens in localStorage
      setTokens(data.access_token, data.refresh_token);
      
      // Set user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), data.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
      
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
      
      toast.success('Успешный вход!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка входа');
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      // Store tokens in localStorage
      setTokens(data.access_token, data.refresh_token);
      
      // Set user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), data.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
      
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      
      toast.success('Регистрация прошла успешно!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка регистрации');
    },
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      return authApi.refreshToken({ refresh_token: refreshToken });
    },
    onSuccess: (data) => {
      // Update tokens in localStorage
      setTokens(data.access_token, data.refresh_token);
      
      // Update user data in cache
      queryClient.setQueryData(queryKeys.user.profile(), data.user);
      
      // Invalidate queries to trigger refetch with new token
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
    onError: () => {
      // If refresh fails, clear tokens and redirect to login
      clearTokens();
      queryClient.clear();
      window.location.href = '/auth/login';
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return Promise.resolve();
      }
      return authApi.logout({ refresh_token: refreshToken });
    },
    onSuccess: () => {
      // Clear tokens from localStorage
      clearTokens();
      
      // Clear all cached data
      queryClient.clear();
      
      // Redirect to home page
      router.push('/');
      
      toast.success('Выход выполнен успешно');
    },
    onError: (error: any) => {
      // Even if logout fails on server, still clear local data
      clearTokens();
      queryClient.clear();
      router.push('/');
      
      toast.error(error.message || 'Ошибка при выходе');
    },
  });
};

// User profile queries
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => userApi.getProfile(),
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update the cached user data
      queryClient.setQueryData(queryKeys.user.profile(), updatedUser);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      
      toast.success('Профиль обновлен успешно');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка обновления профиля');
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: (data) => {
      // Update the cached user data with new avatar
      const currentUser = queryClient.getQueryData(queryKeys.user.profile());
      if (currentUser) {
        queryClient.setQueryData(queryKeys.user.profile(), {
          ...currentUser,
          avatar: data.avatar_url,
        });
      }
      
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      
      toast.success('Аватар загружен успешно');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка загрузки аватара');
    },
  });
};

export const useDeleteAccount = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      // Clear tokens and all cached data
      clearTokens();
      queryClient.clear();
      
      // Redirect to home page
      router.push('/');
      
      toast.success('Аккаунт удален успешно');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка удаления аккаунта');
    },
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  return !!getAccessToken();
};