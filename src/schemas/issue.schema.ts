import { z } from "zod";
import {
  ISSUE_SEVERITIES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  ISSUE_CATEGORIES,
  ISSUE_MODULES,
  ISSUE_ENVIRONMENTS,
} from "@/lib/utils/constants";

// =============================================================================
// ISSUE SCHEMAS — LLC-Lanka Issue Tracker Platform
// =============================================================================

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must not exceed 255 characters")
    .trim(),
  body: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  severity: z.enum([
    ISSUE_SEVERITIES.CRITICAL,
    ISSUE_SEVERITIES.HIGH,
    ISSUE_SEVERITIES.MEDIUM,
    ISSUE_SEVERITIES.LOW,
    ISSUE_SEVERITIES.INFO,
  ]),
  priority: z.enum([
    ISSUE_PRIORITIES.URGENT,
    ISSUE_PRIORITIES.HIGH,
    ISSUE_PRIORITIES.NORMAL,
    ISSUE_PRIORITIES.LOW,
  ]),
  category: z.enum([
    ISSUE_CATEGORIES.UI,
    ISSUE_CATEGORIES.LOGIC,
    ISSUE_CATEGORIES.PERFORMANCE,
    ISSUE_CATEGORIES.SECURITY,
    ISSUE_CATEGORIES.DATA,
    ISSUE_CATEGORIES.INTEGRATION,
    ISSUE_CATEGORIES.DOCUMENTATION,
    ISSUE_CATEGORIES.OTHER,
  ]),
  module: z.enum([
    ISSUE_MODULES.POS,
    ISSUE_MODULES.INVENTORY,
    ISSUE_MODULES.ACCOUNTS,
    ISSUE_MODULES.HRM,
    ISSUE_MODULES.CRM,
    ISSUE_MODULES.REPORTING,
    ISSUE_MODULES.ECOMMERCE,
    ISSUE_MODULES.ADMIN,
    ISSUE_MODULES.SETTINGS,
    ISSUE_MODULES.MOBILE,
    ISSUE_MODULES.API,
    ISSUE_MODULES.OTHER,
  ]),
  environment: z.enum([
    ISSUE_ENVIRONMENTS.PRODUCTION,
    ISSUE_ENVIRONMENTS.STAGING,
    ISSUE_ENVIRONMENTS.DEVELOPMENT,
    ISSUE_ENVIRONMENTS.TESTING,
    ISSUE_ENVIRONMENTS.DEMO,
  ]),
  assigneeIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  isDraft: z.boolean().optional().default(false),
});

export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must not exceed 255 characters")
    .trim()
    .optional(),
  body: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  status: z.enum([
    ISSUE_STATUSES.OPEN,
    ISSUE_STATUSES.IN_PROGRESS,
    ISSUE_STATUSES.NEEDS_REVIEW,
    ISSUE_STATUSES.RESOLVED,
    ISSUE_STATUSES.CLOSED,
    ISSUE_STATUSES.DUPLICATE,
    ISSUE_STATUSES.WONT_FIX,
  ]).optional(),
  severity: z.enum([
    ISSUE_SEVERITIES.CRITICAL,
    ISSUE_SEVERITIES.HIGH,
    ISSUE_SEVERITIES.MEDIUM,
    ISSUE_SEVERITIES.LOW,
    ISSUE_SEVERITIES.INFO,
  ]).optional(),
  priority: z.enum([
    ISSUE_PRIORITIES.URGENT,
    ISSUE_PRIORITIES.HIGH,
    ISSUE_PRIORITIES.NORMAL,
    ISSUE_PRIORITIES.LOW,
  ]).optional(),
  category: z.enum([
    ISSUE_CATEGORIES.UI,
    ISSUE_CATEGORIES.LOGIC,
    ISSUE_CATEGORIES.PERFORMANCE,
    ISSUE_CATEGORIES.SECURITY,
    ISSUE_CATEGORIES.DATA,
    ISSUE_CATEGORIES.INTEGRATION,
    ISSUE_CATEGORIES.DOCUMENTATION,
    ISSUE_CATEGORIES.OTHER,
  ]).optional(),
  module: z.enum([
    ISSUE_MODULES.POS,
    ISSUE_MODULES.INVENTORY,
    ISSUE_MODULES.ACCOUNTS,
    ISSUE_MODULES.HRM,
    ISSUE_MODULES.CRM,
    ISSUE_MODULES.REPORTING,
    ISSUE_MODULES.ECOMMERCE,
    ISSUE_MODULES.ADMIN,
    ISSUE_MODULES.SETTINGS,
    ISSUE_MODULES.MOBILE,
    ISSUE_MODULES.API,
    ISSUE_MODULES.OTHER,
  ]).optional(),
  environment: z.enum([
    ISSUE_ENVIRONMENTS.PRODUCTION,
    ISSUE_ENVIRONMENTS.STAGING,
    ISSUE_ENVIRONMENTS.DEVELOPMENT,
    ISSUE_ENVIRONMENTS.TESTING,
    ISSUE_ENVIRONMENTS.DEMO,
  ]).optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const issueFiltersSchema = z.object({
  status: z.array(z.string()).optional(),
  severity: z.array(z.string()).optional(),
  priority: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  module: z.array(z.string()).optional(),
  environment: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
  reporterId: z.string().uuid().optional(),
  tagIds: z.array(z.string()).optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  hasAttachments: z.boolean().optional(),
  hasPoll: z.boolean().optional(),
  hasUnresolvedComments: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["createdAt", "updatedAt", "severity", "priority", "status"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const issueLinkSchema = z.object({
  targetIssueId: z.string().uuid("Target issue ID must be a valid UUID"),
  linkType: z.enum(["PARENT", "CHILD", "BLOCKS", "BLOCKED_BY", "DUPLICATES_OF", "RELATES_TO"]),
});

export const bulkIssueActionSchema = z.object({
  issueIds: z.array(z.string().uuid()).min(1, "At least one issue must be selected"),
  action: z.enum(["assign", "status", "delete"]),
  payload: z
    .object({
      assigneeIds: z.array(z.string().uuid()).optional(),
      status: z.enum([
        ISSUE_STATUSES.OPEN,
        ISSUE_STATUSES.IN_PROGRESS,
        ISSUE_STATUSES.NEEDS_REVIEW,
        ISSUE_STATUSES.RESOLVED,
        ISSUE_STATUSES.CLOSED,
        ISSUE_STATUSES.DUPLICATE,
        ISSUE_STATUSES.WONT_FIX,
      ]).optional(),
    })
    .optional(),
});

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(10000, "Comment must not exceed 10000 characters"),
  parentId: z.string().uuid().optional(),
  mentions: z.array(z.string()).optional(),
});

export const updateCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(10000, "Comment must not exceed 10000 characters"),
});

export const issueSearchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(255),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
});

// Type exports
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type IssueFiltersInput = z.infer<typeof issueFiltersSchema>;
export type IssueLinkInput = z.infer<typeof issueLinkSchema>;
export type BulkIssueActionInput = z.infer<typeof bulkIssueActionSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type IssueSearchInput = z.infer<typeof issueSearchSchema>;
