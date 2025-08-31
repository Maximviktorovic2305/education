'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationStore {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  currentCourseId: number | null;
  currentLessonId: number | null;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCurrentCourseId: (id: number | null) => void;
  setCurrentLessonId: (id: number | null) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      mobileMenuOpen: false,
      currentCourseId: null,
      currentLessonId: null,
      
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
      setCurrentCourseId: (id: number | null) => set({ currentCourseId: id }),
      setCurrentLessonId: (id: number | null) => set({ currentLessonId: id }),
      
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),
    }),
    {
      name: 'navigation-storage',
      // Only persist sidebar state, not mobile menu
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen,
        currentCourseId: state.currentCourseId,
        currentLessonId: state.currentLessonId
      }),
    }
  )
);