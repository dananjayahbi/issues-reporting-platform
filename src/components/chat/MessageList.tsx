"use client";

import { useRef, useEffect } from "react";
import { useMessages } from "@/hooks/useChat";
import { MessageItem } from "./MessageItem";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  channelId: string;
}

export function MessageList({ channelId }: MessageListProps) {
  const { data: messages, isLoading } = useMessages(channelId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!messages?.messages || messages.messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.messages.map((message) => (
        <MessageItem key={message.id} message={message} channelId={channelId} />
      ))}
    </div>
  );
}
