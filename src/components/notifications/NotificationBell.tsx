"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";
import type { NotificationSummary } from "@/types/notification.types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NotificationBellProps {
  unreadCount: number;
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  const _router = useRouter();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = async (notification: NotificationSummary) => {
    if (!notification.isRead) {
      try {
        await markRead.mutateAsync([notification.id]);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm">
              <Check className="mr-1 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications?.notifications && notifications.notifications.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {notifications.notifications.slice(0, 10).map((notification: NotificationSummary) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {!notification.isRead && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No notifications yet
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
