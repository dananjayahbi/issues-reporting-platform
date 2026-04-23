"use client";

import { IssueCard } from "./IssueCard";
import { Loader2 } from "lucide-react";
import type { IssueSummary } from "@/types/issue.types";

interface IssueTableProps {
  issues: IssueSummary[];
  isLoading: boolean;
  viewMode: "list" | "grid" | "kanban";
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onIssueClick: (issue: IssueSummary) => void;
}

export function IssueTable({
  issues,
  isLoading,
  viewMode,
  selectedIds,
  onSelectionChange,
  onIssueClick,
}: IssueTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No issues found</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Create your first issue to get started
        </p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            selected={selectedIds.has(issue.id)}
            onSelect={() => {
              const newIds = new Set(selectedIds);
              if (newIds.has(issue.id)) {
                newIds.delete(issue.id);
              } else {
                newIds.add(issue.id);
              }
              onSelectionChange(newIds);
            }}
            onClick={() => onIssueClick(issue)}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelectionChange(new Set(issues.map((i) => i.id)));
                  } else {
                    onSelectionChange(new Set());
                  }
                }}
                checked={selectedIds.size === issues.length && issues.length > 0}
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
              Issue
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
              Severity
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
              Assignee
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {issues.map((issue) => (
            <tr
              key={issue.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
              onClick={() => onIssueClick(issue)}
            >
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={selectedIds.has(issue.id)}
                  onChange={() => {
                    const newIds = new Set(selectedIds);
                    if (newIds.has(issue.id)) {
                      newIds.delete(issue.id);
                    } else {
                      newIds.add(issue.id);
                    }
                    onSelectionChange(newIds);
                  }}
                />
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{issue.title}</p>
                  <p className="text-sm text-slate-500">{issue.id}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <IssueStatusBadge status={issue.status} />
              </td>
              <td className="px-4 py-3">
                <IssueSeverityBadge severity={issue.severity} />
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                {issue.assigneeCount > 0 ? "Assigned" : "Unassigned"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(issue.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IssueStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    InProgress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Closed: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[status] || ""}`}>
      {status}
    </span>
  );
}

function IssueSeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[severity] || ""}`}>
      {severity}
    </span>
  );
}
