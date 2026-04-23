"use client";

import { useState } from "react";
import { useSendMessage } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Send } from "lucide-react";

interface MessageInputProps {
  channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const sendMessage = useSendMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await sendMessage.mutateAsync({ channelId, body: content });
      setContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="icon">
          <Smile className="h-5 w-5" />
        </Button>
        <Button type="submit" size="icon" disabled={!content.trim() || sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
