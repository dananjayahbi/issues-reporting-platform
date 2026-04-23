import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { PASSWORD_RESET_TOKEN_EXPIRY_HOURS, INVITE_TOKEN_EXPIRY_DAYS } from "@/lib/utils/constants";


// =============================================================================
// AUTH SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || process.env.AUTH_SECRET || "fallback-secret");

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token for a user
   */
  static async generateToken(userId: string, role: string): Promise<string> {
    return new SignJWT({ userId, role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(JWT_SECRET);
  }

  /**
   * Create a password reset token and store it in the database
   */
  static async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Validate a password reset token
   */
  static async validatePasswordResetToken(token: string): Promise<string | null> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { isActive: true } } },
    });

    if (!record || record.expiresAt < new Date() || !record.user.isActive) {
      return null;
    }

    return record.userId;
  }

  /**
   * Reset password using a token
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const userId = await this.validatePasswordResetToken(token);
    if (!userId) return false;

    const passwordHash = await this.hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          password: passwordHash,
          mustChangePassword: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId } }),
      prisma.auditLog.create({
        data: {
          action: "PASSWORD_RESET_COMPLETE",
          userId,
          entityType: "user",
          entityId: userId,
          details: "Password reset via email link",
        },
      }),
    ]);

    return true;
  }

  /**
   * Change password for a logged-in user
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const isValid = await this.verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const passwordHash = await this.hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: passwordHash },
      }),
      prisma.auditLog.create({
        data: {
          action: "PASSWORD_CHANGE",
          userId,
          entityType: "user",
          entityId: userId,
          details: "User changed their password",
        },
      }),
    ]);

    return { success: true };
  }

  /**
   * Create an invite token for a new user
   */
  static async createInviteToken(
    email: string,
    _displayName: string,
    role: string,
    _invitedBy: string
  ): Promise<string> {
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_TOKEN_EXPIRY_DAYS);

    await prisma.inviteToken.create({
      data: {
        token,
        email,
        role,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Validate an invite token
   */
  static async validateInviteToken(token: string): Promise<{
    valid: boolean;
    email?: string;
    displayName?: string;
    role?: string;
    error?: string;
  }> {
    try {
      const record = await prisma.inviteToken.findUnique({
        where: { token },
      });

      if (!record) {
        return { valid: false, error: "Invalid invite token" };
      }

      if (record.expiresAt < new Date()) {
        return { valid: false, error: "Invite token has expired" };
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: record.email },
      });

      if (existingUser) {
        return { valid: false, error: "A user with this email already exists" };
      }

      return {
        valid: true,
        email: record.email,
        displayName: record.email,
        ...(record.role ? { role: record.role } : {}),
      };
    } catch (_error) {
      return { valid: false, error: "Invite token validation failed" };
    }
  }

  /**
   * Accept an invite and create the user account
   */
  static async acceptInvite(
    token: string,
    displayName: string,
    password: string
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    const validation = await this.validateInviteToken(token);
    if (!validation.valid || !validation.email) {
      return { success: false, error: validation.error ?? "Invalid token" };
    }

    const passwordHash = await this.hashPassword(password);

    try {
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: validation.email!,
            name: displayName,
            password: passwordHash,
            role: (validation.role || "VIEWER") as "ADMIN" | "QA" | "VIEWER" | "SUPER_ADMIN",
            mustChangePassword: false,
          },
        });

        if (validation.email) {
          await tx.inviteToken.deleteMany({
            where: { email: validation.email },
          });
        }

        return newUser;
      });

      return { success: true, userId: user.id };
    } catch (_error) {
      console.error("Failed to accept invite:", _error);
      return { success: false, error: "Failed to create user account" };
    }
  }

  /**
   * Get active sessions for a user
   */
  static async getActiveSessions(userId: string): Promise<Record<string, unknown>[]> {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      token: s.token,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
    }));
  }

  /**
   * Revoke a session
   */
  static async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) return false;

    await prisma.session.delete({ where: { id: sessionId } });
    return true;
  }

  /**
   * Revoke all sessions for a user (except current)
   */
  static async revokeAllSessions(userId: string, currentSessionId?: string): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
      },
    });

    return result.count;
  }

  /**
   * Get current user from session
   */
  static async getCurrentUser() {
    const session = await auth();
    if (!session?.user?.id) return null;

    return prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
