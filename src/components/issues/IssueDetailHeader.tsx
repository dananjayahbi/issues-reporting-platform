"use client";

import type { Issue } from "@/types/issue.types";
import { IssueStatusBadge } from "./IssueStatusBadge";
import { IssueSeverityBadge } from "./IssueSeverityBadge";
import { UserAvatar } from "@/components/users/UserAvatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Copy, Share2 } from "lucide-react";

interface IssueDetailHeaderProps {
  issue: Issue;
}

export function IssueDetailHeader({ issue }: IssueDetailHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* ID and badges */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-slate-500">{issue.id}</span>
            <IssueStatusBadge status={issue.status} />
            <IssueSeverityBadge severity={issue.severity} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {issue.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Reporter:</span>
              <div className="flex items-center gap-2">
                <UserAvatar user={issue.reporter} size="xs" />
                <span className="text-slate-900 dark:text-white">{issue.reporter?.displayName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Assignee:</span>
              {issue.assignees[0] ? (
                <div className="flex items-center gap-2">
                  <UserAvatar user={issue.assignees[0]} size="xs" />
                  <span className="text-slate-900 dark:text-white">{issue.assignees[0].displayName}</span>
                </div>
              ) : (
                <span className="text-slate-500">Unassigned</span>
              )}
            </div>
            <div>
              Created: {new Date(issue.createdAt).toLocaleDateString()}
            </div>
            <div>
              Updated: {new Date(issue.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Issue
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
