"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import type { User } from "@/types/auth.types";

export function useAuth() {
  const { data: session, status, update } = useSession();

  const user = session?.user as (User & { mustChangePassword: boolean }) | undefined;

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return result;
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: status === "loading",
    isUnauthenticated: status === "unauthenticated",
    login,
    logout,
    updateSession: update,
  };
}
