"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Channel, Message, CreateChannelPayload, SendMessagePayload } from "@/types/chat.types";

const api = axios.create({
  baseURL: "/api/v1",
});

export function useChannels(params: { type?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ["channels", params],
    queryFn: async () => {
      const { data } = await api.get<{ channels: Channel[]; total: number }>("/chat/channels", {
        params,
      });
      return data;
    },
  });
}

export function useChannel(id: string) {
  return useQuery({
    queryKey: ["channel", id],
    queryFn: async () => {
      const { data } = await api.get<Channel>(`/chat/channels/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateChannelPayload) => {
      const { data } = await api.post<Channel>("/chat/channels", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<CreateChannelPayload>) => {
      const { data } = await api.patch<Channel>(`/chat/channels/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["channel", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/chat/channels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}

export function useChannelMessages(
  channelId: string,
  params: { page?: number; pageSize?: number } = {}
) {
  return useQuery({
    queryKey: ["channel-messages", channelId, params],
    queryFn: async () => {
      const { data } = await api.get<{ messages: Message[]; total: number; hasMore: boolean }>(
        `/chat/channels/${channelId}/messages`,
        { params }
      );
      return data;
    },
    enabled: !!channelId,
  });
}

export function useMessages(channelId: string, params: { page?: number; pageSize?: number } = {}) {
  return useChannelMessages(channelId, params);
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const { data } = await api.post<Message>(
        `/chat/channels/${payload.channelId}/messages`,
        payload
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["channel-messages", variables.channelId] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}

export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      messageId,
      body,
    }: {
      channelId: string;
      messageId: string;
      body: string;
    }) => {
      const { data } = await api.patch<Message>(
        `/chat/channels/${channelId}/messages/${messageId}`,
        { body }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["channel-messages", variables.channelId] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, messageId }: { channelId: string; messageId: string }) => {
      await api.delete(`/chat/channels/${channelId}/messages/${messageId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["channel-messages", variables.channelId] });
    },
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      messageId,
      emoji,
    }: {
      channelId: string;
      messageId: string;
      emoji: string;
    }) => {
      const { data } = await api.post<Message>(
        `/chat/channels/${channelId}/messages/${messageId}/reactions`,
        { emoji }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["channel-messages", variables.channelId] });
    },
  });
}

export function useDmChannel(userId: string) {
  return useQuery({
    queryKey: ["dm-channel", userId],
    queryFn: async () => {
      const { data } = await api.get<Channel>(`/chat/dm/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}
