import type { ChannelType } from "@/lib/utils/constants";

// =============================================================================
// CHAT TYPES — LLC-Lanka Issue Tracker Platform
// =============================================================================

export interface ChatUser {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  role: string;
  lastSeenAt?: Date | null;
  isOnline: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  isPrivate: boolean;
  avatarUrl?: string | null;
  memberCount: number;
  lastMessageAt?: Date | null;
  pinnedMessageIds: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Populated on fetch
  members?: ChatUser[];
  unreadCount?: number;
}

export interface Message {
  id: string;
  channelId: string;
  body: string;
  senderId: string;
  sender?: ChatUser;
  parentId?: string;
  replyToId?: string;
  replyTo?: Message;
  mentions: string[];
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  editedAt?: Date;
  editedBy?: string;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Client-side only
  tempId?: string;
  status?: "sending" | "sent" | "failed";
}

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
  hasReacted: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface TypingStatus {
  channelId: string;
  userId: string;
  displayName: string;
  isTyping: boolean;
}

export interface UnreadCount {
  channelId: string;
  count: number;
  lastReadMessageId?: string;
}

export interface CreateChannelPayload {
  name: string;
  description?: string;
  type: ChannelType;
  isPrivate?: boolean;
  memberIds?: string[];
}

export interface UpdateChannelPayload {
  name?: string;
  description?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
}

export interface SendMessagePayload {
  body: string;
  channelId: string;
  parentId?: string;
  replyToId?: string;
  mentions?: string[];
  tempId?: string;
}

export interface EditMessagePayload {
  messageId: string;
  body: string;
}

export interface AddReactionPayload {
  messageId: string;
  emoji: string;
}

export interface ChannelListResponse {
  channels: Channel[];
  total: number;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface LinkPreview {
  url: string;
  title: string;
  description?: string;
  image?: string;
  domain: string;
}

export interface PinnedMessagesResponse {
  messages: Message[];
}
