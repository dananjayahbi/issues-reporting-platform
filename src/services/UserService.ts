import { prisma } from "@/lib/db/prisma";
import { AuditService } from "./AuditService";
import { USER_ROLES, ROLE_HIERARCHY as _ROLE_HIERARCHY } from "@/lib/utils/constants";
import type { UserRole } from "@/lib/utils/constants";
import type {
  UserProfile,
  UserListItem,
  UserSettings,
  UserActivityEntry,
  UserStats,
  UpdateUserPayload,
} from "@/types/user.types";

// =============================================================================
// USER SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as UserProfile | null;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as UserProfile | null;
  }

  /**
   * List users with pagination and filters
   */
  static async listUsers(params: {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<{ users: UserListItem[]; total: number }> {
    const {
      search,
      role,
      isActive,
      page = 1,
      pageSize = 20,
      sortBy = "createdAt",
      sortDir = "desc",
    } = params;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);
    
    return { users: users as UserListItem[], total };
  }

  /**
   * Update user profile
   */
  static async updateUser(
    userId: string,
    updates: UpdateUserPayload,
    updatedBy: string
  ): Promise<UserProfile | null> {
    const data: Record<string, unknown> = {};
    
    if (updates.name) data.name = updates.name;
    if (updates.avatar) data.avatar = updates.avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditService.log({
      action: "USER_UPDATED",
      userId: updatedBy,
      entityType: "user",
      entityId: userId,
      details: "User profile updated",
    });

    return user as UserProfile;
  }

  /**
   * Update user role (Super Admin only)
   */
  static async updateUserRole(
    userId: string,
    newRole: UserRole,
    updatedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    // Cannot change Super Admin role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    if (targetUser.role === USER_ROLES.SUPER_ADMIN) {
      return { success: false, error: "Cannot change Super Admin role" };
    }

    if (newRole === USER_ROLES.SUPER_ADMIN) {
      return { success: false, error: "Cannot assign Super Admin role" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await AuditService.log({
      action: "USER_UPDATED",
      userId: updatedBy,
      entityType: "user",
      entityId: userId,
      details: `Role changed to ${newRole}`,
    });

    return { success: true };
  }

  /**
   * Deactivate a user
   */
  static async deactivateUser(
    userId: string,
    reason?: string,
    deactivatedBy?: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return { success: false, error: "Cannot deactivate Super Admin" };
    }

    if (!user.isActive) {
      return { success: false, error: "User is already deactivated" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await AuditService.log({
      action: "USER_DEACTIVATED",
      userId: deactivatedBy || userId,
      entityType: "user",
      entityId: userId,
      details: reason ? `Reason: ${reason}` : "User deactivated",
    });

    return { success: true };
  }

  /**
   * Reactivate a user
   */
  static async reactivateUser(
    userId: string,
    reactivatedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.isActive) {
      return { success: false, error: "User is already active" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true, failedLoginAttempts: 0, lockedUntil: null },
    });

    await AuditService.log({
      action: "USER_REACTIVATED",
      userId: reactivatedBy,
      entityType: "user",
      entityId: userId,
      details: "User reactivated",
    });

    return { success: true };
  }

  /**
   * Get user settings
   * Note: UserSettings model doesn't exist in schema, returning defaults
   */
  static async getUserSettings(_userId: string): Promise<UserSettings | null> {
    // Return default settings since UserSettings model doesn't exist
    return {
      theme: "system",
      language: "de",
      timezone: "Europe/Berlin",
      editorAutosaveInterval: 30,
      editorDefaultView: "split",
      notificationEmailDigest: "daily",
      notificationPreferences: {
        issueAssigned: true,
        issueStatusChanged: true,
        commentAdded: true,
        chatReply: true,
        pollCreated: true,
        pollExpiring: true,
        newIssueInModule: true,
        mention: true,
      },
    };
  }

  /**
   * Update user settings
   * Note: UserSettings model doesn't exist in schema, this is a no-op
   */
  static async updateUserSettings(
    userId: string,
    _settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    // UserSettings model doesn't exist, return current settings
    return this.getUserSettings(userId) as Promise<UserSettings>;
  }

  /**
   * Get user activity log
   */
  static async getUserActivity(
    userId: string,
    params: { page?: number; pageSize?: number }
  ): Promise<{ entries: UserActivityEntry[]; total: number }> {
    const { page = 1, pageSize = 50 } = params;

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where: { userId } }),
    ]);

    return {
      entries: entries as UserActivityEntry[],
      total,
    };
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    const [issuesAssigned, commentsPosted, pollsCreated, messagesSent] =
      await Promise.all([
        prisma.issueAssignment.count({ where: { userId } }),
        prisma.comment.count({ where: { authorId: userId } }),
        prisma.poll.count({ where: { createdById: userId } }),
        prisma.message.count({ where: { authorId: userId } }),
      ]);

    return {
      issuesReported: 0,
      issuesAssigned,
      issuesResolved: 0,
      commentsPosted,
      pollsCreated,
      messagesSent,
    };
  }

  /**
   * Update last seen timestamp
   */
  static async updateLastSeen(_userId: string): Promise<void> {
    // Note: lastSeenAt field not available in schema, skip this operation
    return;
  }

  /**
   * Search users by name or email
   */
  static async searchUsers(query: string, limit = 10): Promise<UserListItem[]> {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      take: limit,
    });

    return users as UserListItem[];
  }
}
