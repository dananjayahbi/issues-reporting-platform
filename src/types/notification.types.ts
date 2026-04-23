import type { NotificationType } from "@/lib/utils/constants";

// =============================================================================
// NOTIFICATION TYPES — LLC-Lanka Issue Tracker Platform
// =============================================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationData {
  issueId?: string;
  issueTitle?: string;
  commentId?: string;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  userId?: string;
  actorId?: string;
  actorName?: string;
  [key: string]: unknown;
}

export interface NotificationSummary {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  data: NotificationData;
}

export interface NotificationListResponse {
  notifications: NotificationSummary[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MarkNotificationsReadPayload {
  notificationIds: string[];
  all?: boolean;
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

export interface UpdateNotificationPreferencesPayload {
  preferences: NotificationPreferences;
}

export interface NotificationSettings {
  emailDigest: "none" | "daily" | "weekly";
  emailAddress: string;
  preferences: NotificationPreferences;
}
