"use client";

import { UserAvatar } from "@/components/users/UserAvatar";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: string;
  content?: string;
  author?: { id: string; name: string; avatar?: string };
  createdAt: string;
  changes?: Record<string, { from: string; to: string }>;
}

interface IssueActivityLogProps {
  activities: Activity[];
}

export function IssueActivityLog({ activities }: IssueActivityLogProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <UserAvatar user={activity.author} size="sm" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-white">
                {activity.author?.name || "System"}
              </span>
              <span className="text-sm text-slate-500">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="mt-1 text-slate-700 dark:text-slate-300">
              {activity.type === "comment" ? (
                <div
                  className="prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: activity.content || "" }}
                />
              ) : (
                <p className="text-sm">{getActivityDescription(activity)}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getActivityDescription(activity: Activity): string {
  switch (activity.type) {
    case "created":
      return "created this issue";
    case "status_changed":
      return `changed status from ${activity.changes?.status?.from} to ${activity.changes?.status?.to}`;
    case "assigned":
      return `assigned to ${activity.changes?.assignee?.to}`;
    case "severity_changed":
      return `changed severity from ${activity.changes?.severity?.from} to ${activity.changes?.severity?.to}`;
    default:
      return "updated this issue";
  }
}
