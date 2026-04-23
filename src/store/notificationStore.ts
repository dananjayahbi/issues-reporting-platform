"use client";

import { create } from "zustand";

interface NotificationState {
  // Unread count
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: (amount?: number) => void;

  // Real-time notifications
  latestNotification: {
    id: string;
    type: string;
    title: string;
    body: string;
  } | null;
  setLatestNotification: (notification: NotificationState["latestNotification"]) => void;
  clearLatestNotification: () => void;

  // Toast notifications
  toasts: Array<{
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    duration?: number;
  }>;
  addToast: (toast: Omit<NotificationState["toasts"][0], "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  // Unread count
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: (amount = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) })),

  // Real-time notifications
  latestNotification: null,
  setLatestNotification: (notification) => set({ latestNotification: notification }),
  clearLatestNotification: () => set({ latestNotification: null }),

  // Toast notifications
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
