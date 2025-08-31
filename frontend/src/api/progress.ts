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

// Mock data for development
export const mockUserStats: UserStats = {
  total_points: 1250,
  completed_lessons: 12,
  total_lessons: 25,
  solved_problems: 18,
  total_problems: 40,
  passed_tests: 3,
  total_tests: 8,
  certificates_count: 1,
  current_level: 'middle',
  next_level_points: 2000,
  level_progress: 62.5,
};

export const mockLevelSystem: LevelSystemData = {
  current_level: 'middle',
  current_points: 1250,
  next_level_points: 2000,
  level_progress_percentage: 62.5,
  achievements: [
    {
      id: 1,
      title: 'Первые шаги',
      description: 'Завершите первый урок',
      icon: '🎯',
      points: 50,
      unlocked_at: '2024-01-10T10:00:00Z',
      is_unlocked: true,
    },
    {
      id: 2,
      title: 'Решатель задач',
      description: 'Решите 10 практических задач',
      icon: '🧩',
      points: 100,
      unlocked_at: '2024-01-15T14:30:00Z',
      is_unlocked: true,
    },
    {
      id: 3,
      title: 'Знаток тестов',
      description: 'Успешно пройдите 3 теста',
      icon: '📝',
      points: 150,
      unlocked_at: '2024-01-20T16:45:00Z',
      is_unlocked: true,
    },
    {
      id: 4,
      title: 'Мастер Go',
      description: 'Достигните уровня Senior',
      icon: '👑',
      points: 500,
      is_unlocked: false,
    },
  ],
};

export const mockLearningStreak: LearningStreak = {
  current_streak: 7,
  longest_streak: 15,
  last_activity_date: '2024-01-22T18:30:00Z',
  streak_maintained: true,
};

export const mockSkillProgress: SkillProgress[] = [
  {
    skill_name: 'Основы Go',
    level: 3,
    progress_percentage: 75,
    total_exercises: 20,
    completed_exercises: 15,
  },
  {
    skill_name: 'Функции и методы',
    level: 2,
    progress_percentage: 60,
    total_exercises: 15,
    completed_exercises: 9,
  },
  {
    skill_name: 'Структуры и интерфейсы',
    level: 2,
    progress_percentage: 40,
    total_exercises: 12,
    completed_exercises: 5,
  },
  {
    skill_name: 'Горутины и каналы',
    level: 1,
    progress_percentage: 20,
    total_exercises: 18,
    completed_exercises: 3,
  },
];

export const mockWeeklyActivity = {
  week_data: [
    {
      date: '2024-01-16',
      lessons_completed: 2,
      problems_solved: 3,
      tests_passed: 0,
      time_spent: 3600,
    },
    {
      date: '2024-01-17',
      lessons_completed: 1,
      problems_solved: 2,
      tests_passed: 1,
      time_spent: 2700,
    },
    {
      date: '2024-01-18',
      lessons_completed: 0,
      problems_solved: 1,
      tests_passed: 0,
      time_spent: 1200,
    },
    {
      date: '2024-01-19',
      lessons_completed: 3,
      problems_solved: 4,
      tests_passed: 0,
      time_spent: 4200,
    },
    {
      date: '2024-01-20',
      lessons_completed: 1,
      problems_solved: 2,
      tests_passed: 1,
      time_spent: 3000,
    },
    {
      date: '2024-01-21',
      lessons_completed: 2,
      problems_solved: 1,
      tests_passed: 0,
      time_spent: 2400,
    },
    {
      date: '2024-01-22',
      lessons_completed: 1,
      problems_solved: 3,
      tests_passed: 1,
      time_spent: 3300,
    },
  ],
};