import { Problem, UserSubmission, PaginatedResponse, ExecutionResult } from '@/types';
import { api } from './client';

export interface ProblemFilters {
  difficulty?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface SubmitSolutionRequest {
  code: string;
  language: string;
}

export interface SubmitSolutionResponse {
  id: number;
  success: boolean;
  output: string;
  error?: string;
  execution_time?: number;
  memory_usage?: number;
  test_results?: TestResult[];
  score?: number;
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected_output: string;
  actual_output: string;
  execution_time?: number;
}

export interface ProblemStats {
  total_submissions: number;
  accepted_submissions: number;
  acceptance_rate: number;
  average_execution_time: number;
  difficulty_rating: number;
}

export interface UserProgress {
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  total_submissions: number;
  acceptance_rate: number;
  current_streak: number;
  best_streak: number;
}

class ProblemAPI {
  /**
   * Get all problems with optional filtering and pagination
   */
  async getProblems(filters: ProblemFilters = {}): Promise<PaginatedResponse<Problem>> {
    const params = new URLSearchParams();
    
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.protected.get<PaginatedResponse<Problem>>(`/problems${query}`);
  }

  /**
   * Get a specific problem by ID
   */
  async getProblem(id: number): Promise<Problem> {
    return api.protected.get<Problem>(`/problems/${id}`);
  }

  /**
   * Submit a solution for a problem
   */
  async submitSolution(problemId: number, solution: SubmitSolutionRequest): Promise<SubmitSolutionResponse> {
    return api.protected.post<SubmitSolutionResponse>(
      `/problems/${problemId}/submit`, 
      solution
    );
  }

  /**
   * Get a specific submission by ID
   */
  async getSubmission(submissionId: number): Promise<UserSubmission> {
    return api.protected.get<UserSubmission>(`/submissions/${submissionId}`);
  }

  /**
   * Get user's submissions, optionally filtered by problem ID
   */
  async getUserSubmissions(problemId?: number): Promise<UserSubmission[]> {
    const params = new URLSearchParams();
    if (problemId) params.append('problem_id', problemId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.protected.get<UserSubmission[]>(`/submissions${query}`);
  }

  /**
   * Get all submissions for a specific problem
   */
  async getSubmissionsByProblem(problemId: number): Promise<UserSubmission[]> {
    return api.protected.get<UserSubmission[]>(`/problems/${problemId}/submissions`);
  }

  /**
   * Get statistics for a specific problem
   */
  async getProblemStats(problemId: number): Promise<ProblemStats> {
    return api.protected.get<ProblemStats>(`/problems/${problemId}/stats`);
  }

  /**
   * Get user's overall progress and statistics
   */
  async getUserProgress(): Promise<UserProgress> {
    return api.protected.get<UserProgress>('/users/me/problem-progress');
  }

  /**
   * Execute code in sandbox (for testing purposes)
   */
  async executeCode(code: string, language: string, input?: string): Promise<ExecutionResult> {
    return api.protected.post<ExecutionResult>('/sandbox/execute', {
      code,
      language,
      input: input || ''
    });
  }

  /**
   * Get user's submission history with pagination
   */
  async getSubmissionHistory(filters: {
    page?: number;
    limit?: number;
    status?: string;
    problem_id?: number;
  } = {}): Promise<PaginatedResponse<UserSubmission>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.problem_id) params.append('problem_id', filters.problem_id.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.protected.get<PaginatedResponse<UserSubmission>>(`/submissions/history${query}`);
  }

  /**
   * Get leaderboard for a specific problem
   */
  async getProblemLeaderboard(problemId: number, limit: number = 10): Promise<Array<{
    user_id: number;
    username: string;
    score: number;
    execution_time: number;
    memory_usage: number;
    submission_date: string;
  }>> {
    return api.protected.get(`/problems/${problemId}/leaderboard?limit=${limit}`);
  }

  /**
   * Admin only: Create a new problem
   */
  async createProblem(problemData: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    initial_code: string;
    test_cases: string;
    points: number;
    time_limit: number;
    memory_limit: number;
  }): Promise<Problem> {
    return api.protected.post<Problem>('/problems', problemData);
  }

  /**
   * Admin only: Update a problem
   */
  async updateProblem(id: number, problemData: Partial<{
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    initial_code: string;
    test_cases: string;
    points: number;
    time_limit: number;
    memory_limit: number;
    is_active: boolean;
  }>): Promise<Problem> {
    return api.protected.put<Problem>(`/problems/${id}`, problemData);
  }

  /**
   * Admin only: Delete a problem
   */
  async deleteProblem(id: number): Promise<void> {
    return api.protected.delete<void>(`/problems/${id}`);
  }
}

export const problemApi = new ProblemAPI();