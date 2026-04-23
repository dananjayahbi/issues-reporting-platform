// =============================================================================
// API TYPES — LLC-Lanka Issue Tracker Platform
// =============================================================================

// -----------------------------------------------------------------------------
// Generic API Response Wrappers
// -----------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// -----------------------------------------------------------------------------
// API Request Options
// -----------------------------------------------------------------------------

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export interface PaginatedRequestParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// -----------------------------------------------------------------------------
// Search Types
// -----------------------------------------------------------------------------

export interface SearchResult {
  type: "issue" | "comment" | "user" | "message" | "channel";
  id: string;
  title: string;
  excerpt: string;
  highlight: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters: SearchFilters;
  took: number; // milliseconds
}

export interface SearchFilters {
  types?: SearchResultType[];
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

export type SearchResultType = "issue" | "comment" | "user" | "message" | "channel";

export interface SearchRequest {
  query: string;
  types?: SearchResultType[];
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

// -----------------------------------------------------------------------------
// Audit Log Types
// -----------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  user?: {
    id: string;
    displayName: string;
    email: string;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditLogListResponse {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogFilters {
  action?: string[];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  entityType?: string;
  entityId?: string;
}

// -----------------------------------------------------------------------------
// Export Types
// -----------------------------------------------------------------------------

export type ExportFormat = "pdf" | "csv" | "xlsx";

export interface ExportIssueRequest {
  issueId: string;
  format: ExportFormat;
  includeAttachments?: boolean;
  includeComments?: boolean;
  includeActivity?: boolean;
}

export interface ExportIssuesRequest {
  filters: Record<string, unknown>;
  format: ExportFormat;
  columns?: string[];
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface ExportJob {
  id: string;
  status: "pending" | "processing" | "complete" | "failed";
  progress: number;
  downloadUrl?: string;
  expiresAt?: Date;
  error?: string;
}

// -----------------------------------------------------------------------------
// System Settings Types
// -----------------------------------------------------------------------------

export interface SystemSettings {
  categories: CategoryDefinition[];
  modules: ModuleDefinition[];
  tags: TagDefinition[];
  smtpConfig?: SmtpConfig;
  sessionTimeoutMinutes: number;
  maxUploadSizeMb: number;
  maintenanceMode: boolean;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

export interface TagDefinition {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  authUser?: string;
  authPass?: string;
  fromAddress: string;
  fromName: string;
}

export interface UpdateSystemSettingsPayload {
  categories?: CategoryDefinition[];
  modules?: ModuleDefinition[];
  tags?: TagDefinition[];
  smtpConfig?: SmtpConfig;
  sessionTimeoutMinutes?: number;
  maxUploadSizeMb?: number;
  maintenanceMode?: boolean;
}

// -----------------------------------------------------------------------------
// Dashboard / Analytics Types
// -----------------------------------------------------------------------------

export interface DashboardStats {
  myOpenIssues: number;
  myResolvedThisWeek: number;
  unreadNotifications: number;
  unreadMessages: number;
  myIssuesNeedingReview: number;
  myAssignedOpenIssues: number;
}

export interface TeamDashboardStats {
  totalOpenIssues: number;
  totalResolvedThisWeek: number;
  issuesBySeverity: Record<string, number>;
  issuesByCategory: Record<string, number>;
  issuesByModule: Record<string, number>;
  issueVelocity: VelocityDataPoint[];
  avgResolutionTimeBySeverity: Record<string, number>;
  topContributors: ContributorStats[];
}

export interface VelocityDataPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface ContributorStats {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  issuesResolved: number;
  avgResolutionHours?: number;
}
