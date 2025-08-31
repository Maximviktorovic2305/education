'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { problemApi, type ProblemFilters, type SubmitSolutionRequest } from '@/api/problems';
import { queryKeys } from '@/lib/queryKeys';
import { getAccessToken } from '@/lib/queryClient';

// Problem list queries
export const useProblems = (filters?: ProblemFilters) => {
  return useQuery({
    queryKey: queryKeys.problems.list(filters),
    queryFn: () => problemApi.getProblems(filters),
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // Problems list cached for 5 minutes
  });
};

// Individual problem queries
export const useProblem = (id: number) => {
  return useQuery({
    queryKey: queryKeys.problems.detail(id),
    queryFn: () => problemApi.getProblem(id),
    enabled: !!getAccessToken() && !!id,
    staleTime: 10 * 60 * 1000, // Problem details cached for 10 minutes
  });
};

// Problem statistics
export const useProblemStats = (problemId: number) => {
  return useQuery({
    queryKey: [...queryKeys.problems.detail(problemId), 'stats'] as const,
    queryFn: () => problemApi.getProblemStats(problemId),
    enabled: !!getAccessToken() && !!problemId,
    staleTime: 5 * 60 * 1000,
  });
};

// Submission queries
export const useSubmission = (submissionId: number) => {
  return useQuery({
    queryKey: ['submissions', submissionId] as const,
    queryFn: () => problemApi.getSubmission(submissionId),
    enabled: !!getAccessToken() && !!submissionId,
    staleTime: 30 * 60 * 1000, // Submissions don't change often
  });
};

export const useUserSubmissions = (problemId?: number) => {
  return useQuery({
    queryKey: problemId 
      ? queryKeys.problems.submissions(problemId)
      : queryKeys.problems.allSubmissions(),
    queryFn: () => problemApi.getUserSubmissions(problemId),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000, // More dynamic data
  });
};

export const useSubmissionsByProblem = (problemId: number) => {
  return useQuery({
    queryKey: queryKeys.problems.submissions(problemId),
    queryFn: () => problemApi.getSubmissionsByProblem(problemId),
    enabled: !!getAccessToken() && !!problemId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSubmissionHistory = (filters?: {
  page?: number;
  limit?: number;
  status?: string;
  problem_id?: number;
}) => {
  return useQuery({
    queryKey: ['submissions', 'history', filters] as const,
    queryFn: () => problemApi.getSubmissionHistory(filters),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
  });
};

// User progress
export const useUserProblemProgress = () => {
  return useQuery({
    queryKey: ['users', 'problem-progress'] as const,
    queryFn: () => problemApi.getUserProgress(),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
  });
};

// Problem leaderboard
export const useProblemLeaderboard = (problemId: number, limit: number = 10) => {
  return useQuery({
    queryKey: [...queryKeys.problems.detail(problemId), 'leaderboard', limit] as const,
    queryFn: () => problemApi.getProblemLeaderboard(problemId, limit),
    enabled: !!getAccessToken() && !!problemId,
    staleTime: 5 * 60 * 1000,
  });
};

// Solution submission mutation
export const useSubmitSolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ problemId, solution }: {
      problemId: number;
      solution: SubmitSolutionRequest;
    }) => problemApi.submitSolution(problemId, solution),
    
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.problems.submissions(variables.problemId)
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.problems.allSubmissions()
      });
      queryClient.invalidateQueries({ 
        queryKey: ['submissions', 'history']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['users', 'problem-progress']
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.userStats()
      });
      
      if (data.success) {
        toast.success('Решение принято!');
      } else {
        toast.error('Решение не прошло тесты');
      }
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при отправке решения');
    },
  });
};

// Code execution mutation (for testing)
export const useExecuteCode = () => {
  return useMutation({
    mutationFn: ({ code, language, input }: {
      code: string;
      language: string;
      input?: string;
    }) => problemApi.executeCode(code, language, input),
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка выполнения кода');
    },
  });
};

// Admin mutations
export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (problemData: {
      title: string;
      description: string;
      difficulty: 'easy' | 'medium' | 'hard';
      initial_code: string;
      test_cases: string;
      points: number;
      time_limit: number;
      memory_limit: number;
    }) => problemApi.createProblem(problemData),
    
    onSuccess: () => {
      // Invalidate all problem lists
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.lists() });
      toast.success('Задача успешно создана');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка создания задачи');
    },
  });
};

export const useUpdateProblem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: Partial<{
        title: string;
        description: string;
        difficulty: 'easy' | 'medium' | 'hard';
        initial_code: string;
        test_cases: string;
        points: number;
        time_limit: number;
        memory_limit: number;
        is_active: boolean;
      }>;
    }) => problemApi.updateProblem(id, data),
    
    onSuccess: (updatedProblem, variables) => {
      // Update the specific problem in cache
      queryClient.setQueryData(queryKeys.problems.detail(variables.id), updatedProblem);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.detail(variables.id) });
      
      toast.success('Задача успешно обновлена');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка обновления задачи');
    },
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => problemApi.deleteProblem(id),
    
    onSuccess: (_, deletedId) => {
      // Remove the problem from all caches
      queryClient.removeQueries({ queryKey: queryKeys.problems.detail(deletedId) });
      queryClient.removeQueries({ queryKey: queryKeys.problems.submissions(deletedId) });
      
      // Invalidate problem lists
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.lists() });
      
      toast.success('Задача успешно удалена');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка удаления задачи');
    },
  });
};

// Prefetch helpers
export const usePrefetchProblem = () => {
  const queryClient = useQueryClient();
  
  return (problemId: number) => {
    // Prefetch problem details
    queryClient.prefetchQuery({
      queryKey: queryKeys.problems.detail(problemId),
      queryFn: () => problemApi.getProblem(problemId),
      staleTime: 10 * 60 * 1000,
    });
    
    // Prefetch problem submissions
    queryClient.prefetchQuery({
      queryKey: queryKeys.problems.submissions(problemId),
      queryFn: () => problemApi.getSubmissionsByProblem(problemId),
      staleTime: 2 * 60 * 1000,
    });
  };
};