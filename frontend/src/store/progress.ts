import { create } from 'zustand';
import { UserProgress, UserStats } from '@/types';
import { 
  ProgressAPI, 
  mockUserStats, 
  mockLevelSystem, 
  mockLearningStreak, 
  mockSkillProgress,
  mockWeeklyActivity 
} from '@/api/progress';

interface ProgressFilters {
  course_id?: number;
  section_id?: number;
  completed?: boolean;
}

interface ProgressPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
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

interface WeeklyActivityData {
  date: string;
  lessons_completed: number;
  problems_solved: number;
  tests_passed: number;
  time_spent: number;
}

interface ProgressState {
  // User progress data
  userStats: UserStats | null;
  lessonProgress: UserProgress[];
  levelSystem: LevelSystemData | null;
  learningStreak: LearningStreak | null;
  skillProgress: SkillProgress[];
  weeklyActivity: WeeklyActivityData[];
  
  // Filters and pagination
  filters: ProgressFilters;
  pagination: ProgressPagination;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUserStats: () => Promise<void>;
  fetchLessonProgress: (page?: number) => Promise<void>;
  fetchLevelSystem: () => Promise<void>;
  fetchLearningStreak: () => Promise<void>;
  fetchSkillProgress: () => Promise<void>;
  fetchWeeklyActivity: () => Promise<void>;
  fetchAllProgressData: () => Promise<void>;
  updateLessonProgress: (lessonId: number, timeSpent: number) => Promise<void>;
  completeLession: (lessonId: number) => Promise<void>;
  setFilters: (filters: Partial<ProgressFilters>) => void;
  clearError: () => void;
  
  // Utility functions
  getLevelName: (level: 'junior' | 'middle' | 'senior') => string;
  getLevelIcon: (level: 'junior' | 'middle' | 'senior') => string;
  getProgressPercentage: (completed: number, total: number) => number;
  getTimeSpentFormatted: (seconds: number) => string;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial state
  userStats: mockUserStats, // Initialize with mock data
  lessonProgress: [],
  levelSystem: mockLevelSystem,
  learningStreak: mockLearningStreak,
  skillProgress: mockSkillProgress,
  weeklyActivity: mockWeeklyActivity.week_data,
  
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  
  isLoading: false,
  error: null,
  
  // Actions
  fetchUserStats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Use mock data for now
      set({
        userStats: mockUserStats,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user stats',
        isLoading: false,
      });
    }
  },
  
  fetchLessonProgress: async (page = 1) => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });
    
    try {
      // Use mock data for now
      const mockLessonProgress: UserProgress[] = [
        {
          id: 1,
          user_id: 1,
          lesson_id: 1,
          is_completed: true,
          completed_at: '2024-01-10T10:30:00Z',
          time_spent: 1800,
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-10T10:30:00Z',
        },
        {
          id: 2,
          user_id: 1,
          lesson_id: 2,
          is_completed: true,
          completed_at: '2024-01-11T14:20:00Z',
          time_spent: 2100,
          created_at: '2024-01-11T14:00:00Z',
          updated_at: '2024-01-11T14:20:00Z',
        },
        {
          id: 3,
          user_id: 1,
          lesson_id: 3,
          is_completed: false,
          time_spent: 900,
          created_at: '2024-01-12T09:00:00Z',
          updated_at: '2024-01-12T09:15:00Z',
        },
      ];
      
      set({
        lessonProgress: mockLessonProgress,
        pagination: {
          page,
          limit: pagination.limit,
          total: mockLessonProgress.length,
          pages: Math.ceil(mockLessonProgress.length / pagination.limit),
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch lesson progress',
        isLoading: false,
      });
    }
  },
  
  fetchLevelSystem: async () => {
    set({ isLoading: true, error: null });
    
    try {
      set({
        levelSystem: mockLevelSystem,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch level system',
        isLoading: false,
      });
    }
  },
  
  fetchLearningStreak: async () => {
    set({ isLoading: true, error: null });
    
    try {
      set({
        learningStreak: mockLearningStreak,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch learning streak',
        isLoading: false,
      });
    }
  },
  
  fetchSkillProgress: async () => {
    set({ isLoading: true, error: null });
    
    try {
      set({
        skillProgress: mockSkillProgress,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch skill progress',
        isLoading: false,
      });
    }
  },
  
  fetchWeeklyActivity: async () => {
    set({ isLoading: true, error: null });
    
    try {
      set({
        weeklyActivity: mockWeeklyActivity.week_data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch weekly activity',
        isLoading: false,
      });
    }
  },
  
  fetchAllProgressData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await Promise.all([
        get().fetchUserStats(),
        get().fetchLevelSystem(),
        get().fetchLearningStreak(),
        get().fetchSkillProgress(),
        get().fetchWeeklyActivity(),
      ]);
      
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch progress data',
        isLoading: false,
      });
    }
  },
  
  updateLessonProgress: async (lessonId: number, timeSpent: number) => {
    try {
      // Mock implementation
      const { lessonProgress } = get();
      const updatedProgress = lessonProgress.map(progress => 
        progress.lesson_id === lessonId 
          ? { ...progress, time_spent: progress.time_spent + timeSpent }
          : progress
      );
      
      set({ lessonProgress: updatedProgress });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update lesson progress',
      });
    }
  },
  
  completeLession: async (lessonId: number) => {
    try {
      // Mock implementation
      const { lessonProgress, userStats } = get();
      const updatedProgress = lessonProgress.map(progress => 
        progress.lesson_id === lessonId 
          ? { ...progress, is_completed: true, completed_at: new Date().toISOString() }
          : progress
      );
      
      // Update user stats
      if (userStats) {
        const updatedStats = {
          ...userStats,
          completed_lessons: userStats.completed_lessons + 1,
          total_points: userStats.total_points + 50, // Award points for completion
        };
        
        set({ 
          lessonProgress: updatedProgress,
          userStats: updatedStats,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to complete lesson',
      });
    }
  },
  
  setFilters: (newFilters: Partial<ProgressFilters>) => {
    const { filters } = get();
    set({
      filters: { ...filters, ...newFilters },
      pagination: { ...get().pagination, page: 1 },
    });
    get().fetchLessonProgress(1);
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Utility functions
  getLevelName: (level: 'junior' | 'middle' | 'senior') => {
    switch (level) {
      case 'junior': return 'Junior Developer';
      case 'middle': return 'Middle Developer';
      case 'senior': return 'Senior Developer';
      default: return 'Developer';
    }
  },
  
  getLevelIcon: (level: 'junior' | 'middle' | 'senior') => {
    switch (level) {
      case 'junior': return '🌱';
      case 'middle': return '🌿';
      case 'senior': return '🌳';
      default: return '👨‍💻';
    }
  },
  
  getProgressPercentage: (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  },
  
  getTimeSpentFormatted: (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  },
}));