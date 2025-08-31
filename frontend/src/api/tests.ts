import { api } from './client';
import { Test, TestQuestion, TestAnswer, TestResult, PaginatedResponse } from '@/types';

export interface TestFilters {
  search?: string;
  difficulty?: string;
  status?: string;
  category?: string;
}

export interface TestSubmission {
  test_id: number;
  answers: Record<number, number>; // question_id -> answer_id
}

export interface TestSession {
  id: number;
  test_id: number;
  user_id: number;
  started_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface TestProgress {
  total_tests: number;
  completed_tests: number;
  passed_tests: number;
  average_score: number;
  total_points: number;
}

class TestAPI {
  /**
   * Get all available tests with optional filtering and pagination
   */
  async getTests(
    page: number = 1,
    limit: number = 10,
    filters: TestFilters = {}
  ): Promise<PaginatedResponse<Test>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    return api.protected.get<PaginatedResponse<Test>>(`/tests?${params}`);
  }

  /**
   * Get a specific test by ID with questions and answers
   */
  async getTest(id: number): Promise<Test> {
    return api.protected.get<Test>(`/tests/${id}`);
  }

  /**
   * Start a test session
   */
  async startTest(testId: number): Promise<TestSession> {
    return api.protected.post<TestSession>(`/tests/${testId}/start`);
  }

  /**
   * Submit test answers and get results
   */
  async submitTest(submission: TestSubmission): Promise<TestResult> {
    return api.protected.post<TestResult>(
      `/tests/${submission.test_id}/submit`, 
      { answers: submission.answers }
    );
  }

  /**
   * Get user's test results with pagination
   */
  async getUserTestResults(
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

    return api.protected.get<PaginatedResponse<TestResult>>(`/test-results?${params}`);
  }

  /**
   * Get a specific test result by ID
   */
  async getTestResult(id: number): Promise<TestResult> {
    return api.protected.get<TestResult>(`/test-results/${id}`);
  }

  /**
   * Get user's overall test progress and statistics
   */
  async getUserTestProgress(): Promise<TestProgress> {
    return api.protected.get<TestProgress>('/users/me/test-progress');
  }

  /**
   * Get test leaderboard
   */
  async getTestLeaderboard(testId: number, limit: number = 10): Promise<Array<{
    user_id: number;
    username: string;
    score: number;
    percentage: number;
    completion_time: number;
    completed_at: string;
  }>> {
    return api.protected.get(`/tests/${testId}/leaderboard?limit=${limit}`);
  }

  /**
   * Get test categories for filtering
   */
  async getTestCategories(): Promise<Array<{
    id: number;
    name: string;
    description: string;
    test_count: number;
  }>> {
    return api.protected.get('/tests/categories');
  }

  /**
   * Get user's active test session (if any)
   */
  async getActiveTestSession(): Promise<TestSession | null> {
    return api.protected.get<TestSession | null>('/test-sessions/active');
  }

  /**
   * Cancel an active test session
   */
  async cancelTestSession(sessionId: number): Promise<void> {
    return api.protected.post<void>(`/test-sessions/${sessionId}/cancel`);
  }

  /**
   * Get test statistics for admin/analytics
   */
  async getTestStats(testId: number): Promise<{
    total_attempts: number;
    pass_rate: number;
    average_score: number;
    average_completion_time: number;
    difficulty_distribution: Record<string, number>;
  }> {
    return api.protected.get(`/tests/${testId}/stats`);
  }

  /**
   * Admin only: Create a new test
   */
  async createTest(testData: {
    title: string;
    description: string;
    time_limit: number;
    pass_score: number;
    points: number;
    category?: string;
  }): Promise<Test> {
    return api.protected.post<Test>('/tests', testData);
  }

  /**
   * Admin only: Update a test
   */
  async updateTest(id: number, testData: Partial<{
    title: string;
    description: string;
    time_limit: number;
    pass_score: number;
    points: number;
    is_active: boolean;
    category: string;
  }>): Promise<Test> {
    return api.protected.put<Test>(`/tests/${id}`, testData);
  }

  /**
   * Admin only: Delete a test
   */
  async deleteTest(id: number): Promise<void> {
    return api.protected.delete<void>(`/tests/${id}`);
  }

  /**
   * Admin only: Add question to test
   */
  async addQuestion(testId: number, questionData: {
    question: string;
    order: number;
    points: number;
    answers: Array<{
      answer: string;
      is_correct: boolean;
      order: number;
    }>;
  }): Promise<TestQuestion> {
    return api.protected.post<TestQuestion>(`/tests/${testId}/questions`, questionData);
  }

  /**
   * Admin only: Update a question
   */
  async updateQuestion(questionId: number, questionData: Partial<{
    question: string;
    order: number;
    points: number;
  }>): Promise<TestQuestion> {
    return api.protected.put<TestQuestion>(`/questions/${questionId}`, questionData);
  }

  /**
   * Admin only: Delete a question
   */
  async deleteQuestion(questionId: number): Promise<void> {
    return api.protected.delete<void>(`/questions/${questionId}`);
  }
}

export const testApi = new TestAPI();