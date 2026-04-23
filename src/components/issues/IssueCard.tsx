"use client";

import type { Issue, IssueSummary } from "@/types/issue.types";
import { cn } from "@/lib/utils/cn";
import { IssueStatusBadge } from "./IssueStatusBadge";
import { IssueSeverityBadge } from "./IssueSeverityBadge";
import { UserAvatar } from "@/components/users/UserAvatar";
import { MessageSquare, Paperclip } from "lucide-react";

interface IssueCardProps {
  issue: Issue | IssueSummary;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
}

export function IssueCard({ issue, selected, onSelect, onClick }: IssueCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800 rounded-lg border p-4 transition-colors",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {onSelect && (
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <span className="text-xs text-slate-500 font-mono">{issue.id}</span>
        </div>
        <IssueSeverityBadge severity={issue.severity} />
      </div>

      {/* Title */}
      <h3 className="font-medium text-slate-900 dark:text-white mb-2 line-clamp-2">
        {issue.title}
      </h3>

      {/* Description preview */}
      {"body" in issue && issue.body && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {issue.body.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <IssueStatusBadge status={issue.status} />
          {issue.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MessageSquare className="h-3 w-3" />
              {issue.commentCount}
            </span>
          )}
          {"attachments" in issue && issue.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Paperclip className="h-3 w-3" />
              {issue.attachments.length}
            </span>
          )}
        </div>
        {"assignees" in issue && issue.assignees[0] && <UserAvatar user={issue.assignees[0]} size="xs" />}
      </div>
    </div>
  );
}
