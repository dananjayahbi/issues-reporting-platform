"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setMustChangePassword: (mustChange: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      mustChangePassword: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          mustChangePassword: user?.mustChangePassword ?? false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setMustChangePassword: (mustChange) => set({ mustChangePassword: mustChange }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          mustChangePassword: false,
        }),
    }),
    {
      name: "llc-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        mustChangePassword: state.mustChangePassword,
      }),
    }
  )
);
