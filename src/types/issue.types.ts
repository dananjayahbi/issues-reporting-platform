import type {
  IssueSeverity,
  IssuePriority,
  IssueStatus,
  IssueCategory,
  IssueModule,
  IssueEnvironment,
} from "@/lib/utils/constants";

// =============================================================================
// ISSUE TYPES — LLC-Lanka Issue Tracker Platform
// =============================================================================

export interface UserSummary {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  role: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
}

export interface IssueLink {
  id: string;
  sourceIssueId: string;
  targetIssueId: string;
  linkType: IssueLinkType;
  createdAt: Date;
  createdBy: string;
}

export type IssueLinkType =
  | "PARENT"
  | "CHILD"
  | "BLOCKS"
  | "BLOCKED_BY"
  | "DUPLICATES_OF"
  | "RELATES_TO";

export interface IssueAttachment {
  id: string;
  issueId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  isAnnotated: boolean;
  annotatedFromId?: string;
}

export interface IssueVersion {
  id: string;
  issueId: string;
  version: number;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
}

export interface IssueActivityEntry {
  id: string;
  issueId: string;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
  userId: string;
  user?: UserSummary;
  createdAt: Date;
}

export interface IssuePoll {
  id: string;
  issueId: string;
  question: string;
  pollType: string;
  options: PollOption[];
  isAnonymous: boolean;
  allowChangeVote: boolean;
  expiresAt?: Date;
  closedAt?: Date;
  createdBy: string;
  createdAt: Date;
  voteCount: number;
  userVote?: string[];
}

export interface PollOption {
  id: string;
  label: string;
  voteCount: number;
  percentage: number;
}

export interface IssueComment {
  id: string;
  issueId: string;
  body: string;
  parentId?: string;
  mentions: string[];
  editedAt?: Date;
  createdBy: string;
  user?: UserSummary;
  createdAt: Date;
  updatedAt: Date;
  replyCount: number;
}

export interface Issue {
  id: string;
  title: string;
  body: string;
  status: IssueStatus;
  severity: IssueSeverity;
  priority: IssuePriority;
  category: IssueCategory;
  module: IssueModule;
  environment: IssueEnvironment;
  tags: Tag[];
  assignees: UserSummary[];
  reporter: UserSummary;
  linkedIssues: IssueLink[];
  attachments: IssueAttachment[];
  poll?: IssuePoll;
  commentCount: number;
  viewCount: number;
  isDraft: boolean;
  similarityScore?: number;
  similarIssues?: IssueSummary[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

export interface IssueSummary {
  id: string;
  title: string;
  status: IssueStatus;
  severity: IssueSeverity;
  priority: IssuePriority;
  category: IssueCategory;
  module: IssueModule;
  reporter: UserSummary;
  assigneeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueFilters {
  status?: IssueStatus[];
  severity?: IssueSeverity[];
  priority?: IssuePriority[];
  category?: IssueCategory[];
  module?: IssueModule[];
  environment?: IssueEnvironment[];
  assigneeIds?: string[];
  reporterId?: string;
  tagIds?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  hasPoll?: boolean;
  hasUnresolvedComments?: boolean;
}

export interface IssueSortOptions {
  field: "createdAt" | "updatedAt" | "severity" | "priority" | "status";
  direction: "asc" | "desc";
}

export interface CreateIssuePayload {
  title: string;
  body: string;
  severity: IssueSeverity;
  priority: IssuePriority;
  category: IssueCategory;
  module: IssueModule;
  environment: IssueEnvironment;
  assigneeIds?: string[];
  tagIds?: string[];
  isDraft?: boolean;
}

export interface UpdateIssuePayload {
  title?: string;
  body?: string;
  status?: IssueStatus;
  severity?: IssueSeverity;
  priority?: IssuePriority;
  category?: IssueCategory;
  module?: IssueModule;
  environment?: IssueEnvironment;
  assigneeIds?: string[];
  tagIds?: string[];
}

export interface IssueListResponse {
  items: IssueSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IssueDetailResponse {
  issue: Issue;
  comments: IssueComment[];
  activity: IssueActivityEntry[];
}

export interface BulkIssueAction {
  issueIds: string[];
  action: "assign" | "status" | "delete";
  payload?: {
    assigneeIds?: string[];
    status?: IssueStatus;
  };
}

export interface IssueTemplate {
  id: string;
  name: string;
  category: IssueCategory;
  titleTemplate: string;
  bodyTemplate: string;
  defaultSeverity: IssueSeverity;
  defaultPriority: IssuePriority;
}

export interface CreateCommentInput {
  body: string;
  mentions?: string[];
  parentId?: string;
}

export interface UpdateCommentInput {
  body?: string;
  mentions?: string[];
}
