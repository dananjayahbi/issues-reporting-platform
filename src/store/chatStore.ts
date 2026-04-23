"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatState {
  // Active channel
  activeChannelId: string | null;
  activeDmUserId: string | null;
  setActiveChannel: (channelId: string | null) => void;
  setActiveDmUser: (userId: string | null) => void;

  // Unread counts
  unreadCounts: Record<string, number>;
  incrementUnread: (channelId: string) => void;
  clearUnread: (channelId: string) => void;
  setUnreadCount: (channelId: string, count: number) => void;

  // Typing indicators
  typingUsers: Record<string, string[]>;
  setTyping: (channelId: string, userId: string, isTyping: boolean) => void;

  // Sidebar
  channelSidebarCollapsed: boolean;
  toggleChannelSidebar: () => void;

  // Draft messages
  draftMessages: Record<string, string>;
  setDraftMessage: (channelId: string, message: string) => void;
  clearDraftMessage: (channelId: string) => void;

  // Reactions panel
  reactionsPanelMessageId: string | null;
  openReactionsPanel: (messageId: string) => void;
  closeReactionsPanel: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      // Active channel
      activeChannelId: null,
      activeDmUserId: null,
      setActiveChannel: (channelId) => set({ activeChannelId: channelId, activeDmUserId: null }),
      setActiveDmUser: (userId) => set({ activeDmUserId: userId, activeChannelId: null }),

      // Unread counts
      unreadCounts: {},
      incrementUnread: (channelId) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [channelId]: (state.unreadCounts[channelId] || 0) + 1,
          },
        })),
      clearUnread: (channelId) =>
        set((state) => ({
          unreadCounts: { ...state.unreadCounts, [channelId]: 0 },
        })),
      setUnreadCount: (channelId, count) =>
        set((state) => ({
          unreadCounts: { ...state.unreadCounts, [channelId]: count },
        })),

      // Typing indicators
      typingUsers: {},
      setTyping: (channelId, userId, isTyping) =>
        set((state) => {
          const current = state.typingUsers[channelId] || [];
          if (isTyping && !current.includes(userId)) {
            return { typingUsers: { ...state.typingUsers, [channelId]: [...current, userId] } };
          } else if (!isTyping) {
            return { typingUsers: { ...state.typingUsers, [channelId]: current.filter((id) => id !== userId) } };
          }
          return state;
        }),

      // Sidebar
      channelSidebarCollapsed: false,
      toggleChannelSidebar: () =>
        set((state) => ({ channelSidebarCollapsed: !state.channelSidebarCollapsed })),

      // Draft messages
      draftMessages: {},
      setDraftMessage: (channelId, message) =>
        set((state) => ({
          draftMessages: { ...state.draftMessages, [channelId]: message },
        })),
      clearDraftMessage: (channelId) =>
        set((state) => {
          const { [channelId]: _, ...rest } = state.draftMessages;
          return { draftMessages: rest };
        }),

      // Reactions panel
      reactionsPanelMessageId: null,
      openReactionsPanel: (messageId) => set({ reactionsPanelMessageId: messageId }),
      closeReactionsPanel: () => set({ reactionsPanelMessageId: null }),
    }),
    {
      name: "llc-chat",
      partialize: (state) => ({
        activeChannelId: state.activeChannelId,
        activeDmUserId: state.activeDmUserId,
        unreadCounts: state.unreadCounts,
        channelSidebarCollapsed: state.channelSidebarCollapsed,
        draftMessages: state.draftMessages,
      }),
    }
  )
);
