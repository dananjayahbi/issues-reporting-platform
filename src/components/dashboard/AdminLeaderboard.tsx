"use client";

import { useQuery as _useQuery } from "@tanstack/react-query";
import { UserAvatar } from "@/components/users/UserAvatar";
import { formatDistanceToNow as _formatDistanceToNow } from "date-fns";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AdminStats {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  issuesResolved: number;
  avgResolutionTimeHours?: number;
  rank: number;
}

interface AdminLeaderboardProps {
  data?: AdminStats[];
  limit?: number;
}

export function AdminLeaderboard({ data, limit = 10 }: AdminLeaderboardProps) {
  // If no data provided, show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Top Resolvers
        </h3>
        <div className="h-48 flex items-center justify-center text-slate-500">
          No data available
        </div>
      </div>
    );
  }

  const topAdmins = data.slice(0, limit);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-400" />;
      default:
        return <span className="text-lg font-bold text-slate-400">{rank}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Top Resolvers
        </h3>
      </div>
      <div className="space-y-3">
        {topAdmins.map((admin, index) => (
          <div
            key={admin.userId}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors",
              index === 0
                ? "bg-yellow-50 dark:bg-yellow-900/20"
                : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
            )}
          >
            <div className="w-8 flex items-center justify-center">
              {getRankIcon(admin.rank)}
            </div>
            <UserAvatar user={admin} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {admin.displayName}
              </p>
              <p className="text-xs text-slate-500">
                {admin.avgResolutionTimeHours
                  ? `~${Math.round(admin.avgResolutionTimeHours)}h avg`
                  : "No avg data"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {admin.issuesResolved}
              </p>
              <p className="text-xs text-slate-500">resolved</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
