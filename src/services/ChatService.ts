import { prisma } from "@/lib/db/prisma";
import { AuditService } from "./AuditService";
import { NotificationService } from "./NotificationService";
import type { $Enums } from "@prisma/client";
import type { ChannelType } from "@/lib/utils/constants";
import type {
  Channel,
  Message,
  CreateChannelPayload,
  UpdateChannelPayload,
  SendMessagePayload,
  EditMessagePayload,
  AddReactionPayload,
} from "@/types/chat.types";

// =============================================================================
// CHAT SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class ChatService {
  /**
   * Create a new channel
   */
  static async createChannel(
    data: CreateChannelPayload,
    createdBy: string
  ): Promise<Channel> {
    const channel = await prisma.channel.create({
      data: {
        name: data.name,
        type: (data.type as $Enums.ChannelType) ?? "PUBLIC",
        createdById: createdBy,
        members: {
          create: {
            userId: createdBy,
          },
        },
      },
    });

    await AuditService.log({
      action: "CHANNEL_CREATED",
      userId: createdBy,
      entityType: "channel",
      entityId: channel.id,
      details: `Channel "${channel.name}" created`,
    });

    return this.formatChannel(channel);
  }

  /**
   * Get channel by ID
   */
  static async getChannelById(channelId: string): Promise<Channel | null> {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true, role: true } },
        members: {
          select: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        },
      },
    });

    if (!channel) return null;

    return this.formatChannel(channel);
  }

  /**
   * List channels for a user
   */
  static async listChannels(
    userId: string,
    params: { type?: string; search?: string; page?: number; pageSize?: number }
  ): Promise<{ channels: Channel[]; total: number }> {
    const { type, search, page = 1, pageSize = 20 } = params;

    const where: Record<string, unknown> = {
      members: { some: { userId } },
    };

    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [channels, total] = await Promise.all([
      prisma.channel.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, avatar: true, role: true } },
          members: {
            select: {
              user: { select: { id: true, name: true, avatar: true, role: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.channel.count({ where }),
    ]);

    return {
      channels: channels.map((c) => this.formatChannel(c)),
      total,
    };
  }

  /**
   * Update a channel
   */
  static async updateChannel(
    channelId: string,
    data: UpdateChannelPayload,
    _updatedBy: string
  ): Promise<Channel | null> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    
    const channel = await prisma.channel.update({
      where: { id: channelId },
      data: updateData,
    });

    return this.formatChannel(channel);
  }

  /**
   * Delete a channel
   */
  static async deleteChannel(channelId: string): Promise<boolean> {
    await prisma.$transaction([
      prisma.channel.delete({ where: { id: channelId } }),
      prisma.message.deleteMany({ where: { channelId } }),
    ]);

    return true;
  }

  /**
   * Add member to channel
   */
  static async addMember(
    channelId: string,
    userId: string,
    _addedBy: string
  ): Promise<Channel | null> {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { members: { select: { userId: true } } },
    });

    if (!channel) return null;

    if (channel.members.some((m) => m.userId === userId)) {
      return this.formatChannel(channel);
    }

    await prisma.channelMember.create({
      data: {
        channelId,
        userId,
      },
    });

    return this.getChannelById(channelId);
  }

  /**
   * Remove member from channel
   */
  static async removeMember(
    channelId: string,
    userId: string,
    _removedBy: string
  ): Promise<Channel | null> {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) return null;

    await prisma.channelMember.deleteMany({
      where: { channelId, userId },
    });

    return this.getChannelById(channelId);
  }

  /**
   * Send a message
   */
  static async sendMessage(
    data: SendMessagePayload,
    senderId: string
  ): Promise<Message> {
    const messageData = {
      channelId: data.channelId,
      body: data.body,
      authorId: senderId,
      ...(data.replyToId !== undefined && { replyToId: data.replyToId ?? null }),
    };
    
    const message = await prisma.message.create({
      data: messageData,
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    await AuditService.log({
      action: "MESSAGE_SENT",
      userId: senderId,
      entityType: "message",
      entityId: message.id,
      metadata: { channelId: data.channelId },
    });

    // Notify mentioned users
    if (data.mentions && data.mentions.length > 0) {
      const channel = await prisma.channel.findUnique({
        where: { id: data.channelId },
        select: { name: true },
      });

      for (const mentionedUserId of data.mentions) {
        if (mentionedUserId !== senderId) {
          await NotificationService.createNotification({
            userId: mentionedUserId,
            type: "MENTION",
            title: "You were mentioned",
            body: `You were mentioned in channel "${channel?.name || "a channel"}"`,
            data: { channelId: data.channelId, messageId: message.id, actorId: senderId },
          });
        }
      }
    }

    return this.formatMessage(message);
  }

  /**
   * Edit a message
   */
  static async editMessage(
    data: EditMessagePayload,
    userId: string
  ): Promise<Message | null> {
    const message = await prisma.message.findUnique({
      where: { id: data.messageId },
    });

    if (!message || message.authorId !== userId) return null;

    const updated = await prisma.message.update({
      where: { id: data.messageId },
      data: {
        body: data.body,
        updatedAt: new Date(),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    await AuditService.log({
      action: "MESSAGE_EDITED",
      userId,
      entityType: "message",
      entityId: data.messageId,
      details: "Message edited",
    });

    return this.formatMessage(updated);
  }

  /**
   * Delete a message
   */
  static async deleteMessage(
    messageId: string,
    userId: string,
    isSuperAdmin: boolean
  ): Promise<boolean> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) return false;

    if (message.authorId !== userId && !isSuperAdmin) return false;

    await prisma.$transaction(async (tx) => {
      await tx.message.delete({ where: { id: messageId } });
      return AuditService.log({
        action: "MESSAGE_DELETED",
        userId,
        entityType: "message",
        entityId: messageId,
        details: "Message deleted",
      });
    });

    return true;
  }

  /**
   * Add reaction to message
   */
  static async addReaction(
    data: AddReactionPayload,
    userId: string
  ): Promise<Message | null> {
    const message = await prisma.message.findUnique({
      where: { id: data.messageId },
    });

    if (!message) return null;

    await prisma.messageReaction.create({
      data: {
        messageId: data.messageId,
        userId,
        emoji: data.emoji,
      },
    });

    const updated = await prisma.message.findUnique({
      where: { id: data.messageId },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        reactions: true,
      },
    });

    return updated ? this.formatMessage(updated) : null;
  }

  /**
   * Remove reaction from message
   */
  static async removeReaction(
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<Message | null> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) return null;

    await prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId,
        emoji,
      },
    });

    const updated = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        reactions: true,
      },
    });

    return updated ? this.formatMessage(updated) : null;
  }

  /**
   * Get messages for a channel
   */
  static async getMessages(
    channelId: string,
    params: { page?: number; pageSize?: number; before?: string; after?: string }
  ): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
    const { page = 1, pageSize = 50, before, after } = params;
    const _page = page;

    const where: Record<string, unknown> = { channelId };
    if (before) where.id = { lt: before };
    if (after) where.id = { gt: after };

    const messages = await prisma.message.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        replyTo: {
          select: { id: true, body: true, author: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
      take: pageSize + 1,
    });

    const hasMore = messages.length > pageSize;
    if (hasMore) messages.pop();

    return {
      messages: messages.map((m) => this.formatMessage(m)),
      total: messages.length,
      hasMore,
    };
  }

  /**
   * Pin/unpin message
   */
  static async togglePinMessage(
    messageId: string,
    _channelId: string,
    _pinned: boolean
  ): Promise<Message | null> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    if (!message) return null;

    // Message pin status stored separately in practice, not on channel
    // For now, just return the message
    return this.formatMessage(message);
  }

  /**
   * Get or create DM channel between two users
   */
  static async getOrCreateDmChannel(
    userId1: string,
    userId2: string
  ): Promise<Channel> {
    // Check if DM already exists by looking for a channel with both users
    const existing = await prisma.channel.findFirst({
      where: {
        type: "DIRECT",
        members: {
          every: {
            userId: { in: [userId1, userId2] },
          },
        },
      },
    });

    if (existing) return this.formatChannel(existing);

    const user2 = await prisma.user.findUnique({
      where: { id: userId2 },
      select: { name: true },
    });

    const channel = await prisma.channel.create({
      data: {
        name: `DM with ${user2?.name || "Unknown"}`,
        type: "DIRECT",
        createdById: userId1,
        members: {
          create: [
            { userId: userId1 },
            { userId: userId2 },
          ],
        },
      },
    });

    return this.formatChannel(channel);
  }

  // Helper to format channel
  private static formatChannel(channel: Record<string, unknown>): Channel {
    const channelType = channel.type as string;
    let mappedType: ChannelType;
    switch (channelType.toUpperCase()) {
      case "PUBLIC":
        mappedType = "GENERAL";
        break;
      case "PRIVATE":
        mappedType = "GROUP";
        break;
      case "DIRECT":
        mappedType = "DIRECT";
        break;
      default:
        mappedType = "GENERAL";
    }
    const result: Channel = {
      id: channel.id as string,
      name: channel.name as string,
      type: mappedType,
      isPrivate: channel.isPrivate as boolean,
      memberCount: ((channel.memberIds as string[]) || []).length,
      pinnedMessageIds: (channel.pinnedMessageIds as string[]) || [],
      createdBy: channel.createdBy as string,
      createdAt: channel.createdAt as Date,
      updatedAt: channel.updatedAt as Date,
    };
    if (channel.description) result.description = channel.description as string;
    if (channel.avatarUrl) result.avatarUrl = channel.avatarUrl as string | null;
    if (channel.lastMessageAt) result.lastMessageAt = channel.lastMessageAt as Date;
    if (channel.members) result.members = channel.members as never[];
    return result;
  }

  // Helper to format message
  private static formatMessage(message: Record<string, unknown>): Message {
    const reactions = (message.reactions as Record<string, string[]>) || {};
    const formattedReactions = Object.entries(reactions).map(([emoji, users]) => ({
      emoji,
      users,
      count: (users as string[]).length,
      hasReacted: false,
    }));

    const result: Message = {
      id: message.id as string,
      channelId: message.channelId as string,
      body: message.body as string,
      senderId: message.senderId as string,
      mentions: (message.mentions as string[]) || [],
      attachments: [],
      reactions: formattedReactions,
      isPinned: message.isPinned as boolean,
      isDeleted: message.isDeleted as boolean,
      createdAt: message.createdAt as Date,
      updatedAt: message.updatedAt as Date,
    };
    if (message.sender) result.sender = message.sender as never;
    if (message.parentId) result.parentId = message.parentId as string;
    if (message.replyToId) result.replyToId = message.replyToId as string;
    if (message.replyTo) result.replyTo = message.replyTo as never;
    if (message.editedAt) result.editedAt = message.editedAt as Date;
    if (message.editedBy) result.editedBy = message.editedBy as string;
    if (message.tempId) result.tempId = message.tempId as string;
    if (message.status && (message.status === "sending" || message.status === "sent" || message.status === "failed")) {
      result.status = message.status as "sending" | "sent" | "failed";
    }
    return result;
  }
}
