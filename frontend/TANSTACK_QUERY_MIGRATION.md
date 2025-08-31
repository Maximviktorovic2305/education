# TanStack Query Integration

## Overview

This project has been fully migrated from Zustand-based state management to TanStack Query for server state, while keeping Zustand for UI-only state. This provides better server state management, automatic caching, and optimistic updates.

## Architecture

### Server State Management (TanStack Query)
- All API data fetching and mutations
- Automatic caching and invalidation
- Optimistic updates for better UX
- Error handling and retry logic
- Background data synchronization

### Client State Management (Zustand)
- UI preferences and settings
- Navigation state
- Editor configuration
- Notifications
- Theme settings

## Usage Patterns

### 1. Data Fetching
```typescript
import { useCourses, useCourse } from '@/hooks';

function CoursePage() {
  // Fetch courses list with automatic caching
  const { data: courses, isLoading, error } = useCourses();
  
  // Fetch specific course with params
  const { data: course } = useCourse(courseId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <CourseList courses={courses} />;
}
```

### 2. Data Mutations
```typescript
import { useLogin, useCompleteLesson } from '@/hooks';

function LoginForm() {
  const loginMutation = useLogin();
  const completeLessonMutation = useCompleteLesson();
  
  const handleLogin = async (credentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      // Automatically redirects and updates cache
    } catch (error) {
      // Error handling with toast notifications
    }
  };
  
  const handleCompleteLesson = (lessonId) => {
    // Optimistic update - UI updates immediately
    completeLessonMutation.mutate({ 
      lessonId, 
      timeSpent: getTimeSpent() 
    });
  };
}
```

### 3. UI State Management
```typescript
import { useThemeStore, useNavigationStore } from '@/store';

function AppLayout() {
  const { theme, toggleTheme } = useThemeStore();
  const { sidebarOpen, toggleSidebar } = useNavigationStore();
  
  return (
    <div className={theme}>
      {sidebarOpen && <Sidebar />}
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## Query Hooks Available

### Authentication
- `useLogin()` - Login user
- `useRegister()` - Register new user
- `useLogout()` - Logout user
- `useProfile()` - Get user profile
- `useUpdateProfile()` - Update user profile
- `useRefreshToken()` - Refresh authentication token

### Courses
- `useCourses(filters?)` - Get courses list
- `useCourse(id)` - Get specific course
- `useCourseSections(courseId)` - Get course sections
- `useLesson(id)` - Get specific lesson
- `useCompleteLesson()` - Mark lesson as completed

### Problems
- `useProblems(filters?)` - Get problems list
- `useProblem(id)` - Get specific problem
- `useSubmitSolution()` - Submit problem solution
- `useExecuteCode()` - Execute code in sandbox
- `useUserSubmissions()` - Get user submissions

### Tests
- `useTests(page, limit, filters?)` - Get tests list
- `useTest(id)` - Get specific test
- `useStartTest()` - Start test session
- `useSubmitTest()` - Submit test answers
- `useTestResults()` - Get user test results

### Progress & Statistics
- `useUserStats()` - Get user statistics
- `useUserProgress()` - Get user progress data
- `useLevelSystem()` - Get level and achievements
- `useLearningStreak()` - Get learning streak data
- `useSkillProgress()` - Get skill progress

### Certificates
- `useCertificates()` - Get user certificates
- `useCertificate(id)` - Get specific certificate
- `useGenerateCertificate()` - Generate new certificate
- `useDownloadCertificate()` - Download certificate PDF
- `useCertificateEligibility()` - Check certificate eligibility

## UI State Stores Available

### Theme Management
- `useThemeStore` - Dark/light theme switching

### Navigation
- `useNavigationStore` - Sidebar and mobile menu state

### Editor
- `useEditorStore` - Code editor preferences and state

### Notifications
- `useNotificationStore` - Toast notifications management

### UI Preferences
- `useUIPreferencesStore` - User interface preferences

## Key Benefits

1. **Automatic Caching**: Data is cached automatically and reused across components
2. **Optimistic Updates**: UI updates immediately for better user experience
3. **Error Handling**: Centralized error handling with toast notifications
4. **Background Sync**: Data is synchronized in the background
5. **Stale-While-Revalidate**: Shows cached data while fetching fresh data
6. **Query Invalidation**: Automatic cache invalidation when data changes
7. **Loading States**: Built-in loading states for better UX
8. **DevTools**: React Query DevTools for debugging

## Migration Benefits

- ✅ **Removed Mock Data**: All mock data removed, using real API calls
- ✅ **Centralized State**: Server state centralized in TanStack Query
- ✅ **Better UX**: Optimistic updates and automatic background sync
- ✅ **Error Handling**: Comprehensive error handling with user feedback
- ✅ **Performance**: Automatic caching reduces unnecessary API calls
- ✅ **Developer Experience**: Better debugging tools and cleaner code
- ✅ **Type Safety**: Full TypeScript support with proper types
- ✅ **Clean Architecture**: Clear separation of server and client state

## Best Practices

1. **Use Query Keys**: Always use the centralized query keys from `@/lib/queryKeys`
2. **Handle Loading States**: Always handle loading and error states in components
3. **Optimistic Updates**: Use optimistic updates for mutations that affect UI immediately
4. **Cache Invalidation**: Invalidate related queries after mutations
5. **Error Boundaries**: Use error boundaries for unhandled errors
6. **Prefetching**: Use prefetch helpers for better UX
7. **Stale Time**: Set appropriate stale times based on data volatility

## Configuration

The TanStack Query client is configured with:
- 5-minute stale time for most queries
- 10-minute garbage collection time
- Automatic retry with exponential backoff
- No retry for 4xx errors
- Custom error handling for 401 (unauthorized)

## Development Tools

- **React Query DevTools**: Available in development mode
- **Query Client**: Accessible globally for debugging
- **Network Tab**: Monitor API calls in browser DevTools
- **React DevTools**: Inspect component state and props