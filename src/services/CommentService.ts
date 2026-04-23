import { prisma } from "@/lib/db/prisma";
import { AuditService } from "./AuditService";
import { NotificationService } from "./NotificationService";
import type { IssueComment, CreateCommentInput, UpdateCommentInput } from "@/types/issue.types";

// =============================================================================
// COMMENT SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class CommentService {
  /**
   * Create a new comment on an issue
   */
  static async createComment(
    issueId: string,
    data: CreateCommentInput,
    userId: string
  ): Promise<IssueComment> {
    const comment = await prisma.comment.create({
      data: {
        issueId,
        body: data.body,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Log activity
    await AuditService.log({
      action: "COMMENT_CREATED",
      userId,
      entityType: "comment",
      entityId: comment.id,
      metadata: { issueId },
      details: "Comment added to issue",
    });

    // Get issue to notify creator and assignees
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { title: true, createdById: true, assignees: { select: { userId: true } } },
    });

    if (issue) {
      const notifyUserIds = [issue.createdById, ...issue.assignees.map((a) => a.userId)].filter(
        (id) => id !== userId
      );

      for (const userIdToNotify of notifyUserIds) {
        await NotificationService.createNotification({
          userId: userIdToNotify,
          type: "COMMENT_ADDED",
          title: "New Comment",
          body: `New comment on issue "${issue.title}"`,
          data: { issueId, commentId: comment.id, actorId: userId },
        });
      }
    }

    // Handle any additional logic that relies on issue title
    if (data.body && data.body.length > 0) {
      // Reserved for future logic
    }

    const result: IssueComment = {
      id: comment.id,
      issueId: comment.issueId,
      body: comment.body,
      createdBy: comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      mentions: [],
      replyCount: 0,
    };
    if (comment.author) {
      result.user = {
        id: comment.author.id,
        displayName: comment.author.name,
        role: comment.author.role,
      };
    }
    return result;
  }

  /**
   * Update a comment
   */
  static async updateComment(
    commentId: string,
    data: UpdateCommentInput,
    userId: string
  ): Promise<IssueComment | null> {
    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existing) return null;

    // Only author can edit their own comment
    if (existing.authorId !== userId) return null;

    const updateData: Record<string, unknown> = {};
    if (data.body !== undefined) updateData.body = data.body;

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    await AuditService.log({
      action: "COMMENT_UPDATED",
      userId,
      entityType: "comment",
      entityId: commentId,
      details: "Comment edited",
    });

    const result: IssueComment = {
      id: comment.id,
      issueId: comment.issueId,
      body: comment.body,
      createdBy: comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      mentions: [],
      replyCount: 0,
    };
    if (comment.author) {
      result.user = {
        id: comment.author.id,
        displayName: comment.author.name,
        role: comment.author.role,
      };
    }
    return result;
  }

  /**
   * Delete a comment
   */
  static async deleteComment(
    commentId: string,
    userId: string,
    isSuperAdmin: boolean
  ): Promise<boolean> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) return false;

    // Only author or super admin can delete
    if (comment.authorId !== userId && !isSuperAdmin) return false;

    await prisma.$transaction(async (tx) => {
      await tx.comment.delete({ where: { id: commentId } });
      return AuditService.log({
        action: "COMMENT_DELETED",
        userId,
        entityType: "comment",
        entityId: commentId,
        metadata: { issueId: comment.issueId },
        details: "Comment deleted",
      });
    });

    return true;
  }

  /**
   * Get comment by ID
   */
  static async getCommentById(commentId: string): Promise<IssueComment | null> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    if (!comment) return null;

    const result: IssueComment = {
      id: comment.id,
      issueId: comment.issueId,
      body: comment.body,
      createdBy: comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      mentions: [],
      replyCount: 0,
    };
    if (comment.author) {
      result.user = {
        id: comment.author.id,
        displayName: comment.author.name,
        role: comment.author.role,
      };
    }
    return result;
  }

  /**
   * Get replies to a comment
   */
  static async getCommentReplies(parentId: string): Promise<IssueComment[]> {
    const replies = await prisma.comment.findMany({
      where: { id: parentId },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return replies.map((r) => {
      const result: IssueComment = {
        id: r.id,
        issueId: r.issueId,
        body: r.body,
        createdBy: r.authorId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        mentions: [],
        replyCount: 0,
      };
      if (r.author) {
        result.user = {
          id: r.author.id,
          displayName: r.author.name,
          role: r.author.role,
        };
      }
      return result;
    });
  }
}
