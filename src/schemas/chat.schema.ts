import { z } from "zod";
import { CHANNEL_TYPES } from "@/lib/utils/constants";

// =============================================================================
// CHAT SCHEMAS — LLC-Lanka Issue Tracker Platform
// =============================================================================

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .max(100, "Channel name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
  type: z.enum([
    CHANNEL_TYPES.GENERAL,
    CHANNEL_TYPES.ISSUE_LINKED,
    CHANNEL_TYPES.DIRECT,
    CHANNEL_TYPES.GROUP,
  ]),
  isPrivate: z.boolean().optional().default(false),
  memberIds: z.array(z.string().uuid()).optional(),
});

export const updateChannelSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .max(100, "Channel name must not exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
  avatarUrl: z.string().url().optional(),
  isPrivate: z.boolean().optional(),
});

export const sendMessageSchema = z.object({
  body: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must not exceed 5000 characters"),
  channelId: z.string().uuid("Channel ID must be a valid UUID"),
  parentId: z.string().uuid().optional(),
  replyToId: z.string().uuid().optional(),
  mentions: z.array(z.string()).optional(),
  tempId: z.string().optional(),
});

export const editMessageSchema = z.object({
  messageId: z.string().uuid("Message ID must be a valid UUID"),
  body: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must not exceed 5000 characters"),
});

export const deleteMessageSchema = z.object({
  messageId: z.string().uuid("Message ID must be a valid UUID"),
});

export const addReactionSchema = z.object({
  messageId: z.string().uuid("Message ID must be a valid UUID"),
  emoji: z
    .string()
    .min(1, "Emoji is required")
    .max(8, "Emoji is too long")
    .describe("A single emoji character or shortcode"),
});

export const removeReactionSchema = z.object({
  messageId: z.string().uuid("Message ID must be a valid UUID"),
  emoji: z.string().min(1, "Emoji is required"),
});

export const pinMessageSchema = z.object({
  messageId: z.string().uuid("Message ID must be a valid UUID"),
});

export const unpinMessageSchema = z.object({
  messageId: z.string().uuid("Message ID must be a valid UUID"),
});

export const addChannelMemberSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
});

export const removeChannelMemberSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
});

export const createDmSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
});

export const channelFiltersSchema = z.object({
  type: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
});

export const messageFiltersSchema = z.object({
  channelId: z.string().uuid("Channel ID must be a valid UUID"),
  parentId: z.string().uuid().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(50),
  before: z.string().uuid().optional(),
  after: z.string().uuid().optional(),
});

// Type exports
export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
export type AddReactionInput = z.infer<typeof addReactionSchema>;
export type RemoveReactionInput = z.infer<typeof removeReactionSchema>;
export type PinMessageInput = z.infer<typeof pinMessageSchema>;
export type UnpinMessageInput = z.infer<typeof unpinMessageSchema>;
export type AddChannelMemberInput = z.infer<typeof addChannelMemberSchema>;
export type RemoveChannelMemberInput = z.infer<typeof removeChannelMemberSchema>;
export type CreateDmInput = z.infer<typeof createDmSchema>;
export type ChannelFiltersInput = z.infer<typeof channelFiltersSchema>;
export type MessageFiltersInput = z.infer<typeof messageFiltersSchema>;
