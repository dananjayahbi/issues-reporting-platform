import type { UserRole } from "@/lib/utils/constants";

// =============================================================================
// USER TYPES — LLC-Lanka Issue Tracker Platform
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  editorAutosaveInterval: number;
  editorDefaultView: "split" | "edit" | "preview";
  notificationEmailDigest: "none" | "daily" | "weekly";
  notificationPreferences: NotificationPreferences;
}

export interface NotificationPreferences {
  issueAssigned: boolean;
  issueStatusChanged: boolean;
  commentAdded: boolean;
  chatReply: boolean;
  pollCreated: boolean;
  pollExpiring: boolean;
  newIssueInModule: boolean;
  mention: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  avatar?: string;
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface DeactivateUserPayload {
  reason?: string;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserActivityEntry {
  id: string;
  userId: string;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface UserStats {
  issuesReported: number;
  issuesAssigned: number;
  issuesResolved: number;
  commentsPosted: number;
  pollsCreated: number;
  messagesSent: number;
  avgResolutionTimeHours?: number;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: Date | null;
}
