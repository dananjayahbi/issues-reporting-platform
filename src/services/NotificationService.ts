import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type { NotificationType } from "@/lib/utils/constants";
import type {
  Notification,
  NotificationSummary,
  NotificationListResponse,
  NotificationPreferences,
} from "@/types/notification.types";

// =============================================================================
// NOTIFICATION SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: (data.data ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });

    return this.formatNotification(notification);
  }

  /**
   * Get notifications for a user
   */
  static async getNotifications(
    userId: string,
    params: { page?: number; pageSize?: number; unreadOnly?: boolean }
  ): Promise<NotificationListResponse> {
    const { page = 1, pageSize = 20, unreadOnly = false } = params;

    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications: notifications.map((n) => this.formatNotificationSummary(n)),
      total,
      unreadCount,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(
    userId: string,
    notificationIds: string[]
  ): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        id: { in: notificationIds },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Dismiss/delete a notification
   */
  static async dismissNotification(
    userId: string,
    notificationId: string
  ): Promise<boolean> {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) return false;

    await prisma.notification.delete({ where: { id: notificationId } });
    return true;
  }

  /**
   * Get notification preferences for a user
   */
  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
    });

    // Build preferences object from database records
    const result: NotificationPreferences = {
      issueAssigned: true,
      issueStatusChanged: true,
      commentAdded: true,
      chatReply: true,
      pollCreated: true,
      pollExpiring: true,
      newIssueInModule: true,
      mention: true,
    };

    for (const pref of preferences) {
      if (!pref.enabled) {
        const key = pref.eventType.toLowerCase();
        // Map event types to preference keys
        const keyMap: Record<string, keyof NotificationPreferences> = {
          issue_assigned: 'issueAssigned',
          issue_status_changed: 'issueStatusChanged',
          comment_added: 'commentAdded',
          chat_reply: 'chatReply',
          poll_created: 'pollCreated',
          poll_expiring: 'pollExpiring',
          new_issue_in_module: 'newIssueInModule',
          mention: 'mention',
        };
        const prefKey = keyMap[key];
        if (prefKey) {
          result[prefKey] = false;
        }
      }
    }

    return result;
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: NotificationPreferences
  ): Promise<NotificationPreferences> {
    // Delete existing preferences
    await prisma.notificationPreference.deleteMany({ where: { userId } });

    // Create new preferences from the object
    const prefEntries = Object.entries(preferences);
    for (const [key, value] of prefEntries) {
      await prisma.notificationPreference.create({
        data: {
          userId,
          eventType: key.toUpperCase(),
          enabled: value,
        },
      });
    }

    return preferences;
  }

  /**
   * Delete old notifications (cleanup job)
   */
  static async deleteOldNotifications(daysOld = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });

    return result.count;
  }

  // Helper to format notification
  private static formatNotification(n: Record<string, unknown>): Notification {
    const result: Notification = {
      id: n.id as string,
      type: n.type as NotificationType,
      title: n.title as string,
      body: n.body as string,
      data: (n.data as Record<string, unknown>) || {},
      isRead: n.isRead as boolean,
      createdAt: n.createdAt as Date,
    };
    if (n.readAt) result.readAt = n.readAt as Date;
    return result;
  }

  // Helper to format notification summary
  private static formatNotificationSummary(n: Record<string, unknown>): NotificationSummary {
    return {
      id: n.id as string,
      type: n.type as NotificationType,
      title: n.title as string,
      body: n.body as string,
      isRead: n.isRead as boolean,
      createdAt: n.createdAt as Date,
      data: n.data as Record<string, unknown>,
    };
  }
}
