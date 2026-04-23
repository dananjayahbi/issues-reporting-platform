"use client";

import { useState } from "react";
import type { Poll, PollOption as _PollOption } from "@/types/poll.types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

interface PollVoteUIProps {
  poll: Poll;
  onVote: (optionIds: string[]) => Promise<void>;
  disabled?: boolean;
}

export function PollVoteUI({ poll, onVote, disabled = false }: PollVoteUIProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    poll.userVote || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMultiple = poll.pollType === "MULTIPLE_CHOICE";
  const isRating = poll.pollType === "RATING";
  const isYesNo = poll.pollType === "YES_NO";

  const handleToggle = (optionId: string) => {
    if (disabled || poll.closedAt) return;

    if (isMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) return;
    setIsSubmitting(true);
    try {
      await onVote(selectedOptions);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

  if (isYesNo) {
    const yesVotes = poll.options.find((o) => o.label.toLowerCase() === "yes")?.voteCount || 0;
    const noVotes = poll.options.find((o) => o.label.toLowerCase() === "no")?.voteCount || 0;
    const yesPercent = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
    const noPercent = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {(["yes", "no"] as const).map((choice) => {
            const votes = choice === "yes" ? yesVotes : noVotes;
            const percent = choice === "yes" ? yesPercent : noPercent;
            const isSelected = selectedOptions.includes(choice);
            const hasVoted = poll.hasVoted;

            return (
              <button
                key={choice}
                onClick={() => handleToggle(choice)}
                disabled={disabled || !!(poll.closedAt)}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-colors text-left",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                  (disabled || poll.closedAt) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 dark:text-white capitalize">
                    {choice}
                  </span>
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </div>
                {hasVoted && (
                  <div className="space-y-1">
                    <Progress value={percent} className="h-2" />
                    <span className="text-sm text-slate-500">
                      {percent.toFixed(0)}% ({votes})
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {!poll.hasVoted && !poll.closedAt && (
          <Button
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </Button>
        )}
      </div>
    );
  }

  if (isRating) {
    const label = poll.options[0]?.label ?? "5";
    const rating = parseInt(label) || 5;
    const userVoteId = poll.userVote?.[0] ?? "";
    const currentRating = userVoteId
      ? poll.options.findIndex((o) => o.id === userVoteId) + 1
      : 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: rating }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              onClick={() => {
                const optionId = poll.options[star - 1]?.id;
                if (optionId) handleToggle(optionId);
              }}
              disabled={disabled || !!(poll.closedAt)}
              className={cn(
                "text-3xl transition-transform hover:scale-110",
                star <= currentRating
                  ? "text-yellow-400"
                  : "text-slate-300 dark:text-slate-600",
                (disabled || poll.closedAt) && "cursor-not-allowed"
              )}
            >
              ★
            </button>
          ))}
        </div>
        {poll.hasVoted && (
          <p className="text-center text-sm text-slate-500">
            {currentRating} / {rating} rating
          </p>
        )}
        {!poll.hasVoted && !poll.closedAt && (
          <Button
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        )}
      </div>
    );
  }

  // Single or Multiple choice
  return (
    <div className="space-y-3">
      {isMultiple ? (
        <div className="space-y-2">
          {poll.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            const percent = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;

            return (
              <button
                key={option.id}
                onClick={() => handleToggle(option.id)}
                disabled={disabled || !!(poll.closedAt)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border-2 transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                  (disabled || poll.closedAt) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span className="text-slate-900 dark:text-white">{option.label}</span>
                  </div>
                  {poll.hasVoted && (
                    <span className="text-sm text-slate-500">{percent.toFixed(0)}%</span>
                  )}
                </div>
                {poll.hasVoted && (
                  <Progress value={percent} className="h-1.5" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <RadioGroup
          value={selectedOptions[0] || ""}
          onValueChange={(v) => setSelectedOptions([v])}
          className="space-y-2"
        >
          {poll.options.map((option) => {
            const percent = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;

            return (
              <div
                key={option.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 transition-colors",
                  selectedOptions.includes(option.id)
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                <RadioGroupItem value={option.id} />
                <Label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer"
                >
                  {option.label}
                </Label>
                {poll.hasVoted && (
                  <>
                    <Progress value={percent} className="w-20 h-1.5" />
                    <span className="text-sm text-slate-500 w-12 text-right">
                      {percent.toFixed(0)}%
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </RadioGroup>
      )}

      {!poll.hasVoted && !poll.closedAt && (
        <Button
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Vote"}
        </Button>
      )}
    </div>
  );
}
