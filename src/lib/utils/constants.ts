// =============================================================================
// APP-WIDE STRING & ENUM CONSTANTS — LLC-Lanka Issue Tracker Platform
// =============================================================================

// -----------------------------------------------------------------------------
// User Roles
// -----------------------------------------------------------------------------
export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  VIEWER: "VIEWER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.SUPER_ADMIN]: "Super Admin",
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.VIEWER]: "Viewer",
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.VIEWER]: 1,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.SUPER_ADMIN]: 3,
};

// -----------------------------------------------------------------------------
// Issue Severities
// -----------------------------------------------------------------------------
export const ISSUE_SEVERITIES = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  INFO: "INFO",
} as const;

export type IssueSeverity = (typeof ISSUE_SEVERITIES)[keyof typeof ISSUE_SEVERITIES];

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
  [ISSUE_SEVERITIES.CRITICAL]: "Critical",
  [ISSUE_SEVERITIES.HIGH]: "High",
  [ISSUE_SEVERITIES.MEDIUM]: "Medium",
  [ISSUE_SEVERITIES.LOW]: "Low",
  [ISSUE_SEVERITIES.INFO]: "Info",
};

export const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  [ISSUE_SEVERITIES.CRITICAL]: "text-red-600 bg-red-50 border-red-200",
  [ISSUE_SEVERITIES.HIGH]: "text-orange-600 bg-orange-50 border-orange-200",
  [ISSUE_SEVERITIES.MEDIUM]: "text-yellow-600 bg-yellow-50 border-yellow-200",
  [ISSUE_SEVERITIES.LOW]: "text-blue-600 bg-blue-50 border-blue-200",
  [ISSUE_SEVERITIES.INFO]: "text-gray-600 bg-gray-50 border-gray-200",
};

// -----------------------------------------------------------------------------
// Issue Priorities
// -----------------------------------------------------------------------------
export const ISSUE_PRIORITIES = {
  URGENT: "URGENT",
  HIGH: "HIGH",
  NORMAL: "NORMAL",
  LOW: "LOW",
} as const;

export type IssuePriority = (typeof ISSUE_PRIORITIES)[keyof typeof ISSUE_PRIORITIES];

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  [ISSUE_PRIORITIES.URGENT]: "Urgent",
  [ISSUE_PRIORITIES.HIGH]: "High",
  [ISSUE_PRIORITIES.NORMAL]: "Normal",
  [ISSUE_PRIORITIES.LOW]: "Low",
};

// -----------------------------------------------------------------------------
// Issue Statuses
// -----------------------------------------------------------------------------
export const ISSUE_STATUSES = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  DUPLICATE: "DUPLICATE",
  WONT_FIX: "WONT_FIX",
} as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[keyof typeof ISSUE_STATUSES];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  [ISSUE_STATUSES.OPEN]: "Open",
  [ISSUE_STATUSES.IN_PROGRESS]: "In Progress",
  [ISSUE_STATUSES.NEEDS_REVIEW]: "Needs Review",
  [ISSUE_STATUSES.RESOLVED]: "Resolved",
  [ISSUE_STATUSES.CLOSED]: "Closed",
  [ISSUE_STATUSES.DUPLICATE]: "Duplicate",
  [ISSUE_STATUSES.WONT_FIX]: "Won't Fix",
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  [ISSUE_STATUSES.OPEN]: "text-blue-700 bg-blue-50 border-blue-200",
  [ISSUE_STATUSES.IN_PROGRESS]: "text-yellow-700 bg-yellow-50 border-yellow-200",
  [ISSUE_STATUSES.NEEDS_REVIEW]: "text-purple-700 bg-purple-50 border-purple-200",
  [ISSUE_STATUSES.RESOLVED]: "text-green-700 bg-green-50 border-green-200",
  [ISSUE_STATUSES.CLOSED]: "text-gray-700 bg-gray-100 border-gray-300",
  [ISSUE_STATUSES.DUPLICATE]: "text-gray-700 bg-gray-100 border-gray-300",
  [ISSUE_STATUSES.WONT_FIX]: "text-gray-700 bg-gray-100 border-gray-300",
};

