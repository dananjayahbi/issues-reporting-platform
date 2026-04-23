"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { UserProfile, UpdateUserPayload } from "@/types/user.types";

async function fetchUsers(): Promise<UserProfile[]> {
  const response = await axios.get("/api/users");
  return response.data.users || [];
}

async function fetchUser(id: string): Promise<UserProfile> {
  const response = await axios.get(`/api/users/${id}`);
  return response.data;
}

async function fetchUserProfile(): Promise<UserProfile> {
  const response = await axios.get("/api/users/profile");
  return response.data;
}

async function updateProfile(data: UpdateUserPayload): Promise<UserProfile> {
  const response = await axios.patch("/api/users/profile", data);
  return response.data;
}

async function updateUserRole(
  userId: string,
  role: string
): Promise<void> {
  await axios.patch(`/api/users/${userId}`, { role });
}

async function deactivateUser(userId: string): Promise<void> {
  await axios.delete(`/api/users/${userId}`);
}

async function fetchUserStats() {
  const response = await axios.get("/api/users/stats");
  return response.data;
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

export function useProfile() {
  const _queryClient = useQueryClient();

  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchUserProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchUserStats,
  });
}
