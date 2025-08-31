import { create } from 'zustand';
import { platformAPI, Feature, Level, PlatformStats } from '@/api/platform';

interface PlatformState {
  // Data
  features: Feature[];
  levels: Level[];
  stats: PlatformStats | null;
  
  // Loading states
  featuresLoading: boolean;
  levelsLoading: boolean;
  statsLoading: boolean;
  
  // Error states
  featuresError: string | null;
  levelsError: string | null;
  statsError: string | null;
  
  // Actions
  fetchFeatures: () => Promise<void>;
  fetchLevels: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchAllPlatformData: () => Promise<void>;
  clearErrors: () => void;
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  // Initial state
  features: [],
  levels: [],
  stats: null,
  
  featuresLoading: false,
  levelsLoading: false,
  statsLoading: false,
  
  featuresError: null,
  levelsError: null,
  statsError: null,
  
  // Actions
  fetchFeatures: async () => {
    set({ featuresLoading: true, featuresError: null });
    try {
      const features = await platformAPI.getFeatures();
      set({ features, featuresLoading: false });
    } catch (error) {
      set({ 
        featuresError: error instanceof Error ? error.message : 'Failed to fetch features',
        featuresLoading: false 
      });
    }
  },
  
  fetchLevels: async () => {
    set({ levelsLoading: true, levelsError: null });
    try {
      const levels = await platformAPI.getLevels();
      set({ levels, levelsLoading: false });
    } catch (error) {
      set({ 
        levelsError: error instanceof Error ? error.message : 'Failed to fetch levels',
        levelsLoading: false 
      });
    }
  },
  
  fetchStats: async () => {
    set({ statsLoading: true, statsError: null });
    try {
      const stats = await platformAPI.getStats();
      set({ stats, statsLoading: false });
    } catch (error) {
      set({ 
        statsError: error instanceof Error ? error.message : 'Failed to fetch stats',
        statsLoading: false 
      });
    }
  },
  
  fetchAllPlatformData: async () => {
    const { fetchFeatures, fetchLevels, fetchStats } = get();
    await Promise.all([
      fetchFeatures(),
      fetchLevels(),
      fetchStats(),
    ]);
  },
  
  clearErrors: () => {
    set({ 
      featuresError: null,
      levelsError: null,
      statsError: null 
    });
  },
}));