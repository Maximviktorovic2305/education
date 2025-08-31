'use client';

import { create } from 'zustand';
import { Course, Section, Lesson } from '@/types';
import { courseApi } from '@/api/courses';

interface CourseStore {
  courses: Course[];
  currentCourse: Course | null;
  currentSection: Section | null;
  currentLesson: Lesson | null;
  sections: Section[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCourses: () => Promise<void>;
  fetchCourseSections: (courseId: number) => Promise<void>;
  fetchLesson: (lessonId: number) => Promise<void>;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentSection: (section: Section | null) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  completeLesson: (lessonId: number) => Promise<void>;
  clearError: () => void;
}

export const useCourseStore = create<CourseStore>()((set, get) => ({
  courses: [],
  currentCourse: null,
  currentSection: null,
  currentLesson: null,
  sections: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    try {
      set({ isLoading: true, error: null });
      const courses = await courseApi.getCourses();
      set({ courses, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки курсов',
        isLoading: false,
      });
    }
  },

  fetchCourseSections: async (courseId: number) => {
    try {
      set({ isLoading: true, error: null });
      const sections = await courseApi.getCourseSections(courseId);
      set({ sections, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки разделов',
        isLoading: false,
      });
    }
  },

  fetchLesson: async (lessonId: number) => {
    try {
      set({ isLoading: true, error: null });
      const lesson = await courseApi.getLesson(lessonId);
      set({ currentLesson: lesson, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки урока',
        isLoading: false,
      });
    }
  },

  setCurrentCourse: (course) => set({ currentCourse: course }),
  setCurrentSection: (section) => set({ currentSection: section }),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

  completeLesson: async (lessonId: number) => {
    try {
      await courseApi.completeLesson(lessonId);
      // Обновляем текущий урок как завершённый
      const { currentLesson } = get();
      if (currentLesson && currentLesson.id === lessonId) {
        // Здесь можно добавить логику обновления состояния урока
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка завершения урока',
      });
    }
  },

  clearError: () => set({ error: null }),
}));