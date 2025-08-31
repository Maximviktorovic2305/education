import { create } from 'zustand';
import { userStatsAPI, UserStats, UserProgress, Achievement } from '@/api/userStats';

interface UserStatsState {
  // Data
  stats: UserStats | null;
  progress: UserProgress | null;
  achievements: Achievement[];
  
  // Loading states
  statsLoading: boolean;
  progressLoading: boolean;
  achievementsLoading: boolean;
  
  // Error states
  statsError: string | null;
  progressError: string | null;
  achievementsError: string | null;
  
  // Actions
  fetchUserStats: () => Promise<void>;
  fetchUserProgress: () => Promise<void>;
  fetchUserAchievements: () => Promise<void>;
  fetchAllUserData: () => Promise<void>;
  updateStats: (updates: Partial<UserStats>) => Promise<void>;
  clearUserData: () => void;
  clearErrors: () => void;
}

export const useUserStatsStore = create<UserStatsState>((set, get) => ({
  // Initial state
  stats: null,
  progress: null,
  achievements: [],
  
  statsLoading: false,
  progressLoading: false,
  achievementsLoading: false,
  
  statsError: null,
  progressError: null,
  achievementsError: null,
  
  // Actions
  fetchUserStats: async () => {
    set({ statsLoading: true, statsError: null });
    try {
      const stats = await userStatsAPI.getCurrentUserStats();
      set({ stats, statsLoading: false });
    } catch (error) {
      set({ 
        statsError: error instanceof Error ? error.message : 'Failed to fetch user stats',
        statsLoading: false 
      });
    }
  },
  
  fetchUserProgress: async () => {
    set({ progressLoading: true, progressError: null });
    try {
      const progress = await userStatsAPI.getCurrentUserProgress();
      set({ progress, progressLoading: false });
    } catch (error) {
      set({ 
        progressError: error instanceof Error ? error.message : 'Failed to fetch user progress',
        progressLoading: false 
      });
    }
  },
  
  fetchUserAchievements: async () => {
    set({ achievementsLoading: true, achievementsError: null });
    try {
      const achievements = await userStatsAPI.getCurrentUserAchievements();
      set({ achievements, achievementsLoading: false });
    } catch (error) {
      set({ 
        achievementsError: error instanceof Error ? error.message : 'Failed to fetch achievements',
        achievementsLoading: false 
      });
    }
  },
  
  fetchAllUserData: async () => {
    const { fetchUserStats, fetchUserProgress, fetchUserAchievements } = get();
    await Promise.all([
      fetchUserStats(),
      fetchUserProgress(),
      fetchUserAchievements(),
    ]);
  },
  
  updateStats: async (updates: Partial<UserStats>) => {
    set({ statsLoading: true, statsError: null });
    try {
      const updatedStats = await userStatsAPI.updateUserStats(updates);
      set({ stats: updatedStats, statsLoading: false });
    } catch (error) {
      set({ 
        statsError: error instanceof Error ? error.message : 'Failed to update stats',
        statsLoading: false 
      });
    }
  },
  
  clearUserData: () => {
    set({ 
      stats: null,
      progress: null,
      achievements: [],
      statsLoading: false,
      progressLoading: false,
      achievementsLoading: false,
      statsError: null,
      progressError: null,
      achievementsError: null,
    });
  },
  
  clearErrors: () => {
    set({ 
      statsError: null,
      progressError: null,
      achievementsError: null 
    });
  },
}));