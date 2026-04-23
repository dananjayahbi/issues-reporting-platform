import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { ISSUE_STATUSES, ISSUE_SEVERITIES as _ISSUE_SEVERITIES } from "@/lib/utils/constants";
import type { DashboardStats, TeamDashboardStats, VelocityDataPoint, ContributorStats } from "@/types/api.types";

// =============================================================================
// REPORT SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class ReportService {
  /**
   * Get personal dashboard stats for a user
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const [
      myOpenIssues,
      myResolvedThisWeek,
      unreadNotifications,
      unreadMessages,
      myIssuesNeedingReview,
      myAssignedOpenIssues,
    ] = await Promise.all([
      prisma.issue.count({
        where: {
          assignees: { some: { userId } },
          status: { notIn: [ISSUE_STATUSES.RESOLVED, ISSUE_STATUSES.CLOSED] },
        },
      }),
      prisma.issue.count({
        where: {
          assignees: { some: { userId } },
          status: { in: [ISSUE_STATUSES.RESOLVED, ISSUE_STATUSES.CLOSED] },
          resolvedAt: { gte: weekStart },
        },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      // Unread messages would need a join with channel membership
      0,
      prisma.issue.count({
        where: {
          createdById: userId,
          status: "OPEN",
        },
      }),
      prisma.issue.count({
        where: {
          assignees: { some: { userId } },
          status: "OPEN",
        },
      }),
    ]);

    return {
      myOpenIssues,
      myResolvedThisWeek,
      unreadNotifications,
      unreadMessages,
      myIssuesNeedingReview,
      myAssignedOpenIssues,
    };
  }

  /**
   * Get team-wide dashboard stats
   */
  static async getTeamDashboardStats(): Promise<TeamDashboardStats> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const [
      totalOpenIssues,
      totalResolvedThisWeek,
      issuesBySeverity,
      issuesByCategory,
      issuesByModule,
      issueVelocity,
      avgResolutionTimeBySeverity,
      topContributors,
    ] = await Promise.all([
      prisma.issue.count({
        where: { status: { notIn: [ISSUE_STATUSES.RESOLVED, ISSUE_STATUSES.CLOSED] } },
      }),
      prisma.issue.count({
        where: {
          status: { in: [ISSUE_STATUSES.RESOLVED, ISSUE_STATUSES.CLOSED] },
          resolvedAt: { gte: weekStart },
        },
      }),
      this.getIssuesByField("severity"),
      this.getIssuesByField("category"),
      this.getIssuesByField("module"),
      this.getIssueVelocity(7),
      this.getAvgResolutionTimeBySeverity(),
      this.getTopContributors(weekStart),
    ]);

    return {
      totalOpenIssues,
      totalResolvedThisWeek,
      issuesBySeverity,
      issuesByCategory,
      issuesByModule,
      issueVelocity,
      avgResolutionTimeBySeverity,
      topContributors,
    };
  }

  /**
   * Get issues grouped by a field
   */
  private static async getIssuesByField(field: string): Promise<Record<string, number>> {
    const results = await prisma.issue.groupBy({
      by: [field as unknown as keyof typeof Prisma.IssueScalarFieldEnum],
      where: { status: { notIn: [ISSUE_STATUSES.RESOLVED, ISSUE_STATUSES.CLOSED] } },
      _count: { [field]: true },
    });

    const grouped: Record<string, number> = {};
    for (const row of results) {
      const fieldValue = (row as Record<string, unknown>)[field];
      const count = (((row as Record<string, unknown>)._count as Record<string, number>)?.[field] as number) ?? 0;
      if (fieldValue != null) {
        grouped[String(fieldValue)] = count;
      }
    }
    return grouped;
  }

  /**
   * Get issue velocity (created vs resolved over time)
   */
  static async getIssueVelocity(days: number): Promise<VelocityDataPoint[]> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const issues = await prisma.issue.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
        status: true,
      },
    });

    // Group by date
    const dataPoints: Map<string, VelocityDataPoint> = new Map();

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0] ?? "";
      dataPoints.set(dateStr, { date: dateStr, created: 0, resolved: 0 });
    }

    for (const issue of issues) {
      const createdDate = issue.createdAt.toISOString().split("T")[0] ?? "";
      const dp = dataPoints.get(createdDate);
      if (dp) dp.created++;

      if (issue.resolvedAt) {
        const resolvedDate = issue.resolvedAt.toISOString().split("T")[0] ?? "";
        const dp = dataPoints.get(resolvedDate);
        if (dp) dp.resolved++;
      }
    }

    return Array.from(dataPoints.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get average resolution time by severity
   */
  private static async getAvgResolutionTimeBySeverity(): Promise<Record<string, number>> {
    const resolvedIssues = await prisma.issue.findMany({
      where: {
        status: { in: [ISSUE_STATUSES.RESOLVED, ISSUE_STATUSES.CLOSED] },
        resolvedAt: { not: null },
      },
      select: {
        severity: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    const totals: Record<string, { count: number; totalHours: number }> = {};

    for (const issue of resolvedIssues) {
      if (!issue.resolvedAt) continue;

      const resolvedAt = issue.resolvedAt;
      const hours = (resolvedAt.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60);

      if (totals[issue.severity] === undefined) {
        totals[issue.severity] = { count: 0, totalHours: 0 };
      }
      const severity = totals[issue.severity];
      if (severity) {
        severity.count++;
        severity.totalHours += hours;
      }
    }

    const averages: Record<string, number> = {};
    for (const [severity, data] of Object.entries(totals)) {
      averages[severity] = data.count > 0 ? data.totalHours / data.count : 0;
    }

    return averages;
  }

  /**
   * Get top contributors (users who resolved the most issues)
   */
  private static async getTopContributors(weekStart: Date): Promise<ContributorStats[]> {
    const resolvedIssues = await prisma.issue.findMany({
      where: {
        status: { in: [ISSUE_STATUSES.RESOLVED, ISSUE_STATUSES.CLOSED] },
        resolvedAt: { gte: weekStart },
      },
      select: {
        assignees: { select: { userId: true } },
        createdAt: true,
        resolvedAt: true,
        severity: true,
      },
    });

    const contributorMap: Map<string, { count: number; totalHours: number }> = new Map();

    for (const issue of resolvedIssues) {
      const resolvedAt = issue.resolvedAt;
      if (!resolvedAt || issue.assignees.length === 0) continue;

      const hours = (resolvedAt.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60);

      for (const assignment of issue.assignees) {
        const assigneeId = assignment.userId;
        const current = contributorMap.get(assigneeId) || { count: 0, totalHours: 0 };
        contributorMap.set(assigneeId, {
          count: current.count + 1,
          totalHours: current.totalHours + hours,
        });
      }
    }

    // Get user details
    const userIds = Array.from(contributorMap.keys());
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const contributors: ContributorStats[] = [];
    for (const [userId, data] of contributorMap.entries()) {
      const user = userMap.get(userId);
      if (!user) continue;

      contributors.push({
        userId,
        displayName: user.name,
        avatarUrl: user.avatar ?? null,
        issuesResolved: data.count,
        ...(data.count > 0 && { avgResolutionHours: data.totalHours / data.count }),
      });
    }

    return contributors
      .sort((a, b) => b.issuesResolved - a.issuesResolved)
      .slice(0, 10);
  }

  /**
   * Export issues as CSV data
   */
  static async exportIssuesAsCsv(filters: Record<string, unknown>): Promise<string> {
    const issues = await prisma.issue.findMany({
      where: filters,
      include: {
        createdBy: { select: { name: true } },
        assignees: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Title",
      "Status",
      "Severity",
      "Priority",
      "Category",
      "Module",
      "Environment",
      "Reporter",
      "Assignees",
      "Tags",
      "Created",
      "Updated",
      "Resolved",
    ];

    const rows = issues.map((issue) => [
      issue.id,
      `"${issue.title.replace(/"/g, '""')}"`,
      issue.status,
      issue.severity,
      issue.priority,
      issue.category,
      issue.module,
      issue.environment,
      issue.createdBy.name,
      `"${issue.assignees.map((a) => a.user.name).join(", ")}"`,
      `"${issue.tags.join(", ")}"`,
      issue.createdAt.toISOString(),
      issue.updatedAt.toISOString(),
      issue.resolvedAt?.toISOString() || "",
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}
