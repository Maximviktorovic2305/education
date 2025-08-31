// UI-only Zustand stores
// These stores handle client-side UI state only
// Server state is managed by TanStack Query

export { useThemeStore } from './theme';
export { useNavigationStore } from './navigation';
export { useEditorStore } from './editor';
export { useNotificationStore } from './notifications';
export { useUIPreferencesStore } from './uiPreferences';

// Re-export types
export type { Theme } from '@/types';