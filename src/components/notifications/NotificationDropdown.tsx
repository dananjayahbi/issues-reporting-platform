"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import { Bell, Check, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NotificationDropdownProps {
  trigger?: React.ReactNode;
}

export function NotificationDropdown({ trigger }: NotificationDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useNotifications({ pageSize: 20 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      try {
        await markRead.mutateAsync([notification.id]);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    setOpen(false);

    // Navigate based on notification type
    if ((notification.data as Record<string, unknown>)?.issueId) {
      router.push(`/issues/${(notification.data as Record<string, unknown>)?.issueId}`);
    } else if ((notification.data as Record<string, unknown>)?.channelId) {
      router.push(`/chat/${(notification.data as Record<string, unknown>)?.channelId}`);
    } else if ((notification.data as Record<string, unknown>)?.pollId) {
      router.push(`/polls/${(notification.data as Record<string, unknown>)?.pollId}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <Check className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push("/notifications/settings")}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[28rem]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    !notification.isRead && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationItem notification={notification} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No notifications yet
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                You&apos;ll see updates here when something happens
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => router.push("/notifications")}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
