"use client";

import { useQuery } from "@tanstack/react-query";
import type { Message } from "@/types/chat.types";
import { UserAvatar } from "@/components/users/UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Pin, X, ExternalLink } from "lucide-react";

interface PinnedMessagesProps {
  channelId: string;
  onMessageClick?: (messageId: string) => void;
  onClose?: () => void;
}

export function PinnedMessages({
  channelId,
  onMessageClick,
  onClose,
}: PinnedMessagesProps) {
  const { data: pinnedMessages } = useQuery({
    queryKey: ["channel-pinned-messages", channelId],
    queryFn: async () => {
      const { data } = await fetch(`/api/chat/channels/${channelId}/pinned`).then((r) =>
        r.json()
      );
      return data.messages as Message[];
    },
  });

  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-slate-500" />
          <h3 className="font-medium text-slate-900 dark:text-white">
            Pinned Messages
          </h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages List */}
      <ScrollArea className="flex-1">
        {pinnedMessages && pinnedMessages.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {pinnedMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => onMessageClick?.(message.id)}
                className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar user={message.sender} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {message.sender?.displayName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p
                      className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: message.body }}
                    />
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Pin className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No pinned messages
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
