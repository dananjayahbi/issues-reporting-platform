"use client";

import { useAddReaction } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ReactionBarProps {
  messageId: string;
  channelId: string;
}

export function ReactionBar({ messageId, channelId }: ReactionBarProps) {
  const addReaction = useAddReaction();

  const handleReaction = async (emoji: string) => {
    try {
      await addReaction.mutateAsync({ channelId, messageId, emoji });
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  return (
    <div className="mt-1 flex items-center gap-1">
      {QUICK_REACTIONS.map((emoji) => (
        <Button
          key={emoji}
          type="button"
          variant="ghost"
          size="sm"
          className="px-2 py-1 h-auto text-lg"
          onClick={() => handleReaction(emoji)}
        >
          {emoji}
        </Button>
      ))}
      <Button type="button" variant="ghost" size="sm" className="px-2 py-1 h-auto">
        <Smile className="h-4 w-4" />
      </Button>
    </div>
  );
}
