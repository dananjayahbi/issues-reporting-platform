"use client";

import type { Notification, NotificationSummary } from "@/types/notification.types";
import { useMarkNotificationRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: Notification | NotificationSummary;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markRead.mutateAsync([notification.id]);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      markRead.mutate([notification.id]);
    }
    if ((notification.data as Record<string, unknown>)?.issueId) {
      router.push(`/issues/${(notification.data as Record<string, unknown>)?.issueId}`);
    }
  };

  return (
    <div
      className={`p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <Bell className="h-4 w-4 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {notification.title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {notification.body}
              </p>
            </div>
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMarkAsRead}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        {notification.data?.issueId && (
          <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
        )}
      </div>
    </div>
  );
}
