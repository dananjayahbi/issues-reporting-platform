"use client";

import type { TypingStatus } from "@/types/chat.types";

interface TypingIndicatorProps {
  typingUsers: TypingStatus[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const names =
    typingUsers.length === 1
      ? typingUsers[0]?.displayName ?? "Unknown"
      : typingUsers.length === 2
      ? `${typingUsers[0]?.displayName ?? "Unknown"} and ${typingUsers[1]?.displayName ?? "Unknown"}`
      : `${typingUsers[0]?.displayName ?? "Unknown"} and ${typingUsers.length - 1} others`;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {names} {typingUsers.length === 1 ? "is" : "are"} typing...
      </span>
    </div>
  );
}
