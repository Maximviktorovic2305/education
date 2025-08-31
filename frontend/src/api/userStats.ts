import { api } from './client';

export interface UserStats {
  userId: string;
  points: number;
  level: string;
  lessonsCompleted: number;
  problemsSolved: number;
  testsCompleted: number;
  certificatesEarned: number;
}

export interface UserProgress {
  totalProgress: number;
  coursesProgress: Array<{
    courseId: string;
    courseName: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
  }>;
  recentActivity: Array<{
    type: 'lesson' | 'problem' | 'test' | 'certificate';
    title: string;
    completedAt: string;
    points: number;
  }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

class UserStatsAPI {
  // Get user statistics
  async getUserStats(userId: string): Promise<UserStats> {
    return api.protected.get<UserStats>(`/users/${userId}/stats`);
  }

  // Get current user statistics
  async getCurrentUserStats(): Promise<UserStats> {
    return api.protected.get<UserStats>('/users/me/stats');
  }

  // Get user progress
  async getUserProgress(userId: string): Promise<UserProgress> {
    return api.protected.get<UserProgress>(`/users/${userId}/progress`);
  }

  // Get current user progress
  async getCurrentUserProgress(): Promise<UserProgress> {
    return api.protected.get<UserProgress>('/users/me/progress');
  }

  // Get user achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return api.protected.get<Achievement[]>(`/users/${userId}/achievements`);
  }

  // Get current user achievements
  async getCurrentUserAchievements(): Promise<Achievement[]> {
    return api.protected.get<Achievement[]>('/users/me/achievements');
  }

  // Update user stats (used when user completes activities)
  async updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
    return api.protected.patch<UserStats>('/users/me/stats', updates);
  }
}

export const userStatsAPI = new UserStatsAPI();