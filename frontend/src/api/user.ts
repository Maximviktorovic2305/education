import { User } from '@/types';
import { api } from './client';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

class UserAPI {
  async getProfile(): Promise<User> {
    return api.protected.get<User>('/users/profile');
  }

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    return api.protected.put<User>('/users/profile', data);
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.upload.post<{ avatar_url: string }>('/users/avatar', formData);
  }

  async deleteAccount(): Promise<void> {
    return api.protected.delete<void>('/users/profile');
  }
}

export const userApi = new UserAPI();