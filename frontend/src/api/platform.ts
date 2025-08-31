import { api } from './client';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  count?: number;
}

export interface Level {
  id: string;
  name: string;
  points: number;
  color: string;
  description?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalLessons: number;
  totalProblems: number;
  totalTests: number;
}

class PlatformAPI {
  // Get platform features
  async getFeatures(): Promise<Feature[]> {
    return api.public.get<Feature[]>('/platform/features');
  }

  // Get available levels
  async getLevels(): Promise<Level[]> {
    return api.public.get<Level[]>('/platform/levels');
  }

  // Get platform statistics
  async getStats(): Promise<PlatformStats> {
    return api.public.get<PlatformStats>('/platform/stats');
  }
}

export const platformAPI = new PlatformAPI();