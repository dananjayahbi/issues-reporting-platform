import type { PollType } from "@/lib/utils/constants";

// =============================================================================
// POLL TYPES — LLC-Lanka Issue Tracker Platform
// =============================================================================

export interface PollOption {
  id: string;
  label: string;
  description?: string;
  voteCount: number;
  percentage: number;
  voters?: PollVoter[];
}

export interface PollVoter {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  votedAt: Date;
}

export interface Poll {
  id: string;
  title: string;
  question: string;
  pollType: PollType;
  options: PollOption[];
  isAnonymous: boolean;
  allowChangeVote: boolean;
  minParticipation?: number;
  expiresAt?: Date;
  closedAt?: Date;
  createdBy: string;
  creator?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  issueId?: string;
  channelId?: string;
  totalVotes: number;
  voterCount: number;
  hasVoted: boolean;
  userVote?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PollSummary {
  id: string;
  title: string;
  question: string;
  pollType: PollType;
  totalVotes: number;
  voterCount: number;
  hasVoted: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  createdBy: string;
  creator?: {
    id: string;
    displayName: string;
  };
  createdAt: Date;
}

export interface CreatePollPayload {
  title: string;
  question: string;
  pollType: PollType;
  options: string[];
  isAnonymous?: boolean;
  allowChangeVote?: boolean;
  minParticipation?: number;
  expiresAt?: string;
  issueId?: string;
  channelId?: string;
}

export interface UpdatePollPayload {
  title?: string;
  question?: string;
  isAnonymous?: boolean;
  allowChangeVote?: boolean;
  minParticipation?: number;
  expiresAt?: string;
}

export interface VotePollPayload {
  optionIds: string[];
}

export interface PollListResponse {
  polls: PollSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PollResults {
  poll: Poll;
  options: PollOption[];
  totalVotes: number;
  participationRate?: number;
  winningOptionId?: string;
}
