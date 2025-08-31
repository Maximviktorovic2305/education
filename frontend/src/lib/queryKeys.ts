import type { 
  CourseFilters, 
  ProblemFilters, 
  TestFilters,
  ProgressFilters,
  CertificateFilters
} from '@/types';

// Query keys factory for organized cache management
export const queryKeys = {
  // Auth
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    stats: () => [...queryKeys.user.all, 'stats'] as const,
  },
  
  // Courses
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (filters?: CourseFilters) => [...queryKeys.courses.lists(), filters] as const,
    details: () => [...queryKeys.courses.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.courses.details(), id] as const,
    sections: (id: number) => [...queryKeys.courses.detail(id), 'sections'] as const,
    lessons: (courseId: number) => [...queryKeys.courses.detail(courseId), 'lessons'] as const,
    lesson: (id: number) => [...queryKeys.courses.all, 'lesson', id] as const,
  },
  
  // Problems
  problems: {
    all: ['problems'] as const,
    lists: () => [...queryKeys.problems.all, 'list'] as const,
    list: (filters?: ProblemFilters) => [...queryKeys.problems.lists(), filters] as const,
    details: () => [...queryKeys.problems.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.problems.details(), id] as const,
    submissions: (id: number) => [...queryKeys.problems.detail(id), 'submissions'] as const,
    allSubmissions: () => [...queryKeys.problems.all, 'submissions'] as const,
  },
  
  // Tests
  tests: {
    all: ['tests'] as const,
    lists: () => [...queryKeys.tests.all, 'list'] as const,
    list: (filters?: TestFilters) => [...queryKeys.tests.lists(), filters] as const,
    details: () => [...queryKeys.tests.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.tests.details(), id] as const,
    results: () => [...queryKeys.tests.all, 'results'] as const,
    userResults: (filters?: TestFilters) => [...queryKeys.tests.results(), filters] as const,
    categories: () => [...queryKeys.tests.all, 'categories'] as const,
  },
  
  // Progress & Stats
  progress: {
    all: ['progress'] as const,
    user: () => [...queryKeys.progress.all, 'user'] as const,
    userStats: () => [...queryKeys.progress.user(), 'stats'] as const,
    userProgress: (filters?: ProgressFilters) => [...queryKeys.progress.user(), 'progress', filters] as const,
    levelSystem: () => [...queryKeys.progress.user(), 'level-system'] as const,
    learningStreak: () => [...queryKeys.progress.user(), 'learning-streak'] as const,
    skillProgress: () => [...queryKeys.progress.user(), 'skill-progress'] as const,
    weeklyActivity: () => [...queryKeys.progress.user(), 'weekly-activity'] as const,
    monthlyProgress: () => [...queryKeys.progress.user(), 'monthly-progress'] as const,
    courseProgress: (courseId: number) => [...queryKeys.progress.user(), 'course', courseId] as const,
  },
  
  // Certificates
  certificates: {
    all: ['certificates'] as const,
    lists: () => [...queryKeys.certificates.all, 'list'] as const,
    list: (filters?: CertificateFilters) => [...queryKeys.certificates.lists(), filters] as const,
    details: () => [...queryKeys.certificates.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.certificates.details(), id] as const,
    eligibility: () => [...queryKeys.certificates.all, 'eligibility'] as const,
    validation: (certificateNumber: string) => [...queryKeys.certificates.all, 'validation', certificateNumber] as const,
  },
  
  // Platform data
  platform: {
    all: ['platform'] as const,
    stats: () => [...queryKeys.platform.all, 'stats'] as const,
    userStats: () => [...queryKeys.platform.all, 'user-stats'] as const,
  },
} as const;

// Type helper for extracting query key types
export type QueryKeys = typeof queryKeys;