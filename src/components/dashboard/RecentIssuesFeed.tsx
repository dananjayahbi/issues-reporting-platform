"use client";

import { FileText } from "lucide-react";

interface RecentIssue {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
}

interface RecentIssuesFeedProps {
  issues: RecentIssue[];
}

export function RecentIssuesFeed({ issues }: RecentIssuesFeedProps) {
  if (!issues || issues.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Recent Issues
        </h3>
        <div className="h-48 flex flex-col items-center justify-center text-slate-500">
          <FileText className="h-8 w-8 mb-2" />
          <p>No recent issues</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Recent Issues
      </h3>
      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {issue.title}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span
                className={`px-2 py-1 text-xs rounded ${
                  issue.status === "Open"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : issue.status === "Resolved"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-700"
                }`}
              >
                {issue.status}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  issue.severity === "Critical"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    : issue.severity === "High"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                    : issue.severity === "Medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {issue.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
