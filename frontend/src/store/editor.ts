'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorStore {
  code: string;
  language: string;
  fontSize: number;
  theme: string;
  autoSave: boolean;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: string) => void;
  setAutoSave: (enabled: boolean) => void;
  resetEditor: () => void;
}

const defaultState = {
  code: '',
  language: 'go',
  fontSize: 14,
  theme: 'vs-dark',
  autoSave: true,
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      ...defaultState,
      
      setCode: (code: string) => set({ code }),
      setLanguage: (language: string) => set({ language }),
      setFontSize: (size: number) => set({ fontSize: size }),
      setTheme: (theme: string) => set({ theme }),
      setAutoSave: (enabled: boolean) => set({ autoSave: enabled }),
      
      resetEditor: () => set(defaultState),
    }),
    {
      name: 'editor-storage',
      // Don't persist code content, only preferences
      partialize: (state) => ({
        language: state.language,
        fontSize: state.fontSize,
        theme: state.theme,
        autoSave: state.autoSave,
      }),
    }
  )
);