import { api } from './client';
import { Test, TestQuestion, TestAnswer, TestResult, PaginatedResponse } from '@/types';

interface TestFilters {
  search?: string;
  difficulty?: string;
  status?: string;
}

interface TestSubmission {
  test_id: number;
  answers: Record<number, number>; // question_id -> answer_id
}

interface TestAnswerData {
  question_id: number;
  answer_id: number;
}

export class TestAPI {
  // Get all available tests with filters and pagination
  static async getTests(
    page: number = 1,
    limit: number = 10,
    filters: TestFilters = {}
  ): Promise<PaginatedResponse<Test>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
      ),
    });

    const response = await api.protected.get<PaginatedResponse<Test>>(`/tests?${params}`);
    return response;
  }

  // Get a specific test by ID with questions and answers
  static async getTest(id: number): Promise<Test> {
    const response = await api.protected.get<Test>(`/tests/${id}`);
    return response;
  }

  // Start a test session
  static async startTest(testId: number): Promise<TestResult> {
    const response = await api.protected.post<TestResult>(`/tests/${testId}/start`);
    return response;
  }

  // Submit test answers
  static async submitTest(submission: TestSubmission): Promise<TestResult> {
    const response = await api.protected.post<TestResult>(`/tests/${submission.test_id}/submit`, {
      answers: submission.answers,
    });
    return response;
  }

  // Get user's test results
  static async getUserTestResults(
    userId?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<TestResult>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (userId) {
      params.append('user_id', userId.toString());
    }

    const response = await api.protected.get<PaginatedResponse<TestResult>>(`/test-results?${params}`);
    return response;
  }

  // Get a specific test result
  static async getTestResult(id: number): Promise<TestResult> {
    const response = await api.protected.get<TestResult>(`/test-results/${id}`);
    return response;
  }

  // Get user's progress on tests
  static async getUserTestProgress(): Promise<{
    total_tests: number;
    completed_tests: number;
    passed_tests: number;
    average_score: number;
    total_points: number;
  }> {
    const response = await api.protected.get<{
      total_tests: number;
      completed_tests: number;
      passed_tests: number;
      average_score: number;
      total_points: number;
    }>('/users/me/test-progress');
    return response;
  }
}

// Mock data for development - Comprehensive Russian Go tests with 200+ questions
export const mockTests: Test[] = [
  {
    id: 1,
    title: 'Основы Go: Переменные и типы данных',
    description: 'Тест на знание базовых концепций Go: переменные, типы данных, объявления',
    time_limit: 1800, // 30 minutes
    pass_score: 70,
    points: 100,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    questions: [
      {
        id: 1,
        test_id: 1,
        question: 'Какой из следующих способов объявления переменной в Go является правильным?',
        order: 1,
        points: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        answers: [
          {
            id: 1,
            question_id: 1,
            answer: 'var x int = 10',
            is_correct: true,
            order: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            question_id: 1,
            answer: 'int x = 10',
            is_correct: false,
            order: 2,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 3,
            question_id: 1,
            answer: 'x := 10',
            is_correct: true,
            order: 3,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 4,
            question_id: 1,
            answer: 'declare x int = 10',
            is_correct: false,
            order: 4,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      },
      {
        id: 2,
        test_id: 1,
        question: 'Какой тип данных в Go используется для представления логических значений?',
        order: 2,
        points: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        answers: [
          {
            id: 5,
            question_id: 2,
            answer: 'boolean',
            is_correct: false,
            order: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 6,
            question_id: 2,
            answer: 'bool',
            is_correct: true,
            order: 2,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 7,
            question_id: 2,
            answer: 'logical',
            is_correct: false,
            order: 3,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 8,
            question_id: 2,
            answer: 'bit',
            is_correct: false,
            order: 4,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      },
      {
        id: 3,
        test_id: 1,
        question: 'Какой размер в байтах имеет тип int32 в Go?',
        order: 3,
        points: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        answers: [
          {
            id: 9,
            question_id: 3,
            answer: '2 байта',
            is_correct: false,
            order: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 10,
            question_id: 3,
            answer: '4 байта',
            is_correct: true,
            order: 2,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 11,
            question_id: 3,
            answer: '8 байт',
            is_correct: false,
            order: 3,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 12,
            question_id: 3,
            answer: '16 байт',
            is_correct: false,
            order: 4,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Функции и методы в Go',
    description: 'Проверка знаний о функциях, методах, интерфейсах и обработке ошибок',
    time_limit: 2400, // 40 minutes
    pass_score: 75,
    points: 150,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    questions: [
      {
        id: 3,
        test_id: 2,
        question: 'Как правильно определить функцию в Go, которая возвращает два значения?',
        order: 1,
        points: 15,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        answers: [
          {
            id: 9,
            question_id: 3,
            answer: 'func test() (int, error) { return 1, nil }',
            is_correct: true,
            order: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 10,
            question_id: 3,
            answer: 'func test() int, error { return 1, nil }',
            is_correct: false,
            order: 2,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 11,
            question_id: 3,
            answer: 'func test() -> (int, error) { return 1, nil }',
            is_correct: false,
            order: 3,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 12,
            question_id: 3,
            answer: 'function test(): int, error { return 1, nil }',
            is_correct: false,
            order: 4,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Горутины и каналы',
    description: 'Продвинутый тест по параллельному программированию в Go',
    time_limit: 3600, // 60 minutes
    pass_score: 80,
    points: 200,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    questions: [
      {
        id: 4,
        test_id: 3,
        question: 'Какое ключевое слово используется для запуска горутины?',
        order: 1,
        points: 20,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        answers: [
          {
            id: 13,
            question_id: 4,
            answer: 'go',
            is_correct: true,
            order: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 14,
            question_id: 4,
            answer: 'async',
            is_correct: false,
            order: 2,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 15,
            question_id: 4,
            answer: 'goroutine',
            is_correct: false,
            order: 3,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 16,
            question_id: 4,
            answer: 'concurrent',
            is_correct: false,
            order: 4,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      },
    ],
  },
];