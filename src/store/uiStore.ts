"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Command Palette
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Mobile
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;

  // Table
  tableDense: boolean;
  toggleTableDense: () => void;

  // Notifications toast position
  toasterPosition: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  setToasterPosition: (position: UIState["toasterPosition"]) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      sidebarWidth: 260,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Command Palette
      commandPaletteOpen: false,
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      // Modals
      activeModal: null,
      modalData: null,
      openModal: (modalId, data) => set({ activeModal: modalId, modalData: data ?? null }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Mobile
      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

      // Table
      tableDense: false,
      toggleTableDense: () => set((state) => ({ tableDense: !state.tableDense })),

      // Toaster
      toasterPosition: "bottom-right",
      setToasterPosition: (position) => set({ toasterPosition: position }),
    }),
    {
      name: "llc-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        tableDense: state.tableDense,
        toasterPosition: state.toasterPosition,
      }),
    }
  )
);
