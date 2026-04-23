"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { NotificationSummary, NotificationPreferences } from "@/types/notification.types";

const api = axios.create({
  baseURL: "/api/v1",
});

export function useNotifications(params: { page?: number; pageSize?: number; unreadOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const { data } = await api.get<{
        notifications: NotificationSummary[];
        total: number;
        unreadCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>("/notifications", { params });
      return data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: async () => {
      const { data } = await api.get<{ unreadCount: number }>("/notifications/unread-count");
      return data.unreadCount;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      await api.post("/notifications/mark-read", { notificationIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
}

export function useMarkAllRead() {
  return useMarkAllNotificationsRead();
}

export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const { data } = await api.get<NotificationPreferences>("/notifications/preferences");
      return data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      await api.put("/notifications/preferences", { preferences });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}
