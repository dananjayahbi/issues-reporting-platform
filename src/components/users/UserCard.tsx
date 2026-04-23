"use client";

import type { UserListItem } from "@/types/user.types";
import { UserAvatar } from "./UserAvatar";
import { UserPresenceDot } from "./UserPresenceDot";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Mail, MoreHorizontal, Shield, UserMinus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/lib/utils/constants";
import type { UserRole } from "@/lib/utils/constants";

interface UserCardProps {
  user: UserListItem;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onSendMessage?: () => void;
}

export function UserCard({ user, onEdit, onDeactivate, onSendMessage }: UserCardProps) {
  const lastSeen = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar user={{ id: user.id, displayName: user.name, avatarUrl: user.avatar ?? null, role: user.role }} size="lg" />
            <div className="absolute -bottom-1 -right-1">
              <UserPresenceDot
                isOnline={user.isActive}
                size="sm"
              />
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-slate-900 dark:text-white truncate">
              {user.name}
            </h4>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                  user.role === "SUPER_ADMIN"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                    : user.role === "ADMIN"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-700"
                }`}
              >
                <Shield className="h-3 w-3" />
                {ROLE_LABELS[user.role as UserRole] || user.role}
              </span>
              {!user.isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSendMessage}>
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              Edit User
            </DropdownMenuItem>
            {user.isActive && (
              <DropdownMenuItem
                onClick={onDeactivate}
                className="text-red-600 dark:text-red-400"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm text-slate-500">
        <span>
          Last seen: {lastSeen}
        </span>
        <span>
          Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
