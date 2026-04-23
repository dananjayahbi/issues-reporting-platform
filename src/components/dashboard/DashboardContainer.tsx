"use client";

import { useDashboardStats } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { IssueVelocityChart } from "@/components/dashboard/IssueVelocityChart";
import { IssueByCategoryChart } from "@/components/dashboard/IssueByCategoryChart";
import { SeverityDonutChart } from "@/components/dashboard/SeverityDonutChart";
import { RecentIssuesFeed } from "@/components/dashboard/RecentIssuesFeed";
import { Loader2 } from "lucide-react";

export function DashboardContainer() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <p className="font-medium">Unable to load dashboard stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.email || "User"}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Here&apos;s what&apos;s happening with your issues today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Issues"
          value={stats.totalIssues}
          icon="dashboard"
        />
        <StatsCard
          title="Open Issues"
          value={stats.openIssues}
          icon="file-text"
        />
        <StatsCard
          title="Resolved Today"
          value={stats.resolvedToday}
          icon="check-circle"
        />
        <StatsCard
          title="Team Members"
          value={stats.teamMembers}
          icon="users"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IssueVelocityChart data={stats.velocity || []} />
        <div className="grid grid-cols-2 gap-6">
          <SeverityDonutChart data={stats.bySeverity || []} />
          <IssueByCategoryChart data={stats.byCategory || []} />
        </div>
      </div>

      {/* Issues Feed */}
      <RecentIssuesFeed issues={stats.recentIssues || []} />
    </div>
  );
}
