"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Poll, CreatePollPayload } from "@/types/poll.types";

async function fetchPolls(): Promise<Poll[]> {
  const response = await axios.get("/api/polls");
  return response.data;
}

async function fetchPoll(id: string): Promise<Poll> {
  const response = await axios.get(`/api/polls/${id}`);
  return response.data;
}

async function createPoll(data: CreatePollPayload): Promise<Poll> {
  const response = await axios.post("/api/polls", data);
  return response.data;
}

async function votePoll(pollId: string, optionId: string): Promise<void> {
  await axios.post(`/api/polls/${pollId}/vote`, { optionId });
}

async function closePoll(pollId: string): Promise<void> {
  await axios.post(`/api/polls/${pollId}/close`);
}

export function usePolls() {
  return useQuery({
    queryKey: ["polls"],
    queryFn: fetchPolls,
  });
}

export function usePoll(id: string) {
  return useQuery({
    queryKey: ["poll", id],
    queryFn: () => fetchPoll(id),
    enabled: !!id,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      votePoll(pollId, optionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}

export function useClosePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closePoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });
}
