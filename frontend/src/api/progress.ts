import { api } from './client';
import { UserProgress, UserStats, PaginatedResponse } from '@/types';

interface ProgressFilters {
  course_id?: number;
  section_id?: number;
  completed?: boolean;
}

interface LevelSystemData {
  current_level: 'junior' | 'middle' | 'senior';
  current_points: number;
  next_level_points: number;
  level_progress_percentage: number;
  achievements: Achievement[];
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at?: string;
  is_unlocked: boolean;
}

interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_maintained: boolean;
}

interface SkillProgress {
  skill_name: string;
  level: number;
  progress_percentage: number;
  total_exercises: number;
  completed_exercises: number;
}

export class ProgressAPI {
  // Get user's overall progress statistics
  static async getUserStats(userId?: number): Promise<UserStats> {
    const endpoint = userId ? `/users/${userId}/stats` : '/users/me/stats';
    const response = await api.protected.get<UserStats>(endpoint);
    return response;
  }

  // Get detailed progress for lessons
  static async getLessonProgress(
    page: number = 1,
    limit: number = 20,
    filters: ProgressFilters = {}
  ): Promise<PaginatedResponse<UserProgress>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
      ),
    });

    const response = await api.protected.get<PaginatedResponse<UserProgress>>(`/progress/lessons?${params}`);
    return response;
  }

  // Get level system data
  static async getLevelSystem(): Promise<LevelSystemData> {
    const response = await api.protected.get<LevelSystemData>('/users/me/level-system');
    return response;
  }

  // Get learning streak information
  static async getLearningStreak(): Promise<LearningStreak> {
    const response = await api.protected.get<LearningStreak>('/users/me/streak');
    return response;
  }

  // Get skill-based progress
  static async getSkillProgress(): Promise<SkillProgress[]> {
    const response = await api.protected.get<SkillProgress[]>('/users/me/skills');
    return response;
  }

  // Update lesson progress
  static async updateLessonProgress(lessonId: number, timeSpent: number): Promise<UserProgress> {
    const response = await api.protected.post<UserProgress>(`/progress/lessons/${lessonId}`, {
      time_spent: timeSpent,
    });
    return response;
  }

  // Mark lesson as completed
  static async completeLession(lessonId: number): Promise<UserProgress> {
    const response = await api.protected.post<UserProgress>(`/progress/lessons/${lessonId}/complete`);
    return response;
  }

  // Get weekly activity data
  static async getWeeklyActivity(): Promise<{
    week_data: Array<{
      date: string;
      lessons_completed: number;
      problems_solved: number;
      tests_passed: number;
      time_spent: number;
    }>;
  }> {
    const response = await api.protected.get<{
      week_data: Array<{
        date: string;
        lessons_completed: number;
        problems_solved: number;
        tests_passed: number;
        time_spent: number;
      }>;
    }>('/users/me/activity/weekly');
    return response;
  }

  // Get monthly progress summary
  static async getMonthlyProgress(): Promise<{
    monthly_data: Array<{
      month: string;
      total_points: number;
      lessons_completed: number;
      problems_solved: number;
      tests_passed: number;
    }>;
  }> {
    const response = await api.protected.get<{
      monthly_data: Array<{
        month: string;
        total_points: number;
        lessons_completed: number;
        problems_solved: number;
        tests_passed: number;
      }>;
    }>('/users/me/progress/monthly');
    return response;
  }
}