// -----------------------------------------------------------------------------
// Issue Categories
// -----------------------------------------------------------------------------
export const ISSUE_CATEGORIES = {
  UI: "UI",
  LOGIC: "LOGIC",
  PERFORMANCE: "PERFORMANCE",
  SECURITY: "SECURITY",
  DATA: "DATA",
  INTEGRATION: "INTEGRATION",
  DOCUMENTATION: "DOCUMENTATION",
  OTHER: "OTHER",
} as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[keyof typeof ISSUE_CATEGORIES];

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  [ISSUE_CATEGORIES.UI]: "UI / UX",
  [ISSUE_CATEGORIES.LOGIC]: "Business Logic",
  [ISSUE_CATEGORIES.PERFORMANCE]: "Performance",
  [ISSUE_CATEGORIES.SECURITY]: "Security",
  [ISSUE_CATEGORIES.DATA]: "Data / Database",
  [ISSUE_CATEGORIES.INTEGRATION]: "Integration",
  [ISSUE_CATEGORIES.DOCUMENTATION]: "Documentation",
  [ISSUE_CATEGORIES.OTHER]: "Other",
};

// -----------------------------------------------------------------------------
// Issue Modules (mirrors LLC POS/ERP modules)
// -----------------------------------------------------------------------------
export const ISSUE_MODULES = {
  POS: "POS",
  INVENTORY: "INVENTORY",
  ACCOUNTS: "ACCOUNTS",
  HRM: "HRM",
  CRM: "CRM",
  REPORTING: "REPORTING",
  ECOMMERCE: "ECOMMERCE",
  ADMIN: "ADMIN",
  SETTINGS: "SETTINGS",
  MOBILE: "MOBILE",
  API: "API",
  OTHER: "OTHER",
} as const;

export type IssueModule = (typeof ISSUE_MODULES)[keyof typeof ISSUE_MODULES];

export const MODULE_LABELS: Record<IssueModule, string> = {
  [ISSUE_MODULES.POS]: "Point of Sale",
  [ISSUE_MODULES.INVENTORY]: "Inventory",
  [ISSUE_MODULES.ACCOUNTS]: "Accounts",
  [ISSUE_MODULES.HRM]: "HRM",
  [ISSUE_MODULES.CRM]: "CRM",
  [ISSUE_MODULES.REPORTING]: "Reporting",
  [ISSUE_MODULES.ECOMMERCE]: "E-Commerce",
  [ISSUE_MODULES.ADMIN]: "Admin Panel",
  [ISSUE_MODULES.SETTINGS]: "Settings",
  [ISSUE_MODULES.MOBILE]: "Mobile App",
  [ISSUE_MODULES.API]: "API",
  [ISSUE_MODULES.OTHER]: "Other",
};

// -----------------------------------------------------------------------------
// Issue Environments
// -----------------------------------------------------------------------------
export const ISSUE_ENVIRONMENTS = {
  PRODUCTION: "PRODUCTION",
  STAGING: "STAGING",
  DEVELOPMENT: "DEVELOPMENT",
  TESTING: "TESTING",
  DEMO: "DEMO",
} as const;

export type IssueEnvironment = (typeof ISSUE_ENVIRONMENTS)[keyof typeof ISSUE_ENVIRONMENTS];

export const ENVIRONMENT_LABELS: Record<IssueEnvironment, string> = {
  [ISSUE_ENVIRONMENTS.PRODUCTION]: "Production",
  [ISSUE_ENVIRONMENTS.STAGING]: "Staging",
  [ISSUE_ENVIRONMENTS.DEVELOPMENT]: "Development",
  [ISSUE_ENVIRONMENTS.TESTING]: "Testing",
  [ISSUE_ENVIRONMENTS.DEMO]: "Demo",
};

// -----------------------------------------------------------------------------
// Chat Channel Types
// -----------------------------------------------------------------------------
export const CHANNEL_TYPES = {
  GENERAL: "GENERAL",
  ISSUE_LINKED: "ISSUE_LINKED",
  DIRECT: "DIRECT",
  GROUP: "GROUP",
} as const;

export type ChannelType = (typeof CHANNEL_TYPES)[keyof typeof CHANNEL_TYPES];

// -----------------------------------------------------------------------------
// Poll Types
// -----------------------------------------------------------------------------
export const POLL_TYPES = {
  SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  RATING: "RATING",
  YES_NO: "YES_NO",
} as const;

export type PollType = (typeof POLL_TYPES)[keyof typeof POLL_TYPES];

