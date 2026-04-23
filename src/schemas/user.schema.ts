import { z } from "zod";
import { USER_ROLES } from "@/lib/utils/constants";

// =============================================================================
// USER SCHEMAS — LLC-Lanka Issue Tracker Platform
// =============================================================================

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name must not exceed 100 characters")
    .trim()
    .optional(),
  avatarUrl: z.string().url().optional().nullable(),
  phone: z
    .string()
    .max(20, "Phone number must not exceed 20 characters")
    .optional()
    .nullable(),
  department: z
    .string()
    .max(100, "Department must not exceed 100 characters")
    .trim()
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .trim()
    .optional()
    .nullable(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.VIEWER], {
    errorMap: () => ({ message: "Role must be either Admin or Viewer" }),
  }),
});

export const deactivateUserSchema = z.object({
  reason: z
    .string()
    .max(500, "Reason must not exceed 500 characters")
    .trim()
    .optional(),
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VIEWER]).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["displayName", "email", "createdAt", "lastLoginAt"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const updateNotificationPreferencesSchema = z.object({
  issueAssigned: z.boolean().optional(),
  issueStatusChanged: z.boolean().optional(),
  commentAdded: z.boolean().optional(),
  chatReply: z.boolean().optional(),
  pollCreated: z.boolean().optional(),
  pollExpiring: z.boolean().optional(),
  newIssueInModule: z.boolean().optional(),
  mention: z.boolean().optional(),
});

export const updateUserSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  editorAutosaveInterval: z.number().int().positive().optional(),
  editorDefaultView: z.enum(["split", "edit", "preview"]).optional(),
  notificationEmailDigest: z.enum(["none", "daily", "weekly"]).optional(),
});

export const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

// Type exports
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type DeactivateUserInput = z.infer<typeof deactivateUserSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>;
