import { Course, Section, Lesson, PaginatedResponse } from '@/types';
import { api } from './client';

export interface CourseFilters {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export interface LessonCompletion {
  lesson_id: number;
  completed_at: string;
  time_spent: number;
}

class CourseAPI {
  /**
   * Get all courses with optional filtering
   */
  async getCourses(filters?: CourseFilters): Promise<Course[]> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.protected.get<Course[]>(`/courses${query}`);
  }

  /**
   * Get paginated courses
   */
  async getCoursesPaginated(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.protected.get<PaginatedResponse<Course>>(`/courses/paginated${query}`);
  }

  /**
   * Get a specific course by ID with sections
   */
  async getCourse(id: number): Promise<Course> {
    return api.protected.get<Course>(`/courses/${id}`);
  }

  /**
   * Get all sections for a specific course
   */
  async getCourseSections(courseId: number): Promise<Section[]> {
    return api.protected.get<Section[]>(`/courses/${courseId}/sections`);
  }

  /**
   * Get a specific section by ID with lessons
   */
  async getSection(id: number): Promise<Section> {
    return api.protected.get<Section>(`/sections/${id}`);
  }

  /**
   * Get all lessons for a specific section
   */
  async getSectionLessons(sectionId: number): Promise<Lesson[]> {
    return api.protected.get<Lesson[]>(`/sections/${sectionId}/lessons`);
  }

  /**
   * Get a specific lesson by ID
   */
  async getLesson(id: number): Promise<Lesson> {
    return api.protected.get<Lesson>(`/lessons/${id}`);
  }

  /**
   * Mark a lesson as completed
   */
  async completeLesson(lessonId: number, timeSpent: number = 0): Promise<LessonCompletion> {
    return api.protected.post<LessonCompletion>(`/lessons/${lessonId}/complete`, {
      time_spent: timeSpent
    });
  }

  /**
   * Get user's progress for a specific course
   */
  async getCourseProgress(courseId: number): Promise<{
    course_id: number;
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
    last_accessed: string;
  }> {
    return api.protected.get(`/courses/${courseId}/progress`);
  }

  /**
   * Get user's progress for all courses
   */
  async getAllCoursesProgress(): Promise<Array<{
    course_id: number;
    course_title: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
    last_accessed: string;
  }>> {
    return api.protected.get('/courses/progress');
  }

  /**
   * Admin only: Create a new course
   */
  async createCourse(courseData: {
    title: string;
    description: string;
    image_url?: string;
    order: number;
  }): Promise<Course> {
    return api.protected.post<Course>('/courses', courseData);
  }

  /**
   * Admin only: Update a course
   */
  async updateCourse(id: number, courseData: Partial<{
    title: string;
    description: string;
    image_url: string;
    order: number;
    is_active: boolean;
  }>): Promise<Course> {
    return api.protected.put<Course>(`/courses/${id}`, courseData);
  }

  /**
   * Admin only: Delete a course
   */
  async deleteCourse(id: number): Promise<void> {
    return api.protected.delete<void>(`/courses/${id}`);
  }
}

export const courseApi = new CourseAPI();