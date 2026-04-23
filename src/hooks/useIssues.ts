"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  IssueFilters,
  CreateIssuePayload,
  UpdateIssuePayload,
  BulkIssueAction,
  IssueListResponse,
  IssueDetailResponse,
  IssueComment,
  IssueActivityEntry,
} from "@/types/issue.types";
import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
});

export function useIssues(filters: IssueFilters = {}, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["issues", filters, page, pageSize],
    queryFn: async () => {
      const { data } = await api.get<IssueListResponse>("/issues", {
        params: { ...filters, page, pageSize },
      });
      return data;
    },
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ["issue", id],
    queryFn: async () => {
      const { data } = await api.get<IssueDetailResponse>(`/issues/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateIssuePayload) => {
      const { data } = await api.post("/issues", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateIssuePayload & { id: string }) => {
      const { data } = await api.patch(`/issues/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue", variables.id] });
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/issues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}

export function useBulkIssueAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: BulkIssueAction) => {
      const { data } = await api.post("/issues/bulk", action);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}

export function useIssueComments(issueId: string) {
  return useQuery({
    queryKey: ["issue-comments", issueId],
    queryFn: async () => {
      const { data } = await api.get<IssueComment[]>(`/issues/${issueId}/comments`);
      return data;
    },
    enabled: !!issueId,
  });
}

export function useIssueActivity(issueId: string) {
  return useQuery({
    queryKey: ["issue-activity", issueId],
    queryFn: async () => {
      const { data } = await api.get<IssueActivityEntry[]>(`/issues/${issueId}/activity`);
      return data;
    },
    enabled: !!issueId,
  });
}

export function useIssueVersions(issueId: string) {
  return useQuery({
    queryKey: ["issue-versions", issueId],
    queryFn: async () => {
      const { data } = await api.get(`/issues/${issueId}/history`);
      return data;
    },
    enabled: !!issueId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueId, ...payload }: { issueId: string; body: string; parentId?: string }) => {
      const { data } = await api.post(`/issues/${issueId}/comments`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["issue-comments", variables.issueId] });
      queryClient.invalidateQueries({ queryKey: ["issue", variables.issueId] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      issueId,
      commentId,
      ...payload
    }: {
      issueId: string;
      commentId: string;
      body: string;
    }) => {
      const { data } = await api.patch(`/issues/${issueId}/comments/${commentId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["issue-comments", variables.issueId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueId, commentId }: { issueId: string; commentId: string }) => {
      await api.delete(`/issues/${issueId}/comments/${commentId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["issue-comments", variables.issueId] });
    },
  });
}

export function useFindDuplicates() {
  return useMutation({
    mutationFn: async ({ title, body }: { title: string; body: string }) => {
      const { data } = await api.post("/issues/check-duplicates", { title, body });
      return data;
    },
  });
}
