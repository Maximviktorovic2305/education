'use client';

import { create } from 'zustand';
import { Problem, UserSubmission } from '@/types';
import { problemApi } from '@/api/problems';

interface ProblemFilters {
  difficulty?: string;
  status?: string;
  search?: string;
}

interface ProblemStore {
  problems: Problem[];
  currentProblem: Problem | null;
  submissions: UserSubmission[];
  currentSubmission: UserSubmission | null;
  filters: ProblemFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
  userProgress: {
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
    total_submissions: number;
    acceptance_rate: number;
    current_streak: number;
    best_streak: number;
  } | null;

  // Actions
  fetchProblems: (page?: number) => Promise<void>;
  fetchProblem: (id: number) => Promise<void>;
  submitSolution: (problemId: number, code: string, language: string) => Promise<UserSubmission>;
  fetchUserSubmissions: (problemId?: number) => Promise<void>;
  fetchSubmission: (submissionId: number) => Promise<void>;
  fetchUserProgress: () => Promise<void>;
  setFilters: (filters: Partial<ProblemFilters>) => void;
  setCurrentProblem: (problem: Problem | null) => void;
  clearError: () => void;
  resetStore: () => void;
}

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
};

export const useProblemStore = create<ProblemStore>()((set, get) => ({
  problems: [],
  currentProblem: null,
  submissions: [],
  currentSubmission: null,
  filters: {},
  pagination: initialPagination,
  isLoading: false,
  error: null,
  userProgress: null,

  fetchProblems: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Mock data for demo - replace with real API call
      const mockResponse = {
        data: [
          {
            id: 1,
            title: 'Hello, World!',
            description: 'Напишите программу, которая выводит "Hello, World!" на экран.',
            difficulty: 'easy' as const,
            initial_code: `package main\n\nimport "fmt"\n\nfunc main() {\n    // Ваш код здесь\n    \n}`,
            test_cases: JSON.stringify([{
              input: '',
              expected_output: 'Hello, World!',
              explanation: 'Программа должна вывести "Hello, World!"'
            }]),
            points: 5,
            time_limit: 1000,
            memory_limit: 65536,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            title: 'Сумма двух чисел',
            description: 'Напишите функцию, которая принимает два числа и возвращает их сумму.',
            difficulty: 'easy' as const,
            initial_code: `package main\n\nimport "fmt"\n\nfunc add(a, b int) int {\n    // Ваш код здесь\n    return 0\n}\n\nfunc main() {\n    result := add(5, 3)\n    fmt.Println(result)\n}`,
            test_cases: JSON.stringify([{
              input: '',
              expected_output: '8',
              explanation: 'add(5, 3) должно возвращать 8'
            }]),
            points: 10,
            time_limit: 1000,
            memory_limit: 65536,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 3,
            title: 'Факториал числа',
            description: 'Напишите функцию для вычисления факториала числа n.',
            difficulty: 'medium' as const,
            initial_code: `package main\n\nimport "fmt"\n\nfunc factorial(n int) int {\n    // Ваш код здесь\n    return 1\n}\n\nfunc main() {\n    result := factorial(5)\n    fmt.Println(result)\n}`,
            test_cases: JSON.stringify([{
              input: '5',
              expected_output: '120',
              explanation: '5! = 1 × 2 × 3 × 4 × 5 = 120'
            }]),
            points: 20,
            time_limit: 1000,
            memory_limit: 65536,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ] as Problem[],
        page: 1,
        limit: 20,
        total: 3,
        pages: 1,
      };

      set({
        problems: mockResponse.data,
        pagination: {
          page: mockResponse.page,
          limit: mockResponse.limit,
          total: mockResponse.total,
          pages: mockResponse.pages,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки задач',
        isLoading: false,
      });
    }
  },

  fetchProblem: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const problem = await problemApi.getProblem(id);
      set({ currentProblem: problem, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки задачи',
        isLoading: false,
      });
    }
  },

  submitSolution: async (problemId: number, code: string, language: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await problemApi.submitSolution(problemId, { code, language });
      
      // Create a submission object from the result
      const submission: UserSubmission = {
        id: result.id,
        problem_id: problemId,
        user_id: 0, // Will be set by backend
        code,
        language,
        status: result.success ? 'accepted' : 'wrong_answer',
        output: result.output,
        error: result.error,
        execution_time: result.execution_time || 0,
        memory_usage: result.memory_usage || 0,
        score: result.score || (result.success ? 100 : 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add to submissions list
      const { submissions } = get();
      set({
        submissions: [submission, ...submissions],
        currentSubmission: submission,
        isLoading: false,
      });

      return submission;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка отправки решения',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUserSubmissions: async (problemId?: number) => {
    try {
      set({ isLoading: true, error: null });
      const submissions = await problemApi.getUserSubmissions(problemId);
      set({ submissions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки решений',
        isLoading: false,
      });
    }
  },

  fetchSubmission: async (submissionId: number) => {
    try {
      set({ isLoading: true, error: null });
      const submission = await problemApi.getSubmission(submissionId);
      set({ currentSubmission: submission, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки решения',
        isLoading: false,
      });
    }
  },

  fetchUserProgress: async () => {
    try {
      const progress = await problemApi.getUserProgress();
      set({ userProgress: progress });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки прогресса',
      });
    }
  },

  setFilters: (newFilters: Partial<ProblemFilters>) => {
    const { filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    set({ filters: updatedFilters });
    
    // Reset pagination and refetch
    set({ pagination: { ...initialPagination } });
    get().fetchProblems(1);
  },

  setCurrentProblem: (problem: Problem | null) => {
    set({ currentProblem: problem });
  },

  clearError: () => set({ error: null }),

  resetStore: () => set({
    problems: [],
    currentProblem: null,
    submissions: [],
    currentSubmission: null,
    filters: {},
    pagination: initialPagination,
    isLoading: false,
    error: null,
    userProgress: null,
  }),
}));