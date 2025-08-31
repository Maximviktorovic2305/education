'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProgressAPI } from '@/api/progress';
import { userStatsAPI } from '@/api/userStats';
import { queryKeys } from '@/lib/queryKeys';
import { getAccessToken } from '@/lib/queryClient';

// User stats and progress queries
export const useUserStats = (userId?: number) => {
  return useQuery({
    queryKey: userId 
      ? ['users', userId, 'stats'] as const
      : queryKeys.progress.userStats(),
    queryFn: () => ProgressAPI.getUserStats(userId),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000, // 2 minutes - stats are more dynamic
  });
};

export const useCurrentUserStats = () => {
  return useQuery({
    queryKey: queryKeys.progress.userStats(),
    queryFn: () => userStatsAPI.getCurrentUserStats(),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useUserProgress = (filters?: {
  course_id?: number;
  section_id?: number;
  completed?: boolean;
}, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.progress.userProgress({ ...filters, page, limit }),
    queryFn: () => ProgressAPI.getLessonProgress(page, limit, filters),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCurrentUserProgress = () => {
  return useQuery({
    queryKey: ['users', 'me', 'progress'] as const,
    queryFn: () => userStatsAPI.getCurrentUserProgress(),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
  });
};

// Level system and achievements
export const useLevelSystem = () => {
  return useQuery({
    queryKey: queryKeys.progress.levelSystem(),
    queryFn: () => ProgressAPI.getLevelSystem(),
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // Level changes less frequently
  });
};

export const useAchievements = (userId?: string) => {
  return useQuery({
    queryKey: userId 
      ? ['users', userId, 'achievements'] as const
      : ['users', 'me', 'achievements'] as const,
    queryFn: () => userId 
      ? userStatsAPI.getUserAchievements(userId)
      : userStatsAPI.getCurrentUserAchievements(),
    enabled: !!getAccessToken(),
    staleTime: 10 * 60 * 1000, // Achievements don't change often
  });
};

// Learning streak
export const useLearningStreak = () => {
  return useQuery({
    queryKey: queryKeys.progress.learningStreak(),
    queryFn: () => ProgressAPI.getLearningStreak(),
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
  });
};

// Skill progress
export const useSkillProgress = () => {
  return useQuery({
    queryKey: queryKeys.progress.skillProgress(),
    queryFn: () => ProgressAPI.getSkillProgress(),
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
  });
};

// Activity data
export const useWeeklyActivity = () => {
  return useQuery({
    queryKey: queryKeys.progress.weeklyActivity(),
    queryFn: () => ProgressAPI.getWeeklyActivity(),
    enabled: !!getAccessToken(),
    staleTime: 10 * 60 * 1000, // Weekly data can be cached longer
  });
};

export const useMonthlyProgress = () => {
  return useQuery({
    queryKey: queryKeys.progress.monthlyProgress(),
    queryFn: () => ProgressAPI.getMonthlyProgress(),
    enabled: !!getAccessToken(),
    staleTime: 30 * 60 * 1000, // Monthly data can be cached even longer
  });
};

// Progress update mutations
export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, timeSpent }: {
      lessonId: number;
      timeSpent: number;
    }) => ProgressAPI.updateLessonProgress(lessonId, timeSpent),
    
    onMutate: async ({ lessonId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.progress.userProgress()
      });
      
      // Snapshot previous value
      const previousProgress = queryClient.getQueryData(queryKeys.progress.userProgress());
      
      return { previousProgress };
    },
    
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.all
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.stats()
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.lesson(variables.lessonId)
      });
      
      toast.success('Прогресс урока обновлен');
    },
    
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(
          queryKeys.progress.userProgress(), 
          context.previousProgress
        );
      }
      toast.error(error.message || 'Ошибка обновления прогресса');
    },
    
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.userProgress()
      });
    },
  });
};

export const useCompleteLessonProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lessonId: number) => ProgressAPI.completeLession(lessonId),
    
    onMutate: async (lessonId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.courses.lesson(lessonId)
      });
      
      // Snapshot previous value
      const previousLesson = queryClient.getQueryData(queryKeys.courses.lesson(lessonId));
      
      // Optimistically update lesson completion
      queryClient.setQueryData(queryKeys.courses.lesson(lessonId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_completed: true,
          completed_at: new Date().toISOString(),
        };
      });
      
      return { previousLesson, lessonId };
    },
    
    onSuccess: (data, lessonId) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.all
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.stats()
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.lesson(lessonId)
      });
      
      toast.success('Урок успешно завершен!');
    },
    
    onError: (error: any, lessonId, context) => {
      // Rollback optimistic update on error
      if (context?.previousLesson) {
        queryClient.setQueryData(
          queryKeys.courses.lesson(lessonId), 
          context.previousLesson
        );
      }
      toast.error(error.message || 'Ошибка при завершении урока');
    },
    
    onSettled: (data, error, lessonId) => {
      // Always refetch after mutation completes
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.lesson(lessonId)
      });
    },
  });
};

export const useUpdateUserStats = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: any) => userStatsAPI.updateUserStats(updates),
    
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.progress.userStats()
      });
      
      // Snapshot previous value
      const previousStats = queryClient.getQueryData(queryKeys.progress.userStats());
      
      // Optimistically update stats
      queryClient.setQueryData(queryKeys.progress.userStats(), (old: any) => {
        if (!old) return old;
        return { ...old, ...updates };
      });
      
      return { previousStats };
    },
    
    onSuccess: (updatedStats) => {
      // Update the cached stats
      queryClient.setQueryData(queryKeys.progress.userStats(), updatedStats);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.all
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.all
      });
    },
    
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousStats) {
        queryClient.setQueryData(
          queryKeys.progress.userStats(), 
          context.previousStats
        );
      }
      toast.error(error.message || 'Ошибка обновления статистики');
    },
    
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.userStats()
      });
    },
  });
};

// Helper hooks for common progress scenarios
export const useUserProgressSummary = () => {
  const { data: stats } = useUserStats();
  const { data: levelSystem } = useLevelSystem();
  const { data: streak } = useLearningStreak();
  const { data: achievements } = useAchievements();
  
  return {
    stats,
    levelSystem,
    streak,
    achievements,
    isLoading: !stats || !levelSystem || !streak || !achievements,
  };
};

// Prefetch helpers
export const usePrefetchProgressData = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Prefetch common progress data
    queryClient.prefetchQuery({
      queryKey: queryKeys.progress.userStats(),
      queryFn: () => ProgressAPI.getUserStats(),
      staleTime: 2 * 60 * 1000,
    });
    
    queryClient.prefetchQuery({
      queryKey: queryKeys.progress.levelSystem(),
      queryFn: () => ProgressAPI.getLevelSystem(),
      staleTime: 5 * 60 * 1000,
    });
    
    queryClient.prefetchQuery({
      queryKey: queryKeys.progress.learningStreak(),
      queryFn: () => ProgressAPI.getLearningStreak(),
      staleTime: 5 * 60 * 1000,
    });
  };
};