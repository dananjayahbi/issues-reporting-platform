"use client";

import { create } from "zustand";
import { AUTOSAVE_INTERVAL_MS } from "@/lib/utils/constants";

interface IssueEditorState {
  // Draft state
  draftId: string | null;
  title: string;
  body: string;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;

  // Autosave
  autosaveEnabled: boolean;
  autosaveInterval: number;
  autosaveTimer: NodeJS.Timeout | null;

  // Editor state
  isPreviewMode: boolean;
  isSplitView: boolean;
  wordCount: number;
  characterCount: number;

  // Actions
  setDraftId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setBody: (body: string) => void;
  setIsDirty: (dirty: boolean) => void;
  setLastSavedAt: (date: Date | null) => void;
  setIsSaving: (saving: boolean) => void;
  resetDraft: () => void;

  // Autosave actions
  enableAutosave: () => void;
  disableAutosave: () => void;
  setAutosaveInterval: (interval: number) => void;

  // Editor view actions
  setPreviewMode: (preview: boolean) => void;
  setSplitView: (split: boolean) => void;
  setWordCount: (count: number) => void;
  setCharacterCount: (count: number) => void;
}

export const useIssueEditorStore = create<IssueEditorState>((set, get) => ({
  // Draft state
  draftId: null,
  title: "",
  body: "",
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,

  // Autosave
  autosaveEnabled: true,
  autosaveInterval: AUTOSAVE_INTERVAL_MS,
  autosaveTimer: null,

  // Editor state
  isPreviewMode: false,
  isSplitView: true,
  wordCount: 0,
  characterCount: 0,

  // Actions
  setDraftId: (id) => set({ draftId: id }),
  setTitle: (title) => set({ title, isDirty: true }),
  setBody: (body) => set({ body, isDirty: true }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setLastSavedAt: (date) => set({ lastSavedAt: date, isDirty: false }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  resetDraft: () =>
    set({
      draftId: null,
      title: "",
      body: "",
      isDirty: false,
      lastSavedAt: null,
      isSaving: false,
    }),

  // Autosave actions
  enableAutosave: () => {
    const state = get();
    if (state.autosaveTimer) {
      clearInterval(state.autosaveTimer);
    }
    const timer = setInterval(() => {
      // Autosave logic would be triggered here
      // This would typically call an API to save the draft
    }, state.autosaveInterval);
    set({ autosaveEnabled: true, autosaveTimer: timer });
  },
  disableAutosave: () => {
    const state = get();
    if (state.autosaveTimer) {
      clearInterval(state.autosaveTimer);
    }
    set({ autosaveEnabled: false, autosaveTimer: null });
  },
  setAutosaveInterval: (interval) => {
    const state = get();
    if (state.autosaveEnabled) {
      if (state.autosaveTimer) {
        clearInterval(state.autosaveTimer);
      }
      const timer = setInterval(() => {
        // Autosave logic
      }, interval);
      set({ autosaveInterval: interval, autosaveTimer: timer });
    } else {
      set({ autosaveInterval: interval });
    }
  },

  // Editor view actions
  setPreviewMode: (preview) => set({ isPreviewMode: preview }),
  setSplitView: (split) => set({ isSplitView: split }),
  setWordCount: (count) => set({ wordCount: count }),
  setCharacterCount: (count) => set({ characterCount: count }),
}));
