'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIPreferencesStore {
  // Layout preferences
  compactMode: boolean;
  showIntroCards: boolean;
  animationsEnabled: boolean;
  
  // Learning preferences
  autoProgressLessons: boolean;
  showHints: boolean;
  confirmBeforeSubmission: boolean;
  
  // Accessibility preferences
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Actions
  setCompactMode: (enabled: boolean) => void;
  setShowIntroCards: (show: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setAutoProgressLessons: (enabled: boolean) => void;
  setShowHints: (show: boolean) => void;
  setConfirmBeforeSubmission: (confirm: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  resetToDefaults: () => void;
}

const defaultPreferences = {
  compactMode: false,
  showIntroCards: true,
  animationsEnabled: true,
  autoProgressLessons: false,
  showHints: true,
  confirmBeforeSubmission: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium' as const,
};

export const useUIPreferencesStore = create<UIPreferencesStore>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      
      setCompactMode: (enabled) => set({ compactMode: enabled }),
      setShowIntroCards: (show) => set({ showIntroCards: show }),
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      setAutoProgressLessons: (enabled) => set({ autoProgressLessons: enabled }),
      setShowHints: (show) => set({ showHints: show }),
      setConfirmBeforeSubmission: (confirm) => set({ confirmBeforeSubmission: confirm }),
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setHighContrast: (enabled) => set({ highContrast: enabled }),
      setFontSize: (size) => set({ fontSize: size }),
      
      resetToDefaults: () => set(defaultPreferences),
    }),
    {
      name: 'ui-preferences-storage',
    }
  )
);