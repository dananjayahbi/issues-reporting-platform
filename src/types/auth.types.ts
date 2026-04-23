import type { UserRole } from "@/lib/utils/constants";

// =============================================================================
// AUTH TYPES — LLC-Lanka Issue Tracker Platform
// =============================================================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
  lastSeenAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
  lockedUntil?: Date;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface FirstLoginSetupPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthSession {
  user: User;
  expires: string;
}

export interface InviteUserPayload {
  email: string;
  displayName: string;
  role: UserRole;
}

export interface InviteToken {
  token: string;
  email: string;
  displayName: string;
  role: UserRole;
  expiresAt: Date;
  invitedBy: string;
  createdAt: Date;
}

export interface ActiveSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}
