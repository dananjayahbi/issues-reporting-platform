import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

interface SearchOptions {
  query: string;
  types?: ("issue" | "comment" | "user" | "message" | "channel")[];
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

interface SearchResult {
  type: "issue" | "comment" | "user" | "message" | "channel";
  id: string;
  title: string;
  excerpt: string;
  highlight: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export class SearchService {
  /**
   * Perform a global search across all entity types
   */
  static async search(options: SearchOptions): Promise<SearchResult[]> {
    const {
      query,
      types,
      page = 1,
      pageSize = 20,
      dateFrom,
      dateTo,
      userId,
    } = options;

    const results: SearchResult[] = [];
    const searchQuery = `%${query}%`;
    const dateFromFilter = dateFrom ? new Date(dateFrom) : null;
    const dateToFilter = dateTo ? new Date(dateTo) : null;

    // Search issues
    if (!types || types.includes("issue")) {
      const issues = await this.searchIssues(searchQuery, dateFromFilter, dateToFilter, userId);
      results.push(...issues);
    }

    // Search users
    if (!types || types.includes("user")) {
      const users = await this.searchUsers(searchQuery);
      results.push(...users);
    }

    // Search channels
    if (!types || types.includes("channel")) {
      const channels = await this.searchChannels(searchQuery);
      results.push(...channels);
    }

    // Search messages
    if (!types || types.includes("message")) {
      const messages = await this.searchMessages(searchQuery, dateFromFilter, dateToFilter, userId);
      results.push(...messages);
    }

    // Search comments
    if (!types || types.includes("comment")) {
      const comments = await this.searchComments(searchQuery, dateFromFilter, dateToFilter, userId);
      results.push(...comments);
    }

    // Sort by relevance (simple scoring based on match count)
    results.sort((a, b) => {
      const scoreA = (a.highlight.match(new RegExp(query, "gi")) || []).length;
      const scoreB = (b.highlight.match(new RegExp(query, "gi")) || []).length;
      return scoreB - scoreA;
    });

    // Paginate
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }

  /**
   * Search issues by title and body
   */
  private static async searchIssues(
    query: string,
    dateFrom: Date | null,
    dateTo: Date | null,
    _userId?: string
  ): Promise<SearchResult[]> {
    const where: Prisma.IssueWhereInput = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    };

    if (dateFrom) {
      where.createdAt = { ...where.createdAt as object, gte: dateFrom };
    }
    if (dateTo) {
      where.createdAt = { ...where.createdAt as object, lte: dateTo };
    }

    const issues = await prisma.issue.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        status: true,
        severity: true,
        createdAt: true,
      },
    });

    return issues.map((issue) => ({
      type: "issue" as const,
      id: issue.id,
      title: issue.title,
      excerpt: issue.body.substring(0, 150) + (issue.body.length > 150 ? "..." : ""),
      highlight: this.highlightText(issue.body, query.replace(/%/g, "")),
      url: `/issues/${issue.id}`,
      metadata: {
        status: issue.status,
        severity: issue.severity,
        createdAt: issue.createdAt,
      },
    }));
  }

  /**
   * Search users by name and email
   */
  private static async searchUsers(query: string): Promise<SearchResult[]> {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    return users.map((user) => ({
      type: "user" as const,
      id: user.id,
      title: user.name,
      excerpt: user.email,
      highlight: this.highlightText(user.email, query.replace(/%/g, "")),
      url: `/profile/${user.id}`,
      metadata: {
        role: user.role,
        avatar: user.avatar,
      },
    }));
  }

  /**
   * Search channels by name and description
   */
  private static async searchChannels(query: string): Promise<SearchResult[]> {
    const channels = await prisma.channel.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
      },
    });

    return channels.map((channel) => ({
      type: "channel" as const,
      id: channel.id,
      title: channel.name,
      excerpt: "Channel",
      highlight: this.highlightText(channel.name, query.replace(/%/g, "")),
      url: `/chat/${channel.id}`,
      metadata: {
        type: channel.type,
        createdAt: channel.createdAt,
      },
    }));
  }

  /**
   * Search messages by body content
   */
  private static async searchMessages(
    query: string,
    dateFrom: Date | null,
    dateTo: Date | null,
    _userId?: string
  ): Promise<SearchResult[]> {
    const where: Prisma.MessageWhereInput = {
      body: { contains: query, mode: "insensitive" },
    };

    if (dateFrom) {
      where.createdAt = { ...where.createdAt as object, gte: dateFrom };
    }
    if (dateTo) {
      where.createdAt = { ...where.createdAt as object, lte: dateTo };
    }

    const messages = await prisma.message.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        body: true,
        channelId: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    });

    return messages.map((message) => ({
      type: "message" as const,
      id: message.id,
      title: `Message by ${message.author.name}`,
      excerpt: message.body.substring(0, 150) + (message.body.length > 150 ? "..." : ""),
      highlight: this.highlightText(message.body, query.replace(/%/g, "")),
      url: `/chat/${message.channelId}?message=${message.id}`,
      metadata: {
        channelId: message.channelId,
        createdAt: message.createdAt,
      },
    }));
  }

  /**
   * Search comments by body content
   */
  private static async searchComments(
    query: string,
    dateFrom: Date | null,
    dateTo: Date | null,
    _userId?: string
  ): Promise<SearchResult[]> {
    const where: Prisma.CommentWhereInput = {
      body: { contains: query, mode: "insensitive" },
    };

    if (dateFrom) {
      where.createdAt = { ...where.createdAt as object, gte: dateFrom };
    }
    if (dateTo) {
      where.createdAt = { ...where.createdAt as object, lte: dateTo };
    }

    const comments = await prisma.comment.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        body: true,
        issueId: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    });

    return comments.map((comment) => ({
      type: "comment" as const,
      id: comment.id,
      title: `Comment by ${comment.author.name}`,
      excerpt: comment.body.substring(0, 150) + (comment.body.length > 150 ? "..." : ""),
      highlight: this.highlightText(comment.body, query.replace(/%/g, "")),
      url: `/issues/${comment.issueId}?comment=${comment.id}`,
      metadata: {
        issueId: comment.issueId,
        createdAt: comment.createdAt,
      },
    }));
  }

  /**
   * Highlight search terms in text
   */
  private static highlightText(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }
}

export default SearchService;
