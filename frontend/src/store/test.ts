import { create } from 'zustand';
import { Test, TestResult, TestQuestion, TestAnswer } from '@/types';
import { TestAPI, mockTests } from '@/api/tests';

interface TestFilters {
  search?: string;
  difficulty?: string;
  status?: string;
}

interface TestPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UserTestProgress {
  total_tests: number;
  completed_tests: number;
  passed_tests: number;
  average_score: number;
  total_points: number;
}

interface TestState {
  // Tests data
  tests: Test[];
  currentTest: Test | null;
  currentTestResult: TestResult | null;
  testResults: TestResult[];
  
  // Test session state
  isTestActive: boolean;
  startTime: Date | null;
  timeRemaining: number;
  userAnswers: Record<number, number>; // question_id -> answer_id
  currentQuestionIndex: number;
  
  // User progress
  userProgress: UserTestProgress | null;
  
  // Filters and pagination
  filters: TestFilters;
  pagination: TestPagination;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTests: (page?: number) => Promise<void>;
  fetchTest: (id: number) => Promise<void>;
  fetchUserProgress: () => Promise<void>;
  fetchTestResults: (page?: number) => Promise<void>;
  startTest: (testId: number) => Promise<void>;
  submitTest: () => Promise<void>;
  setUserAnswer: (questionId: number, answerId: number) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setFilters: (filters: Partial<TestFilters>) => void;
  clearCurrentTest: () => void;
  clearError: () => void;
  
  // Timer actions
  startTimer: () => void;
  stopTimer: () => void;
  updateTimer: () => void;
}

// Timer interval reference
let timerInterval: NodeJS.Timeout | null = null;

export const useTestStore = create<TestState>((set, get) => ({
  // Initial state
  tests: mockTests, // Initialize with mock data
  currentTest: null,
  currentTestResult: null,
  testResults: [],
  
  isTestActive: false,
  startTime: null,
  timeRemaining: 0,
  userAnswers: {},
  currentQuestionIndex: 0,
  
  userProgress: {
    total_tests: 3,
    completed_tests: 1,
    passed_tests: 1,
    average_score: 85,
    total_points: 150,
  },
  
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
    pages: 1,
  },
  
  isLoading: false,
  error: null,
  
  // Actions
  fetchTests: async (page = 1) => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });
    
    try {
      // Use mock data for now
      const mockResponse = {
        data: mockTests,
        total: mockTests.length,
        page,
        limit: pagination.limit,
        pages: Math.ceil(mockTests.length / pagination.limit),
      };
      
      set({
        tests: mockResponse.data,
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
        error: error instanceof Error ? error.message : 'Failed to fetch tests',
        isLoading: false,
      });
    }
  },
  
  fetchTest: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // Use mock data for now
      const test = mockTests.find(t => t.id === id);
      if (!test) {
        throw new Error('Test not found');
      }
      
      set({
        currentTest: test,
        isLoading: false,
        userAnswers: {},
        currentQuestionIndex: 0,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch test',
        isLoading: false,
      });
    }
  },
  
  fetchUserProgress: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Use mock data for now
      const mockProgress: UserTestProgress = {
        total_tests: 3,
        completed_tests: 1,
        passed_tests: 1,
        average_score: 85,
        total_points: 150,
      };
      
      set({
        userProgress: mockProgress,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user progress',
        isLoading: false,
      });
    }
  },
  
  fetchTestResults: async (page = 1) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock test results
      const mockResults: TestResult[] = [
        {
          id: 1,
          user_id: 1,
          test_id: 1,
          score: 85,
          max_score: 100,
          percentage: 85,
          is_passed: true,
          time_spent: 1200,
          answers: JSON.stringify({ "1": 1, "2": 6 }),
          started_at: '2024-01-15T10:00:00Z',
          completed_at: '2024-01-15T10:20:00Z',
          created_at: '2024-01-15T10:20:00Z',
          updated_at: '2024-01-15T10:20:00Z',
        },
      ];
      
      set({
        testResults: mockResults,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch test results',
        isLoading: false,
      });
    }
  },
  
  startTest: async (testId: number) => {
    const { currentTest } = get();
    
    if (!currentTest || currentTest.id !== testId) {
      await get().fetchTest(testId);
    }
    
    const test = get().currentTest;
    if (!test) {
      set({ error: 'Test not found' });
      return;
    }
    
    set({
      isTestActive: true,
      startTime: new Date(),
      timeRemaining: test.time_limit,
      userAnswers: {},
      currentQuestionIndex: 0,
      currentTestResult: null,
    });
    
    get().startTimer();
  },
  
  submitTest: async () => {
    const { currentTest, userAnswers, startTime } = get();
    
    if (!currentTest || !startTime) {
      set({ error: 'No active test to submit' });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      
      currentTest.questions?.forEach(question => {
        totalPoints += question.points;
        const userAnswerId = userAnswers[question.id];
        const correctAnswer = question.answers?.find(a => a.is_correct && a.id === userAnswerId);
        if (correctAnswer) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      });
      
      const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      
      // Create mock result
      const result: TestResult = {
        id: Date.now(),
        user_id: 1,
        test_id: currentTest.id,
        score: earnedPoints,
        max_score: totalPoints,
        percentage: Math.round(percentage),
        is_passed: percentage >= currentTest.pass_score,
        time_spent: timeSpent,
        answers: JSON.stringify(userAnswers),
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      set({
        isTestActive: false,
        currentTestResult: result,
        isLoading: false,
      });
      
      get().stopTimer();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit test',
        isLoading: false,
      });
    }
  },
  
  setUserAnswer: (questionId: number, answerId: number) => {
    const { userAnswers } = get();
    set({
      userAnswers: {
        ...userAnswers,
        [questionId]: answerId,
      },
    });
  },
  
  setCurrentQuestionIndex: (index: number) => {
    set({ currentQuestionIndex: index });
  },
  
  setFilters: (newFilters: Partial<TestFilters>) => {
    const { filters } = get();
    set({
      filters: { ...filters, ...newFilters },
      pagination: { ...get().pagination, page: 1 },
    });
    get().fetchTests(1);
  },
  
  clearCurrentTest: () => {
    set({
      currentTest: null,
      isTestActive: false,
      startTime: null,
      timeRemaining: 0,
      userAnswers: {},
      currentQuestionIndex: 0,
      currentTestResult: null,
    });
    get().stopTimer();
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Timer functions
  startTimer: () => {
    get().stopTimer(); // Clear any existing timer
    
    timerInterval = setInterval(() => {
      const { timeRemaining, isTestActive } = get();
      
      if (!isTestActive || timeRemaining <= 0) {
        get().stopTimer();
        if (isTestActive) {
          // Auto-submit when time runs out
          get().submitTest();
        }
        return;
      }
      
      set({ timeRemaining: timeRemaining - 1 });
    }, 1000);
  },
  
  stopTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  },
  
  updateTimer: () => {
    const { startTime, currentTest, isTestActive } = get();
    
    if (!isTestActive || !startTime || !currentTest) return;
    
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const remaining = Math.max(0, currentTest.time_limit - elapsed);
    
    set({ timeRemaining: remaining });
    
    if (remaining <= 0) {
      get().submitTest();
    }
  },
}));