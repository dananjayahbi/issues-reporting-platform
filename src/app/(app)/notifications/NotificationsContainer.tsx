"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Bell, CheckCheck } from "lucide-react";
import type { NotificationSummary } from "@/types/notification.types";

export function NotificationsContainer() {
  const [activeTab, setActiveTab] = useState("all");
  const { data: notificationsData, isLoading } = useNotifications();

  const notifications: NotificationSummary[] = (notificationsData?.notifications as NotificationSummary[]) || [];
  const unreadNotifications: NotificationSummary[] = notifications.filter((n) => !n.isRead) || [];
  const readNotifications: NotificationSummary[] = notifications.filter((n) => n.isRead) || [];

  const handleMarkAllAsRead = async () => {
    // TODO: Implement mark all as read
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {unreadNotifications.length > 0
              ? `You have ${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <Bell className="mr-2 h-4 w-4" />
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No notifications yet</p>
          ) : (
            notifications.map((notif) => (
              <NotificationItem key={notif.id} notification={notif} />
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {unreadNotifications.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No unread notifications</p>
          ) : (
            unreadNotifications.map((notif) => (
              <NotificationItem key={notif.id} notification={notif} />
            ))
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-3">
          {readNotifications.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No read notifications</p>
          ) : (
            readNotifications.map((notif) => (
              <NotificationItem key={notif.id} notification={notif} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
