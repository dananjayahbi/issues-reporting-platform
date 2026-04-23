"use client";

import type { PollOption } from "@/types/poll.types";
import { cn } from "@/lib/utils/cn";

interface PollResultsChartProps {
  options: PollOption[];
  totalVotes: number;
  showPercentages?: boolean;
  maxBarWidth?: number;
}

export function PollResultsChart({
  options,
  totalVotes,
  showPercentages = true,
  maxBarWidth = 100,
}: PollResultsChartProps) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
        const barWidth = Math.min((percentage / 100) * maxBarWidth, maxBarWidth);

        return (
          <div key={option.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">
                {option.label}
              </span>
              {showPercentages && (
                <span className="text-slate-500 font-medium">
                  {percentage.toFixed(0)}%
                </span>
              )}
            </div>
            <div className="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out",
                  index === 0
                    ? "bg-primary"
                    : index === 1
                    ? "bg-blue-500"
                    : index === 2
                    ? "bg-green-500"
                    : index === 3
                    ? "bg-yellow-500"
                    : "bg-slate-500"
                )}
                style={{ width: `${barWidth}%` }}
              />
              {option.voteCount > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-600 dark:text-slate-400">
                  {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
