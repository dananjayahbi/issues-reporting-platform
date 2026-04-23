import { prisma } from "@/lib/db/prisma";
import { AuditService } from "./AuditService";
import { NotificationService } from "./NotificationService";
import { POLL_TYPES as _POLL_TYPES } from "@/lib/utils/constants";
import type { PollType } from "@/lib/utils/constants";
import type {
  Poll,
  PollOption,
  CreatePollPayload,
  UpdatePollPayload,
  VotePollPayload,
  PollListResponse,
  PollSummary,
} from "@/types/poll.types";

// =============================================================================
// POLL SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class PollService {
  /**
   * Create a new poll
   */
  static async createPoll(data: CreatePollPayload, createdBy: string): Promise<Poll> {
    const poll = await prisma.poll.create({
      data: {
        title: data.title,
        question: data.question,
        type: data.pollType ?? "single",
        anonymous: data.isAnonymous ?? false,
        allowChange: data.allowChangeVote ?? true,
        minParticipation: data.minParticipation ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        createdById: createdBy,
        issueId: data.issueId ?? null,
        channelId: data.channelId ?? null,
        options: {
          create: data.options.map((text) => ({
            text,
          })),
        },
      },
      include: {
        options: true,
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });

    await AuditService.log({
      action: "POLL_CREATED",
      userId: createdBy,
      entityType: "poll",
      entityId: poll.id,
      details: `Poll "${poll.question}" created`,
    });

    // Notify about poll creation if attached to issue
    if (data.issueId) {
      const issue = await prisma.issue.findUnique({
        where: { id: data.issueId },
        select: { title: true, createdById: true, assignees: { select: { userId: true } } },
      });

      if (issue) {
        const notifyUserIds = [issue.createdById, ...issue.assignees.map((a) => a.userId)].filter(
          (id) => id !== createdBy
        );

        for (const userId of notifyUserIds) {
          await NotificationService.createNotification({
            userId,
            type: "POLL_CREATED",
            title: "New Poll",
            body: `A poll was created on issue "${issue.title}"`,
            data: { issueId: data.issueId, pollId: poll.id, actorId: createdBy },
          });
        }
      }
    }

    return this.formatPoll(poll);
  }

  /**
   * Get poll by ID
   */
  static async getPollById(pollId: string, userId?: string): Promise<Poll | null> {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
        votes: true,
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!poll) return null;

    return this.formatPoll(poll, userId);
  }

  /**
   * List polls
   */
  static async listPolls(params: {
    status?: "active" | "expired" | "closed" | "all";
    issueId?: string;
    channelId?: string;
    createdBy?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<PollListResponse> {
    const {
      status = "active",
      issueId,
      channelId,
      createdBy,
      page = 1,
      pageSize = 20,
      sortBy = "createdAt",
      sortDir = "desc",
    } = params;

    const where: Record<string, unknown> = {};

    if (status === "active") {
      where.closedAt = null;
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    } else if (status === "expired") {
      where.expiresAt = { lt: new Date() };
      where.closedAt = null;
    } else if (status === "closed") {
      where.closedAt = { not: null };
    }

    if (issueId) where.issueId = issueId;
    if (channelId) where.channelId = channelId;
    if (createdBy) where.createdById = createdBy;

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where,
        include: {
          options: true,
          createdBy: { select: { id: true, name: true } },
          _count: { select: { votes: true } },
        },
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.poll.count({ where }),
    ]);

    return {
      polls: polls.map((p) => {
        const summary: PollSummary = {
          id: p.id,
          title: p.title,
          question: p.question,
          pollType: p.type as PollType,
          totalVotes: p._count.votes,
          voterCount: p._count.votes,
          hasVoted: false,
          isExpired: !!p.expiresAt && p.expiresAt < new Date(),
          createdBy: p.createdById,
          createdAt: p.createdAt,
        };
        if (p.expiresAt) summary.expiresAt = p.expiresAt;
        if (p.createdBy) {
          summary.creator = {
            id: p.createdBy.id,
            displayName: p.createdBy.name,
          };
        }
        return summary;
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Update a poll
   */
  static async updatePoll(
    pollId: string,
    data: UpdatePollPayload,
    updatedBy: string
  ): Promise<Poll | null> {
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) return null;

    // Only creator can update
    if (poll.createdById !== updatedBy) return null;

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.question !== undefined) updateData.question = data.question;
    if (data.isAnonymous !== undefined) updateData.anonymous = data.isAnonymous;
    if (data.allowChangeVote !== undefined) updateData.allowChange = data.allowChangeVote;
    if (data.minParticipation !== undefined) updateData.minParticipation = data.minParticipation;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    const updated = await prisma.poll.update({
      where: { id: pollId },
      data: updateData,
      include: {
        options: true,
        votes: true,
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });

    return this.formatPoll(updated);
  }

  /**
   * Vote on a poll
   */
  static async votePoll(
    pollId: string,
    data: VotePollPayload,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) return { success: false, error: "Poll not found" };
    if (poll.closedAt) return { success: false, error: "Poll is closed" };
    if (poll.expiresAt && poll.expiresAt < new Date()) {
      return { success: false, error: "Poll has expired" };
    }

    // Validate option IDs
    const validOptionIds = poll.options.map((o) => o.id);
    const invalidOptions = data.optionIds.filter((id) => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) {
      return { success: false, error: "Invalid option IDs" };
    }

    // Check if already voted
    const existingVote = await prisma.pollVote.findFirst({
      where: { pollId, userId },
    });

    if (existingVote && !poll.allowChange) {
      return { success: false, error: "Vote change is not allowed" };
    }

    // Remove existing vote if changing
    if (existingVote) {
      await prisma.pollVote.deleteMany({ where: { pollId, userId } });
    }

    // Create new vote(s)
    await prisma.pollVote.createMany({
      data: data.optionIds.map((optionId) => ({
        pollId,
        optionId,
        userId,
      })),
    });

    await AuditService.log({
      action: "POLL_VOTED",
      userId,
      entityType: "poll",
      entityId: pollId,
      details: "User voted on poll",
    });

    // Check if poll should close due to min participation
    if (poll.minParticipation) {
      const voteCount = await prisma.pollVote.count({ where: { pollId } });
      if (voteCount >= poll.minParticipation) {
        await prisma.poll.update({
          where: { id: pollId },
          data: { closedAt: new Date() },
        });

        await AuditService.log({
          action: "POLL_CLOSED",
          userId: userId,
          entityType: "poll",
          entityId: pollId,
          details: `Poll closed automatically due to minimum participation (${voteCount} votes)`,
        });
      }
    }

    return { success: true };
  }

  /**
   * Close a poll
   */
  static async closePoll(
    pollId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) return { success: false, error: "Poll not found" };

    // Only creator or super admin can close
    if (poll.createdById !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== "SUPER_ADMIN") {
        return { success: false, error: "Only the poll creator can close this poll" };
      }
    }

    await prisma.poll.update({
      where: { id: pollId },
      data: { closedAt: new Date() },
    });

    await AuditService.log({
      action: "POLL_CLOSED",
      userId,
      entityType: "poll",
      entityId: pollId,
      details: "Poll closed by creator",
    });

    return { success: true };
  }

  /**
   * Delete a poll
   */
  static async deletePoll(
    pollId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) return { success: false, error: "Poll not found" };

    if (poll.createdById !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== "SUPER_ADMIN") {
        return { success: false, error: "Only the poll creator can delete this poll" };
      }
    }

    await prisma.$transaction([
      prisma.poll.delete({ where: { id: pollId } }),
      prisma.pollVote.deleteMany({ where: { pollId } }),
    ]);

    return { success: true };
  }

  // Helper to format poll
  private static formatPoll(poll: Record<string, unknown>, userId?: string): Poll {
    const options = (poll.options as Array<Record<string, unknown>>) || [];
    const votes = (poll.votes as Array<Record<string, unknown>>) || [];
    const createdBy = poll.createdBy as Record<string, unknown> | undefined;
    const totalVotes = votes.length;

    const formattedOptions: PollOption[] = options.map((option) => {
      const optionVotes = votes.filter((v) => (v.optionId as string) === option.id);
      const opt: PollOption = {
        id: option.id as string,
        label: (option.text || option.label) as string,
        voteCount: optionVotes.length,
        percentage: totalVotes > 0 ? (optionVotes.length / totalVotes) * 100 : 0,
        voters: optionVotes.slice(0, 5).map((v) => ({
          id: v.userId as string,
          displayName: "",
          avatar: null,
          votedAt: v.createdAt as Date,
        })),
      };
      if (option.description) opt.description = option.description as string;
      return opt;
    });

    const userVotes = userId
      ? votes.filter((v) => (v.userId as string) === userId).map((v) => v.optionId as string)
      : [];

    const result: Poll = {
      id: poll.id as string,
      title: poll.title as string,
      question: poll.question as string,
      pollType: poll.type as PollType,
      options: formattedOptions,
      isAnonymous: poll.anonymous as boolean,
      allowChangeVote: poll.allowChange as boolean,
      minParticipation: typeof poll.minParticipation === 'number' ? poll.minParticipation : 0,
      ...(poll.expiresAt ? { expiresAt: poll.expiresAt as Date } : {}),
      createdBy: poll.createdById as string,
      totalVotes,
      voterCount: totalVotes,
      hasVoted: userVotes.length > 0,
      userVote: userVotes,
      createdAt: poll.createdAt as Date,
      updatedAt: poll.updatedAt as Date,
    };

    if (createdBy) {
      result.creator = {
        id: createdBy.id as string,
        displayName: createdBy.name as string,
        avatarUrl: (createdBy.avatar ?? null) as string | null,
      };
    }

    if (poll.closedAt) {
      result.closedAt = poll.closedAt as Date;
    }

    if (poll.issueId) {
      result.issueId = poll.issueId as string;
    }

    if (poll.channelId) {
      result.channelId = poll.channelId as string;
    }

    return result;
  }
}
