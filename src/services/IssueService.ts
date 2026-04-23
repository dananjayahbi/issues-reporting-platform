import { prisma } from "@/lib/db/prisma";
import type {
  IssueStatus,
  IssueSeverity,
  IssuePriority,
  IssueCategory,
  IssueModule,
  IssueEnvironment,
} from "@/lib/utils/constants";
import { AuditService } from "./AuditService";
import { NotificationService } from "./NotificationService";
import { areSimilar } from "@/lib/utils/similarity";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/lib/utils/constants";
import type { $Enums } from "@prisma/client";
import type {
  Issue,
  IssueSummary,
  IssueFilters,
  CreateIssuePayload,
  UpdateIssuePayload,
  IssueListResponse,
  IssueDetailResponse,
  IssueComment,
  BulkIssueAction,
  Tag,
  UserSummary,
  IssueActivityEntry,
} from "@/types/issue.types";

// Re-export payload types for API use
export type { CreateIssuePayload, UpdateIssuePayload };

// =============================================================================
// ISSUE SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class IssueService {
  /**
   * Create a new issue
   */
  static async createIssue(
    data: CreateIssuePayload,
    reporterId: string
  ): Promise<Issue> {
    const issue = await prisma.issue.create({
      data: {
        title: data.title,
        body: data.body,
        status: "OPEN" as const,
        severity: data.severity as $Enums.IssueSeverity,
        priority: data.priority as $Enums.IssuePriority,
        category: data.category,
        module: data.module,
        environment: data.environment,
        tags: [],
        createdById: reporterId,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true, role: true } },
        assignees: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } },
      },
    });

    // Create initial version
    await prisma.issueVersion.create({
      data: {
        issueId: issue.id,
        body: issue.body,
        createdById: reporterId,
      },
    });

    // Log activity
    await AuditService.log({
      action: "ISSUE_CREATED",
      userId: reporterId,
      entityType: "issue",
      entityId: issue.id,
      details: `Issue "${issue.title}" created`,
    });

    // Notify assignees
    for (const assignment of issue.assignees) {
      await NotificationService.createNotification({
        userId: assignment.userId,
        type: "ISSUE_ASSIGNED",
        title: "Issue Assigned to You",
        body: `${issue.createdBy.name} assigned issue "${issue.title}" to you`,
        data: { issueId: issue.id, issueTitle: issue.title, actorId: reporterId },
      });
    }

    return this.formatIssue(issue);
  }

  /**
   * Get issue by ID
   */
  static async getIssueById(issueId: string): Promise<Issue | null> {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true, role: true } },
        assignees: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        polls: {
          include: {
            options: true,
            votes: true,
            createdBy: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!issue) return null;

    // Get comment count
    const commentCount = await prisma.comment.count({ where: { issueId } });

    return this.formatIssue(issue, { commentCount });
  }

  /**
   * Get issue detail with comments and activity
   */
  static async getIssueDetail(issueId: string): Promise<IssueDetailResponse | null> {
    const issue = await this.getIssueById(issueId);
    if (!issue) return null;

    const [comments, activity] = await Promise.all([
      this.getIssueComments(issueId),
      this.getIssueActivity(issueId),
    ]);

    return { issue, comments, activity };
  }

  /**
   * List issues with filters and pagination
   */
  static async listIssues(
    filters: IssueFilters,
    params: { page?: number; pageSize?: number; sortBy?: string; sortDir?: "asc" | "desc" }
  ): Promise<IssueListResponse> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, sortBy = "createdAt", sortDir = "desc" } = params;

    const where: Record<string, unknown> = {};

    if (filters.status?.length) where.status = { in: filters.status };
    if (filters.severity?.length) where.severity = { in: filters.severity };
    if (filters.priority?.length) where.priority = { in: filters.priority };
    if (filters.category?.length) where.category = { in: filters.category };
    if (filters.module?.length) where.module = { in: filters.module };
    if (filters.environment?.length) where.environment = { in: filters.environment };
    if (filters.assigneeIds?.length) where.assignees = { some: { userId: { in: filters.assigneeIds } } };
    if (filters.reporterId) where.createdById = filters.reporterId;
    if (filters.tagIds?.length) where.tags = { hasSome: filters.tagIds };
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { body: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.dateFrom) where.createdAt = { ...((where.createdAt as object) || {}), gte: new Date(filters.dateFrom) };
    if (filters.dateTo) where.createdAt = { ...((where.createdAt as object) || {}), lte: new Date(filters.dateTo) };
    if (filters.hasAttachments) where.attachments = { some: {} };
    if (filters.hasPoll) where.polls = { some: {} };

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, avatar: true, role: true } },
          assignees: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } },
          _count: { select: { comments: true } },
        },
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: Math.min(pageSize, MAX_PAGE_SIZE),
      }),
      prisma.issue.count({ where }),
    ]);

    const items: IssueSummary[] = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      status: issue.status as IssueSummary["status"],
      severity: issue.severity as IssueSummary["severity"],
      priority: issue.priority as IssueSummary["priority"],
      category: issue.category as IssueSummary["category"],
      module: issue.module as IssueSummary["module"],
      reporter: {
        id: issue.createdBy.id,
        displayName: issue.createdBy.name,
        role: issue.createdBy.role,
      },
      assigneeCount: issue.assignees.length,
      commentCount: issue._count.comments,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Update an issue
   */
  static async updateIssue(
    issueId: string,
    updates: UpdateIssuePayload,
    updatedBy: string
  ): Promise<Issue | null> {
    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { assignees: { select: { id: true, userId: true } } },
    });

    if (!existingIssue) return null;

    const data: Record<string, unknown> = {};
    const changedFields: string[] = [];

    if (updates.title !== undefined) {
      data.title = updates.title;
      changedFields.push("title");
    }
    if (updates.body !== undefined) {
      data.body = updates.body;
      changedFields.push("body");
    }
    if (updates.status !== undefined) {
      data.status = updates.status;
      changedFields.push("status");
      if (["RESOLVED", "CLOSED"].includes(updates.status as string)) {
        data.resolvedAt = new Date();
      }
    }
    if (updates.severity !== undefined) {
      data.severity = updates.severity;
      changedFields.push("severity");
    }
    if (updates.priority !== undefined) {
      data.priority = updates.priority;
      changedFields.push("priority");
    }
    if (updates.category !== undefined) {
      data.category = updates.category;
      changedFields.push("category");
    }
    if (updates.module !== undefined) {
      data.module = updates.module;
      changedFields.push("module");
    }
    if (updates.environment !== undefined) {
      data.environment = updates.environment;
      changedFields.push("environment");
    }
    if (updates.assigneeIds !== undefined) {
      data.assigneeIds = updates.assigneeIds;
      changedFields.push("assignees");
    }
    if (updates.tagIds !== undefined) {
      data.tagIds = updates.tagIds;
      changedFields.push("tags");
    }

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data,
      include: {
        createdBy: { select: { id: true, name: true, avatar: true, role: true } },
        assignees: { select: { user: { select: { id: true } } } },
      },
    });

    // Create new version - simplified without missing fields
    await prisma.issueVersion.create({
      data: {
        issueId,
        body: issue.body,
        createdById: updatedBy,
      },
    });

    // Log activity
    await AuditService.log({
      action: "ISSUE_UPDATED",
      userId: updatedBy,
      entityType: "issue",
      entityId: issueId,
      details: `Updated fields: ${changedFields.join(", ")}`,
    });

    // Notify about status change
    if (updates.status && updates.status !== existingIssue.status) {
      const notifyUserIds = [existingIssue.createdById, ...existingIssue.assignees.map((a) => a.userId)].filter(
        (id) => id !== updatedBy
      );

      for (const userId of notifyUserIds) {
        await NotificationService.createNotification({
          userId,
          type: "ISSUE_STATUS_CHANGED",
          title: "Issue Status Changed",
          body: `Issue "${issue.title}" status changed to ${updates.status}`,
          data: { issueId, issueTitle: issue.title, actorId: updatedBy, newStatus: updates.status },
        });
      }
    }

    return this.formatIssue(issue);
  }

  /**
   * Delete an issue
   */
  static async deleteIssue(issueId: string, deletedBy: string): Promise<boolean> {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) return false;

    await prisma.issue.delete({ where: { id: issueId } });
    
    await AuditService.log({
      action: "ISSUE_DELETED",
      userId: deletedBy,
      entityType: "issue",
      entityId: issueId,
      details: `Issue "${issue.title}" deleted`,
    });

    return true;
  }

  /**
   * Bulk action on issues
   */
  static async bulkAction(action: BulkIssueAction, performedBy: string): Promise<{ success: boolean; count: number }> {
    const { issueIds, action: actionType, payload } = action;

    switch (actionType) {
      case "assign":
        if (!payload?.assigneeIds) return { success: false, count: 0 };
        for (const issueId of issueIds) {
          await prisma.issueAssignment.deleteMany({ where: { issueId } });
          await prisma.issueAssignment.createMany({
            data: payload.assigneeIds.map((userId: string) => ({ issueId, userId })),
          });
        }
        break;

      case "status":
        if (!payload?.status) return { success: false, count: 0 };
        await prisma.issue.updateMany({
          where: { id: { in: issueIds } },
          data: { status: payload.status as $Enums.IssueStatus },
        });
        break;

      case "delete":
        await prisma.issue.deleteMany({ where: { id: { in: issueIds } } });
        break;
    }

    await AuditService.log({
      action: "ISSUE_UPDATED",
      userId: performedBy,
      entityType: "issue",
      entityId: issueIds.join(","),
      details: `Bulk ${actionType} performed on ${issueIds.length} issues`,
    });

    return { success: true, count: issueIds.length };
  }

  /**
   * Get issue comments
   */
  static async getIssueComments(issueId: string): Promise<IssueComment[]> {
    const comments = await prisma.comment.findMany({
      where: { issueId },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return comments.map((c) => {
      const comment: IssueComment = {
        id: c.id,
        issueId: c.issueId,
        body: c.body,
        mentions: [],
        createdBy: c.authorId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        replyCount: 0,
      };
      if (c.author) {
        comment.user = {
          id: c.author.id,
          displayName: c.author.name,
          avatarUrl: c.author.avatar ?? null,
          role: c.author.role,
        };
      }
      return comment;
    });
  }

  /**
   * Get issue activity log
   */
  static async getIssueActivity(_issueId: string): Promise<IssueActivityEntry[]> {
    // Issue activity is not currently supported - return empty array
    return [];
  }

  /**
   * Get issue versions for history
   */
  static async getIssueVersions(issueId: string): Promise<Record<string, unknown>[]> {
    const versions = await prisma.issueVersion.findMany({
      where: { issueId },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return versions.map((v: Record<string, unknown>) => ({
      id: v.id,
      issueId: v.issueId,
      version: v.version,
      title: v.title,
      body: v.body,
      metadata: v.metadata as Record<string, unknown>,
      createdBy: ((v.createdBy as unknown as { name?: string | null } | null)?.name) || "Unknown",
      createdAt: v.createdAt,
    }));
  }

  /**
   * Check for duplicate issues
   */
  static async findDuplicates(title: string, body: string): Promise<IssueSummary[]> {
    const existingIssues = await prisma.issue.findMany({
      select: { id: true, title: true, body: true },
      take: 100,
    });

    const combinedText = `${title} ${body}`;
    const similarIssues = existingIssues.filter((issue) => {
      const issueText = `${issue.title} ${issue.body || ""}` as string;
      return areSimilar(combinedText, issueText);
    });

    return similarIssues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      status: "OPEN" as const,
      severity: "MEDIUM" as const,
      priority: "NORMAL" as const,
      category: "OTHER" as const,
      module: "OTHER" as const,
      reporter: { id: "", displayName: "Unknown", role: "ADMIN" },
      assigneeCount: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }



  // Helper to format issue from Prisma model
  private static formatIssue(issue: Record<string, unknown>, extras?: { commentCount?: number }): Issue {
    const tags = ((issue.tags as unknown as Array<Record<string, unknown>>) || []).map(t => {
      const tag: Tag = {
        id: t.id as string,
        name: t.name as string,
        color: t.color as string,
        createdAt: t.createdAt as Date,
      };
      if (t.description) tag.description = t.description as string;
      return tag;
    });

    const createdByUser = issue.user as unknown as { id?: string; name?: string; avatar?: string | null; role?: string } | undefined;
    const assignees = ((issue.assignees as unknown as Array<{user: {id: string, name?: string, avatar?: string | null, role?: string}}>) || []).map(a => {
      const assignee: UserSummary = {
        id: a.user.id,
        displayName: a.user.name || "",
        role: a.user.role || "",
      };
      if (a.user.avatar !== undefined) assignee.avatarUrl = a.user.avatar;
      return assignee;
    });

    return {
      id: issue.id as string,
      title: issue.title as string,
      body: issue.body as string,
      status: (issue.status as string) as IssueStatus,
      severity: (issue.severity as string) as IssueSeverity,
      priority: (issue.priority as string) as IssuePriority,
      category: (issue.category as string) as IssueCategory,
      module: (issue.module as string) as IssueModule,
      environment: (issue.environment as string) as IssueEnvironment,
      tags,
      assignees,
      reporter: createdByUser ? {
        id: createdByUser.id || "",
        displayName: createdByUser.name || "Unknown",
        role: createdByUser.role || "VIEWER",
      } : { id: "", displayName: "Unknown", role: "VIEWER" },
      linkedIssues: [],
      attachments: [],
      viewCount: 0,
      isDraft: (issue.isDraft as boolean) ?? false,
      createdAt: issue.createdAt as Date,
      updatedAt: issue.updatedAt as Date,
      ...(issue.resolvedAt ? { resolvedAt: issue.resolvedAt as Date } : {}),
      commentCount: extras?.commentCount ?? 0,
    };
  }
}
