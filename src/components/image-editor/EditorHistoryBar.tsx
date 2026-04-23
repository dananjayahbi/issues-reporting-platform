"use client";

import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";

interface EditorHistoryBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function EditorHistoryBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorHistoryBarProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-white disabled:opacity-50"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-white disabled:opacity-50"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
