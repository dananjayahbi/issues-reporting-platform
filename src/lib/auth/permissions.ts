import { USER_ROLES, ROLE_HIERARCHY } from "@/lib/utils/constants";
import type { UserRole } from "@/lib/utils/constants";

// =============================================================================
// PERMISSIONS — LLC-Lanka Issue Tracker Platform
// =============================================================================

export type Permission =
  | "issues:create"
  | "issues:read"
  | "issues:update"
  | "issues:delete"
  | "issues:assign"
  | "comments:create"
  | "comments:update"
  | "comments:delete"
  | "attachments:upload"
  | "attachments:delete"
  | "polls:create"
  | "polls:vote"
  | "polls:close"
  | "chat:read"
  | "chat:send"
  | "chat:manage"
  | "users:invite"
  | "users:manage"
  | "users:deactivate"
  | "settings:view"
  | "settings:update"
  | "audit:view"
  | "profile:view"
  | "profile:update";

// Role-permission mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.VIEWER]: [
    "issues:read",
    "comments:create",
    "attachments:upload",
    "polls:vote",
    "chat:read",
    "chat:send",
    "profile:view",
    "profile:update",
  ],
  [USER_ROLES.ADMIN]: [
    "issues:create",
    "issues:read",
    "issues:update",
    "issues:delete",
    "issues:assign",
    "comments:create",
    "comments:update",
    "comments:delete",
    "attachments:upload",
    "attachments:delete",
    "polls:create",
    "polls:vote",
    "polls:close",
    "chat:read",
    "chat:send",
    "chat:manage",
    "profile:view",
    "profile:update",
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    "issues:create",
    "issues:read",
    "issues:update",
    "issues:delete",
    "issues:assign",
    "comments:create",
    "comments:update",
    "comments:delete",
    "attachments:upload",
    "attachments:delete",
    "polls:create",
    "polls:vote",
    "polls:close",
    "chat:read",
    "chat:send",
    "chat:manage",
    "users:invite",
    "users:manage",
    "users:deactivate",
    "settings:view",
    "settings:update",
    "audit:view",
    "profile:view",
    "profile:update",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if role A is higher or equal to role B in the hierarchy
 */
export function isRoleAtLeast(role: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Check if a role is SUPER_ADMIN
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === USER_ROLES.SUPER_ADMIN;
}

/**
 * Check if a role is ADMIN or higher
 */
export function isAdmin(role: UserRole): boolean {
  return isRoleAtLeast(role, USER_ROLES.ADMIN);
}

/**
 * Require a minimum role level
 */
export function requireRole(role: UserRole, minRole: UserRole): void {
  if (!isRoleAtLeast(role, minRole)) {
    throw new Error(`Access denied: requires ${minRole} role or higher`);
  }
}

/**
 * Require specific permissions
 */
export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Access denied: missing required permission: ${permission}`);
  }
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(role: UserRole, permissions: Permission[]): void {
  if (!hasAnyPermission(role, permissions)) {
    throw new Error(`Access denied: missing required permissions: ${permissions.join(", ")}`);
  }
}
