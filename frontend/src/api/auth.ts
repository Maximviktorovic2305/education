import { AuthResponse, LoginRequest, RegisterRequest, RefreshRequest } from '@/types';
import { api } from './client';

class AuthAPI {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return api.public.post<AuthResponse>('/auth/login', credentials);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return api.public.post<AuthResponse>('/auth/register', data);
  }

  async refreshToken(data: RefreshRequest): Promise<AuthResponse> {
    return api.public.post<AuthResponse>('/auth/refresh', data);
  }

  async logout(data: RefreshRequest): Promise<void> {
    return api.public.post<void>('/auth/logout', data);
  }
}

export const authApi = new AuthAPI();