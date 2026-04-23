import { z } from "zod";
import { POLL_TYPES } from "@/lib/utils/constants";

// =============================================================================
// POLL SCHEMAS — LLC-Lanka Issue Tracker Platform
// =============================================================================

export const createPollSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),
  question: z
    .string()
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question must not exceed 500 characters")
    .trim(),
  pollType: z.enum([
    POLL_TYPES.SINGLE_CHOICE,
    POLL_TYPES.MULTIPLE_CHOICE,
    POLL_TYPES.RATING,
    POLL_TYPES.YES_NO,
  ]),
  options: z
    .array(
      z
        .string()
        .min(1, "Option cannot be empty")
        .max(200, "Option must not exceed 200 characters")
        .trim()
    )
    .min(2, "At least 2 options are required")
    .max(20, "Maximum 20 options allowed"),
  isAnonymous: z.boolean().optional().default(false),
  allowChangeVote: z.boolean().optional().default(true),
  minParticipation: z
    .number()
    .int()
    .positive("Minimum participation must be a positive number")
    .optional(),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return new Date(val) > new Date();
      },
      { message: "Expiration date must be in the future" }
    ),
  issueId: z.string().uuid().optional(),
  channelId: z.string().uuid().optional(),
});

export const updatePollSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim()
    .optional(),
  question: z
    .string()
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question must not exceed 500 characters")
    .trim()
    .optional(),
  isAnonymous: z.boolean().optional(),
  allowChangeVote: z.boolean().optional(),
  minParticipation: z
    .number()
    .int()
    .positive("Minimum participation must be a positive number")
    .optional(),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return new Date(val) > new Date();
      },
      { message: "Expiration date must be in the future" }
    ),
});

export const votePollSchema = z.object({
  optionIds: z
    .array(z.string().uuid())
    .min(1, "At least one option must be selected"),
});

export const closePollSchema = z.object({});

export const pollFiltersSchema = z.object({
  status: z.enum(["active", "expired", "closed", "all"]).optional().default("active"),
  issueId: z.string().uuid().optional(),
  channelId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["createdAt", "expiresAt", "totalVotes"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Type exports
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
export type VotePollInput = z.infer<typeof votePollSchema>;
export type ClosePollInput = z.infer<typeof closePollSchema>;
export type PollFiltersInput = z.infer<typeof pollFiltersSchema>;
