'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { testApi, type TestFilters, type TestSubmission } from '@/api/tests';
import { queryKeys } from '@/lib/queryKeys';
import { getAccessToken } from '@/lib/queryClient';

// Test list queries
export const useTests = (
  page: number = 1,
  limit: number = 10,
  filters?: TestFilters
) => {
  return useQuery({
    queryKey: queryKeys.tests.list({ page, limit, ...filters }),
    queryFn: () => testApi.getTests(page, limit, filters),
    enabled: !!getAccessToken(),
    staleTime: 10 * 60 * 1000, // Tests list cached for 10 minutes
  });
};

// Individual test queries
export const useTest = (id: number) => {
  return useQuery({
    queryKey: queryKeys.tests.detail(id),
    queryFn: () => testApi.getTest(id),
    enabled: !!getAccessToken() && !!id,
    staleTime: 15 * 60 * 1000, // Test details cached for 15 minutes
  });
};

// Test categories
export const useTestCategories = () => {
  return useQuery({
    queryKey: queryKeys.tests.categories(),
    queryFn: () => testApi.getTestCategories(),
    enabled: !!getAccessToken(),
    staleTime: 30 * 60 * 1000, // Categories don't change often
  });
};

// Test statistics
export const useTestStats = (testId: number) => {
  return useQuery({
    queryKey: [...queryKeys.tests.detail(testId), 'stats'] as const,
    queryFn: () => testApi.getTestStats(testId),
    enabled: !!getAccessToken() && !!testId,
    staleTime: 5 * 60 * 1000,
  });
};

// Test results queries
export const useTestResult = (id: number) => {
  return useQuery({
    queryKey: [...queryKeys.tests.results(), id] as const,
    queryFn: () => testApi.getTestResult(id),
    enabled: !!getAccessToken() && !!id,
    staleTime: 30 * 60 * 1000, // Test results don't change
  });
};

export const useUserTestResults = (
  userId?: number,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: queryKeys.tests.userResults({ userId, page, limit }),
    queryFn: () => testApi.getUserTestResults(userId, page, limit),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
  });
};

// User test progress
export const useUserTestProgress = () => {
  return useQuery({
    queryKey: [...queryKeys.progress.user(), 'test-progress'] as const,
    queryFn: () => testApi.getUserTestProgress(),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
  });
};

// Test session queries
export const useActiveTestSession = () => {
  return useQuery({
    queryKey: ['test-sessions', 'active'] as const,
    queryFn: () => testApi.getActiveTestSession(),
    enabled: !!getAccessToken(),
    staleTime: 30 * 1000, // Check every 30 seconds for active sessions
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
};

// Test leaderboard
export const useTestLeaderboard = (testId: number, limit: number = 10) => {
  return useQuery({
    queryKey: [...queryKeys.tests.detail(testId), 'leaderboard', limit] as const,
    queryFn: () => testApi.getTestLeaderboard(testId, limit),
    enabled: !!getAccessToken() && !!testId,
    staleTime: 5 * 60 * 1000,
  });
};

// Test session mutations
export const useStartTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (testId: number) => testApi.startTest(testId),
    
    onSuccess: (testSession, testId) => {
      // Update active test session
      queryClient.setQueryData(['test-sessions', 'active'], testSession);
      
      // Invalidate test-related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tests.detail(testId) 
      });
      
      toast.success('Тест начат!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при запуске теста');
    },
  });
};

export const useSubmitTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (submission: TestSubmission) => testApi.submitTest(submission),
    
    onSuccess: (testResult, submission) => {
      // Clear active test session
      queryClient.setQueryData(['test-sessions', 'active'], null);
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tests.userResults({})
      });
      queryClient.invalidateQueries({ 
        queryKey: ['test-sessions']
      });
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.progress.user(), 'test-progress']
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.userStats()
      });
      
      // Cache the new test result
      queryClient.setQueryData(
        [...queryKeys.tests.results(), testResult.id],
        testResult
      );
      
      if (testResult.is_passed) {
        toast.success(`Тест пройден! Результат: ${testResult.percentage}%`);
      } else {
        toast.warning(`Тест не пройден. Результат: ${testResult.percentage}%`);
      }
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при отправке теста');
    },
  });
};

export const useCancelTestSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: number) => testApi.cancelTestSession(sessionId),
    
    onSuccess: () => {
      // Clear active test session
      queryClient.setQueryData(['test-sessions', 'active'], null);
      
      // Invalidate session queries
      queryClient.invalidateQueries({ 
        queryKey: ['test-sessions']
      });
      
      toast.success('Тест отменен');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при отмене теста');
    },
  });
};

// Admin mutations
export const useCreateTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (testData: {
      title: string;
      description: string;
      time_limit: number;
      pass_score: number;
      points: number;
      category?: string;
    }) => testApi.createTest(testData),
    
    onSuccess: () => {
      // Invalidate all test lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.categories() });
      
      toast.success('Тест успешно создан');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка создания теста');
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: Partial<{
        title: string;
        description: string;
        time_limit: number;
        pass_score: number;
        points: number;
        is_active: boolean;
        category: string;
      }>;
    }) => testApi.updateTest(id, data),
    
    onSuccess: (updatedTest, variables) => {
      // Update the specific test in cache
      queryClient.setQueryData(queryKeys.tests.detail(variables.id), updatedTest);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.detail(variables.id) });
      
      toast.success('Тест успешно обновлен');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка обновления теста');
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => testApi.deleteTest(id),
    
    onSuccess: (_, deletedId) => {
      // Remove the test from all caches
      queryClient.removeQueries({ queryKey: queryKeys.tests.detail(deletedId) });
      
      // Invalidate test lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.lists() });
      
      toast.success('Тест успешно удален');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка удаления теста');
    },
  });
};

// Question management mutations
export const useAddQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ testId, questionData }: {
      testId: number;
      questionData: {
        question: string;
        order: number;
        points: number;
        answers: Array<{
          answer: string;
          is_correct: boolean;
          order: number;
        }>;
      };
    }) => testApi.addQuestion(testId, questionData),
    
    onSuccess: (_, variables) => {
      // Invalidate test details to refetch questions
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tests.detail(variables.testId) 
      });
      
      toast.success('Вопрос успешно добавлен');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка добавления вопроса');
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionId, questionData }: {
      questionId: number;
      questionData: Partial<{
        question: string;
        order: number;
        points: number;
      }>;
    }) => testApi.updateQuestion(questionId, questionData),
    
    onSuccess: () => {
      // Invalidate all test details since we don't know which test contains this question
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.details() });
      
      toast.success('Вопрос успешно обновлен');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка обновления вопроса');
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (questionId: number) => testApi.deleteQuestion(questionId),
    
    onSuccess: () => {
      // Invalidate all test details since we don't know which test contains this question
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.details() });
      
      toast.success('Вопрос успешно удален');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка удаления вопроса');
    },
  });
};

// Prefetch helpers
export const usePrefetchTest = () => {
  const queryClient = useQueryClient();
  
  return (testId: number) => {
    // Prefetch test details
    queryClient.prefetchQuery({
      queryKey: queryKeys.tests.detail(testId),
      queryFn: () => testApi.getTest(testId),
      staleTime: 15 * 60 * 1000,
    });
  };
};