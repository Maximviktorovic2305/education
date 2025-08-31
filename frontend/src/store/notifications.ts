'use client';

import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  clearOldNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 5000,
    };
    
    set({ 
      notifications: [...get().notifications, newNotification] 
    });
    
    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },
  
  removeNotification: (id) => {
    set({ 
      notifications: get().notifications.filter(n => n.id !== id) 
    });
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
  
  clearOldNotifications: () => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    set({ 
      notifications: get().notifications.filter(n => n.timestamp > fiveMinutesAgo) 
    });
  },
}));