import { Problem, UserSubmission, PaginatedResponse } from '@/types';
import { api } from './client';

interface ProblemFilters {
  difficulty?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface SubmitSolutionRequest {
  code: string;
  language: string;
}

interface SubmitSolutionResponse {
  id: number;
  success: boolean;
  output: string;
  error?: string;
  execution_time?: number;
  memory_usage?: number;
  test_results?: TestResult[];
  score?: number;
}

interface TestResult {
  passed: boolean;
  input: string;
  expected_output: string;
  actual_output: string;
  execution_time?: number;
}

// Comprehensive mock data for 60+ practice problems
const mockProblems: Problem[] = [
  // Easy Problems (20 problems)
  {
    id: 1,
    title: 'Привет, мир!',
    description: 'Напишите программу, которая выводит "Привет, мир!" на экран.',
    difficulty: 'easy',
    initial_code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Ваш код здесь\n}',
    test_cases: JSON.stringify([{
      input: '',
      expected_output: 'Привет, мир!\n'
    }]),
    points: 10,
    time_limit: 1000,
    memory_limit: 64,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Сумма двух чисел',
    description: 'Напишите функцию, которая возвращает сумму двух целых чисел.',
    difficulty: 'easy',
    initial_code: 'package main\n\nimport "fmt"\n\nfunc add(a, b int) int {\n    // Ваш код здесь\n}\n\nfunc main() {\n    fmt.Println(add(2, 3))\n}',
    test_cases: JSON.stringify([
      { input: '2 3', expected_output: '5\n' },
      { input: '0 0', expected_output: '0\n' },
      { input: '-1 1', expected_output: '0\n' }
    ]),
    points: 15,
    time_limit: 1000,
    memory_limit: 64,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    title: 'Проверка на чётность',
    description: 'Определите, является ли число чётным.',
    difficulty: 'easy',
    initial_code: 'package main\n\nimport "fmt"\n\nfunc isEven(n int) bool {\n    // Ваш код здесь\n}\n\nfunc main() {\n    fmt.Println(isEven(4))\n}',
    test_cases: JSON.stringify([
      { input: '4', expected_output: 'true\n' },
      { input: '3', expected_output: 'false\n' },
      { input: '0', expected_output: 'true\n' }
    ]),
    points: 15,
    time_limit: 1000,
    memory_limit: 64,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

];

// Mock user submissions
const mockSubmissions: Record<number, UserSubmission[]> = {
  1: [
    {
      id: 1,
      problem_id: 1,
      user_id: 1,
      code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Привет, мир!")\n}',
      language: 'go',
      status: 'accepted',
      output: 'Привет, мир!\n',
      execution_time: 0.001,
      memory_usage: 2.5,
      score: 100,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
};

class ProblemAPI {
  async getProblems(filters: ProblemFilters = {}): Promise<PaginatedResponse<Problem>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let filteredProblems = [...mockProblems];
    
    // Apply filters
    if (filters.difficulty) {
      filteredProblems = filteredProblems.filter(p => p.difficulty === filters.difficulty);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProblems = filteredProblems.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedProblems = filteredProblems.slice(startIndex, endIndex);
    
    return {
      data: paginatedProblems,
      total: filteredProblems.length,
      page,
      limit,
      pages: Math.ceil(filteredProblems.length / limit),
    };
  }

  async getProblem(id: number): Promise<Problem> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const problem = mockProblems.find(p => p.id === id);
    if (!problem) {
      throw new Error(`Задача с ID ${id} не найдена`);
    }
    return problem;
  }

  async submitSolution(problemId: number, solution: SubmitSolutionRequest): Promise<SubmitSolutionResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate code execution
    
    const problem = mockProblems.find(p => p.id === problemId);
    if (!problem) {
      throw new Error(`Задача с ID ${problemId} не найдена`);
    }
    
    // Mock execution results
    const isCorrect = Math.random() > 0.3; // 70% success rate
    const executionTime = Math.random() * 100;
    const memoryUsage = Math.random() * 50;
    
    return {
      id: Date.now(),
      success: isCorrect,
      output: isCorrect ? 'Код выполнен успешно' : 'Ошибка выполнения',
      error: !isCorrect ? 'Ошибка компиляции' : undefined,
      execution_time: executionTime,
      memory_usage: memoryUsage,
      score: isCorrect ? 100 : 0,
      test_results: [
        {
          passed: isCorrect,
          input: 'Тестовые данные',
          expected_output: 'Ожидаемый результат',
          actual_output: isCorrect ? 'Ожидаемый результат' : 'Неправильный результат',
          execution_time: executionTime,
        },
      ],
    };
  }

  async getSubmission(submissionId: number): Promise<UserSubmission> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Find submission in mock data
    for (const submissions of Object.values(mockSubmissions)) {
      const submission = submissions.find(s => s.id === submissionId);
      if (submission) {
        return submission;
      }
    }
    throw new Error(`Попытка с ID ${submissionId} не найдена`);
  }

  async getUserSubmissions(problemId?: number): Promise<UserSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (problemId) {
      return mockSubmissions[problemId] || [];
    }
    return Object.values(mockSubmissions).flat();
  }

  async getSubmissionsByProblem(problemId: number): Promise<UserSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockSubmissions[problemId] || [];
  }

  async getProblemStats(problemId: number): Promise<{
    total_submissions: number;
    accepted_submissions: number;
    acceptance_rate: number;
    average_execution_time: number;
    difficulty_rating: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const problem = mockProblems.find(p => p.id === problemId);
    if (!problem) {
      throw new Error(`Задача с ID ${problemId} не найдена`);
    }
    
    return {
      total_submissions: 150,
      accepted_submissions: 105,
      acceptance_rate: 0.7,
      average_execution_time: 0.05,
      difficulty_rating: problem.difficulty === 'easy' ? 2 : problem.difficulty === 'medium' ? 5 : 8,
    };
  }

  async getUserProgress(): Promise<{
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
    total_submissions: number;
    acceptance_rate: number;
    current_streak: number;
    best_streak: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      total_solved: 15,
      easy_solved: 8,
      medium_solved: 5,
      hard_solved: 2,
      total_submissions: 25,
      acceptance_rate: 0.6,
      current_streak: 3,
      best_streak: 7,
    };
  }
}

export const problemApi = new ProblemAPI();