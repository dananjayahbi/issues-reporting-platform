"use client";

import type { NotificationSummary } from "@/types/notification.types";
import { useUIStore } from "@/store/uiStore";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CommandPaletteTrigger as _CommandPaletteTrigger } from "./CommandPalette";
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell as _Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/users/UserAvatar";
import Link from "next/link";

export function AppHeader() {
  const { toggleSidebar, toggleCommandPalette } = useUIStore();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.notifications?.filter((n: NotificationSummary) => !n.isRead).length || 0;

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search trigger */}
        <Button
          variant="outline"
          className="hidden md:flex items-center gap-2 w-64 justify-start text-slate-500"
          onClick={toggleCommandPalette}
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleCommandPalette}
        >
          <Search className="h-5 w-5" />
        </Button>

        <NotificationBell unreadCount={unreadCount} />

        <Link href="/profile">
          <UserAvatar
            user={session?.user}
            size="sm"
            className="cursor-pointer"
          />
        </Link>
      </div>
    </header>
  );
}
