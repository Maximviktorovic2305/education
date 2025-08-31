'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { courseApi, type CourseFilters } from '@/api/courses';
import { queryKeys } from '@/lib/queryKeys';
import { getAccessToken } from '@/lib/queryClient';

// Course list queries
export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () => courseApi.getCourses(filters),
    enabled: !!getAccessToken(),
    staleTime: 10 * 60 * 1000, // Courses don't change often - 10 minutes
  });
};

export const useCoursesPaginated = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: [...queryKeys.courses.list(filters), 'paginated'] as const,
    queryFn: () => courseApi.getCoursesPaginated(filters),
    enabled: !!getAccessToken(),
    staleTime: 10 * 60 * 1000,
  });
};

// Individual course queries
export const useCourse = (id: number) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => courseApi.getCourse(id),
    enabled: !!getAccessToken() && !!id,
    staleTime: 15 * 60 * 1000, // Course details cached for 15 minutes
  });
};

export const useCourseSections = (courseId: number) => {
  return useQuery({
    queryKey: queryKeys.courses.sections(courseId),
    queryFn: () => courseApi.getCourseSections(courseId),
    enabled: !!getAccessToken() && !!courseId,
    staleTime: 15 * 60 * 1000,
  });
};

// Section queries
export const useSection = (id: number) => {
  return useQuery({
    queryKey: ['sections', id] as const,
    queryFn: () => courseApi.getSection(id),
    enabled: !!getAccessToken() && !!id,
    staleTime: 15 * 60 * 1000,
  });
};

export const useSectionLessons = (sectionId: number) => {
  return useQuery({
    queryKey: ['sections', sectionId, 'lessons'] as const,
    queryFn: () => courseApi.getSectionLessons(sectionId),
    enabled: !!getAccessToken() && !!sectionId,
    staleTime: 10 * 60 * 1000,
  });
};

// Lesson queries
export const useLesson = (id: number) => {
  return useQuery({
    queryKey: queryKeys.courses.lesson(id),
    queryFn: () => courseApi.getLesson(id),
    enabled: !!getAccessToken() && !!id,
    staleTime: 5 * 60 * 1000, // Lessons may be updated more frequently
  });
};

// Progress queries
export const useCourseProgress = (courseId: number) => {
  return useQuery({
    queryKey: queryKeys.progress.courseProgress(courseId),
    queryFn: () => courseApi.getCourseProgress(courseId),
    enabled: !!getAccessToken() && !!courseId,
    staleTime: 2 * 60 * 1000, // Progress data is more dynamic
  });
};

export const useAllCoursesProgress = () => {
  return useQuery({
    queryKey: ['courses', 'progress', 'all'] as const,
    queryFn: () => courseApi.getAllCoursesProgress(),
    enabled: !!getAccessToken(),
    staleTime: 2 * 60 * 1000,
  });
};

// Lesson completion mutation
export const useCompleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, timeSpent }: {
      lessonId: number;
      timeSpent?: number;
    }) => courseApi.completeLesson(lessonId, timeSpent),
    
    onMutate: async ({ lessonId }) => {
      // Cancel outgoing refetches for this lesson
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.courses.lesson(lessonId) 
      });
      
      // Snapshot previous value
      const previousLesson = queryClient.getQueryData(queryKeys.courses.lesson(lessonId));
      
      // Optimistically update lesson completion
      queryClient.setQueryData(queryKeys.courses.lesson(lessonId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_completed: true,
          completed_at: new Date().toISOString(),
        };
      });
      
      return { previousLesson, lessonId };
    },
    
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.lesson(variables.lessonId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.stats() 
      });
      
      toast.success('Урок успешно завершен!');
    },
    
    onError: (error: any, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousLesson) {
        queryClient.setQueryData(
          queryKeys.courses.lesson(context.lessonId), 
          context.previousLesson
        );
      }
      toast.error(error.message || 'Ошибка при завершении урока');
    },
    
    onSettled: (data, error, variables) => {
      // Always refetch after mutation completes
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.lesson(variables.lessonId) 
      });
    },
  });
};

// Admin mutations (if user has admin role)
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseData: {
      title: string;
      description: string;
      image_url?: string;
      order: number;
    }) => courseApi.createCourse(courseData),
    
    onSuccess: () => {
      // Invalidate all course lists
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
      toast.success('Курс успешно создан');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка создания курса');
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: Partial<{
        title: string;
        description: string;
        image_url: string;
        order: number;
        is_active: boolean;
      }>;
    }) => courseApi.updateCourse(id, data),
    
    onSuccess: (updatedCourse, variables) => {
      // Update the specific course in cache
      queryClient.setQueryData(queryKeys.courses.detail(variables.id), updatedCourse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(variables.id) });
      
      toast.success('Курс успешно обновлен');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка обновления курса');
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => courseApi.deleteCourse(id),
    
    onSuccess: (_, deletedId) => {
      // Remove the course from all caches
      queryClient.removeQueries({ queryKey: queryKeys.courses.detail(deletedId) });
      queryClient.removeQueries({ queryKey: queryKeys.courses.sections(deletedId) });
      
      // Invalidate course lists
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
      
      toast.success('Курс успешно удален');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка удаления курса');
    },
  });
};

// Prefetch helpers
export const usePrefetchCourse = () => {
  const queryClient = useQueryClient();
  
  return (courseId: number) => {
    // Prefetch course details
    queryClient.prefetchQuery({
      queryKey: queryKeys.courses.detail(courseId),
      queryFn: () => courseApi.getCourse(courseId),
      staleTime: 15 * 60 * 1000,
    });
    
    // Prefetch course sections
    queryClient.prefetchQuery({
      queryKey: queryKeys.courses.sections(courseId),
      queryFn: () => courseApi.getCourseSections(courseId),
      staleTime: 15 * 60 * 1000,
    });
  };
};