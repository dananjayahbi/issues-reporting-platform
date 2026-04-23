import { prisma } from "@/lib/db/prisma";
import type { AuditAction } from "@/lib/utils/constants";
import type { AuditLogEntry, AuditLogFilters } from "@/types/api.types";
import type { Prisma } from "@prisma/client";

// =============================================================================
// AUDIT SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class AuditService {
  /**
   * Log an audit event
   */
  static async log(data: {
    action: AuditAction | string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    details?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLogEntry> {
    const entry = await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId ?? "system",
        entityType: data.entityType ?? "system",
        entityId: data.entityId ?? "system",
        details: data.details ?? null,
        metadata: (data.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });

    return entry as unknown as AuditLogEntry;
  }

  /**
   * Get audit log entries with filters
   */
  static async getAuditLog(
    filters: AuditLogFilters,
    params: { page?: number; pageSize?: number; sortBy?: string; sortDir?: "asc" | "desc" }
  ): Promise<{ entries: AuditLogEntry[]; total: number }> {
    const { page = 1, pageSize = 50, sortBy = "createdAt", sortDir = "desc" } = params;

    const where: Record<string, unknown> = {};

    if (filters.action?.length) where.action = { in: filters.action };
    if (filters.userId) where.userId = filters.userId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.dateFrom) where.createdAt = { ...((where.createdAt as object) || {}), gte: new Date(filters.dateFrom) };
    if (filters.dateTo) where.createdAt = { ...((where.createdAt as object) || {}), lte: new Date(filters.dateTo) };

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      entries: entries.map((e) => ({
        id: e.id,
        action: e.action,
        details: e.details ?? undefined,
        metadata: e.metadata as Record<string, unknown> | undefined,
        userId: e.userId ?? undefined,
        user: e.user ? ({
          id: e.user.id,
          displayName: e.user.name,
          email: e.user.email,
        } as unknown as { id: string; displayName: string | null; email: string }) : undefined,
        createdAt: e.createdAt,
      } as unknown as AuditLogEntry)),
      total,
    };
  }

  /**
   * Get audit log entries for a specific entity
   */
  static async getEntityAuditLog(
    entityType: string,
    entityId: string,
    params: { page?: number; pageSize?: number } = {}
  ): Promise<{ entries: AuditLogEntry[]; total: number }> {
    const { page = 1, pageSize = 50 } = params;

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { entityType, entityId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where: { entityType, entityId } }),
    ]);

    return {
      entries: entries.map((e) => ({
        id: e.id,
        action: e.action,
        details: e.details ?? undefined,
        metadata: e.metadata as Record<string, unknown> | undefined,
        userId: e.userId ?? undefined,
        user: e.user ? ({
          id: e.user.id,
          displayName: e.user.name,
          email: e.user.email,
        } as unknown as { id: string; displayName: string | null; email: string }) : undefined,
        createdAt: e.createdAt,
      } as unknown as AuditLogEntry)),
      total,
    };
  }

  /**
   * Get audit log summary statistics
   */
  static async getSummary(): Promise<{
    totalEntries: number;
    entriesToday: number;
    entriesThisWeek: number;
    entriesByAction: Record<string, number>;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const [totalEntries, entriesToday, entriesThisWeek, actionCounts] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.auditLog.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.auditLog.groupBy({
        by: ["action"],
        _count: { action: true },
      }),
    ]);

    const entriesByAction: Record<string, number> = {};
    for (const row of actionCounts) {
      entriesByAction[row.action] = row._count.action;
    }

    return {
      totalEntries,
      entriesToday,
      entriesThisWeek,
      entriesByAction,
    };
  }

  /**
   * Clean up old audit log entries
   */
  static async cleanupOldEntries(daysOld = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        action: {
          notIn: [
            "USER_CREATED",
            "USER_DEACTIVATED",
            "USER_REACTIVATED",
            "SETTINGS_CHANGED",
          ],
        },
      },
    });

    return result.count;
  }
}
