import { z } from "zod";

// =============================================================================
// SETTINGS SCHEMAS — LLC-Lanka Issue Tracker Platform
// =============================================================================

export const categoryDefinitionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
  isDefault: z.boolean().optional().default(false),
});

export const moduleDefinitionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, "Module name is required")
    .max(100, "Module name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
  isDefault: z.boolean().optional().default(false),
});

export const tagDefinitionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must not exceed 50 characters")
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code (e.g. #FF5733)")
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
});

export const smtpConfigSchema = z.object({
  host: z
    .string()
    .min(1, "SMTP host is required")
    .max(255, "Host must not exceed 255 characters"),
  port: z
    .number()
    .int()
    .min(1)
    .max(65535, "Port must be between 1 and 65535"),
  secure: z.boolean().optional().default(true),
  authUser: z
    .string()
    .max(255)
    .optional()
    .nullable(),
  authPass: z
    .string()
    .max(255)
    .optional()
    .nullable(),
  fromAddress: z
    .string()
    .email("From address must be a valid email")
    .max(255),
  fromName: z
    .string()
    .min(1, "From name is required")
    .max(255, "From name must not exceed 255 characters"),
});

export const updateSystemSettingsSchema = z.object({
  categories: z.array(categoryDefinitionSchema).optional(),
  modules: z.array(moduleDefinitionSchema).optional(),
  tags: z.array(tagDefinitionSchema).optional(),
  smtpConfig: smtpConfigSchema.optional(),
  sessionTimeoutMinutes: z
    .number()
    .int()
    .min(5, "Session timeout must be at least 5 minutes")
    .max(1440, "Session timeout must not exceed 1440 minutes (24 hours)")
    .optional(),
  maxUploadSizeMb: z
    .number()
    .int()
    .min(1, "Max upload size must be at least 1 MB")
    .max(100, "Max upload size must not exceed 100 MB")
    .optional(),
  maintenanceMode: z.boolean().optional(),
});

export const searchSettingsSchema = z.object({
  query: z.string().min(1, "Search query is required").max(255),
  types: z
    .array(z.enum(["issue", "comment", "user", "message", "channel"]))
    .optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  userId: z.string().uuid().optional(),
});

export const auditLogFiltersSchema = z.object({
  action: z.array(z.string()).optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(50),
  sortBy: z.enum(["createdAt", "action"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Type exports
export type CategoryDefinitionInput = z.infer<typeof categoryDefinitionSchema>;
export type ModuleDefinitionInput = z.infer<typeof moduleDefinitionSchema>;
export type TagDefinitionInput = z.infer<typeof tagDefinitionSchema>;
export type SmtpConfigInput = z.infer<typeof smtpConfigSchema>;
export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
export type SearchSettingsInput = z.infer<typeof searchSettingsSchema>;
export type AuditLogFiltersInput = z.infer<typeof auditLogFiltersSchema>;