// -----------------------------------------------------------------------------
// Notification Types
// -----------------------------------------------------------------------------
export const NOTIFICATION_TYPES = {
  ISSUE_ASSIGNED: "ISSUE_ASSIGNED",
  ISSUE_STATUS_CHANGED: "ISSUE_STATUS_CHANGED",
  COMMENT_ADDED: "COMMENT_ADDED",
  CHAT_REPLY: "CHAT_REPLY",
  POLL_CREATED: "POLL_CREATED",
  POLL_EXPIRING: "POLL_EXPIRING",
  NEW_ISSUE_IN_MODULE: "NEW_ISSUE_IN_MODULE",
  MENTION: "MENTION",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// -----------------------------------------------------------------------------
// Audit Log Actions
// -----------------------------------------------------------------------------
export const AUDIT_ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LOGIN_FAILED: "LOGIN_FAILED",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_COMPLETE: "PASSWORD_RESET_COMPLETE",
  ACCOUNT_LOCKOUT: "ACCOUNT_LOCKOUT",
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
  USER_REACTIVATED: "USER_REACTIVATED",
  ISSUE_CREATED: "ISSUE_CREATED",
  ISSUE_UPDATED: "ISSUE_UPDATED",
  ISSUE_DELETED: "ISSUE_DELETED",
  ISSUE_STATUS_CHANGED: "ISSUE_STATUS_CHANGED",
  ISSUE_ASSIGNED: "ISSUE_ASSIGNED",
  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_UPDATED: "COMMENT_UPDATED",
  COMMENT_DELETED: "COMMENT_DELETED",
  ATTACHMENT_UPLOADED: "ATTACHMENT_UPLOADED",
  ATTACHMENT_DELETED: "ATTACHMENT_DELETED",
  POLL_CREATED: "POLL_CREATED",
  POLL_VOTED: "POLL_VOTED",
  POLL_CLOSED: "POLL_CLOSED",
  CHANNEL_CREATED: "CHANNEL_CREATED",
  MESSAGE_SENT: "MESSAGE_SENT",
  MESSAGE_EDITED: "MESSAGE_EDITED",
  MESSAGE_DELETED: "MESSAGE_DELETED",
  SETTINGS_CHANGED: "SETTINGS_CHANGED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// -----------------------------------------------------------------------------
// Pagination Defaults
// -----------------------------------------------------------------------------
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

// -----------------------------------------------------------------------------
// File Upload Limits
// -----------------------------------------------------------------------------
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];
export const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// -----------------------------------------------------------------------------
// Session & Auth
// -----------------------------------------------------------------------------
export const SESSION_TIMEOUT_MINUTES = 60;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 30;
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 24;
export const INVITE_TOKEN_EXPIRY_DAYS = 7;

// -----------------------------------------------------------------------------
// Autosave
// -----------------------------------------------------------------------------
export const AUTOSAVE_INTERVAL_MS = 30_000; // 30 seconds

// -----------------------------------------------------------------------------
// Real-time
// -----------------------------------------------------------------------------
export const TYPING_INDICATOR_TIMEOUT_MS = 3_000; // 3 seconds
export const PRESENCE_HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds
export const RECONNECT_DELAY_MS = 1_000;
export const MAX_RECONNECT_ATTEMPTS = 5;

// -----------------------------------------------------------------------------
// Search
// -----------------------------------------------------------------------------
export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SIMILARITY_SCORE = 0.6; // For duplicate issue detection

// -----------------------------------------------------------------------------
// App Info
// -----------------------------------------------------------------------------
export const APP_NAME = "LLC-Lanka Issue Tracker";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "Internal Issue Reporting & Management Platform for LLC-Lanka Commerce Cloud";

// =============================================================================
// DERIVED ARRAY CONSTANTS (for mapping in UI components)
// =============================================================================
export const ISSUE_SEVERITY_ARRAY = Object.values(ISSUE_SEVERITIES);
export const ISSUE_PRIORITY_ARRAY = Object.values(ISSUE_PRIORITIES);
export const ISSUE_STATUS_ARRAY = Object.values(ISSUE_STATUSES);
export const ISSUE_CATEGORY_ARRAY = Object.values(ISSUE_CATEGORIES);
export const ISSUE_MODULE_ARRAY = Object.values(ISSUE_MODULES);
export const ISSUE_ENVIRONMENT_ARRAY = Object.values(ISSUE_ENVIRONMENTS);
