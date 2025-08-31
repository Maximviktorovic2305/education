// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  level: UserLevel;
  points: number;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'user' | 'admin';
export type UserLevel = 'junior' | 'middle' | 'senior';

// Course types
export interface Course {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sections?: Section[];
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  section_id: number;
  title: string;
  content: string;
  code_example?: string;
  order: number;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  section?: Section;
}

// Problem types
export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: ProblemLevel;
  initial_code: string;
  test_cases: string;
  points: number;
  time_limit: number;
  memory_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProblemLevel = 'easy' | 'medium' | 'hard';

export interface UserSubmission {
  id: number;
  problem_id: number;
  user_id: number;
  code: string;
  language: string;
  status: SubmissionStatus;
  output: string;
  error?: string;
  execution_time: number;
  memory_usage: number;
  score: number;
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = 
  | 'pending'
  | 'judging'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'compilation_error'
  | 'runtime_error'
  | 'compile_error';

export interface Submission {
  id: number;
  user_id: number;
  problem_id: number;
  code: string;
  language: string;
  status: SubmissionStatus;
  score: number;
  tests_passed: number;
  tests_total: number;
  execution_time: number;
  memory_used: number;
  error_output?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  user?: User;
  problem?: Problem;
}

// Test types
export interface Test {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  pass_score: number;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions?: TestQuestion[];
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question: string;
  order: number;
  points: number;
  created_at: string;
  updated_at: string;
  test?: Test;
  answers?: TestAnswer[];
}

export interface TestAnswer {
  id: number;
  question_id: number;
  answer: string;
  is_correct: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  question?: TestQuestion;
}

export interface TestResult {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  max_score: number;
  percentage: number;
  is_passed: boolean;
  time_spent: number;
  answers: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  test?: Test;
}

// Progress types
export interface UserProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  is_completed: boolean;
  completed_at?: string;
  time_spent: number;
  created_at: string;
  updated_at: string;
  user?: User;
  lesson?: Lesson;
}

// Certificate types
export interface Certificate {
  id: number;
  user_id: number;
  type: CertificateType;
  title: string;
  description: string;
  certificate_number: string;
  issued_at: string;
  valid_until?: string;
  pdf_path: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export type CertificateType = 'junior' | 'middle' | 'senior' | 'course' | 'achievement';

// Achievement types
export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at?: string;
  is_unlocked: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Request/Response wrapper types
export type ApiResult<T> = ApiSuccess<T> | ApiError;

// Execution result for code submissions
export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  execution_time: number;
  memory_usage: number;
  test_results: TestResult[];
}

// Test case result
export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

// Loading state type
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Theme types
export type Theme = 'light' | 'dark';

// Store types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ThemeState {
  theme: Theme;
}

export interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  currentSection: Section | null;
  currentLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;
}

export interface PracticeState {
  problems: Problem[];
  currentProblem: Problem | null;
  submissions: Submission[];
  currentSubmission: Submission | null;
  isLoading: boolean;
  error: string | null;
}

export interface TestState {
  tests: Test[];
  currentTest: Test | null;
  currentTestResult: TestResult | null;
  userAnswers: Record<number, number>;
  isLoading: boolean;
  error: string | null;
}

export interface ProgressState {
  userProgress: UserProgress[];
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
}

export interface UserStats {
  total_points: number;
  completed_lessons: number;
  total_lessons: number;
  solved_problems: number;
  total_problems: number;
  passed_tests: number;
  total_tests: number;
  certificates_count: number;
  current_level: UserLevel;
  next_level_points: number;
  level_progress: number;
}