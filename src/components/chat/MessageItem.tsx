"use client";

import type { Message } from "@/types/chat.types";
import { UserAvatar } from "@/components/users/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { ReactionBar } from "./ReactionBar";
import { useState } from "react";

interface MessageItemProps {
  message: Message;
  channelId: string;
}

export function MessageItem({ message, channelId }: MessageItemProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div
      className="group flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg p-2"
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <UserAvatar user={message.sender} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-slate-900 dark:text-white">
            {message.sender?.displayName}
          </span>
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div
          className="mt-1 text-slate-700 dark:text-slate-300 break-words"
          dangerouslySetInnerHTML={{ __html: message.body }}
        />
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.reactions.map((reaction) => (
              <span
                key={reaction.emoji}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm"
              >
                {reaction.emoji}
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {reaction.count}
                </span>
              </span>
            ))}
          </div>
        )}
        {showReactions && <ReactionBar messageId={message.id} channelId={channelId} />}
      </div>
    </div>
  );
}
