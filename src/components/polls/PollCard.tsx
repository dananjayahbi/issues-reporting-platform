"use client";

import type { Poll } from "@/types/poll.types";
import { useVotePoll, useClosePoll } from "@/hooks/usePolls";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/users/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Lock as _Lock, BarChart3 as _BarChart3 } from "lucide-react";

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const votePoll = useVotePoll();
  const closePoll = useClosePoll();

  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
  const userVotedOptionId = poll.options.find((opt) =>
    opt.voters?.some((v) => v.id === "current-user")
  )?.id;

  const handleVote = async (optionId: string) => {
    try {
      await votePoll.mutateAsync({ pollId: poll.id, optionId });
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleClose = async () => {
    try {
      await closePoll.mutateAsync(poll.id);
    } catch (error) {
      console.error("Failed to close poll:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{poll.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <UserAvatar user={poll.creator} size="xs" />
            <span>{poll.creator?.displayName}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        {poll.closedAt && (
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <CheckCircle className="h-4 w-4" />
            Closed
          </span>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? ((option.voteCount || 0) / totalVotes) * 100 : 0;
          const isSelected = option.id === userVotedOptionId;

          return (
            <button
              key={option.id}
              onClick={() => !poll.closedAt && handleVote(option.id)}
              disabled={!!poll.closedAt}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-900 dark:text-white">{option.label}</span>
                {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex items-center gap-3">
                <Progress value={percentage} className="flex-1" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <span className="text-sm text-slate-500">
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </span>
        {!poll.closedAt && (
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Close Poll
          </Button>
        )}
      </div>
    </div>
  );
}
