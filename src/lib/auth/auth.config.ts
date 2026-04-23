import type { NextAuthConfig, Session } from "next-auth";
import type { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES } from "@/lib/utils/constants";

// =============================================================================
// AUTH CONFIG — LLC-Lanka Issue Tracker Platform
// =============================================================================

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            failedLoginAttempts: true,
            lockedUntil: true,
          },
        });

        if (!user) {
          return null;
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error(`Account locked until ${user.lockedUntil.toISOString()}`);
        }

        // Check if account is active
        if (!user.isActive) {
          throw new Error("Account has been deactivated");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          // Increment failed login attempts
          const newAttempts = user.failedLoginAttempts + 1;
          const updates: { failedLoginAttempts: number; lockedUntil?: Date } = {
            failedLoginAttempts: newAttempts,
          };

          // Lock account if max attempts reached
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
            updates.lockedUntil = lockUntil;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updates,
          });

          return null;
        }

        // Reset failed login attempts on successful login
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as User & { role?: string }).role;
        token.mustChangePassword = (user as User & { mustChangePassword?: boolean }).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Session['user'] & { id?: string }).id = token.id as string;
        (session.user as Session['user'] & { role?: string }).role = token.role as string;
        (session.user as Session['user'] & { mustChangePassword?: boolean }).mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  secret: process.env.AUTH_SECRET || "fallback-secret-key",
} as NextAuthConfig;
