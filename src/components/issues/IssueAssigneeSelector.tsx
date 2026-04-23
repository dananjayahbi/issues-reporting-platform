"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { UserSummary } from "@/types/issue.types";
import { UserAvatar } from "@/components/users/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface IssueAssigneeSelectorProps {
  assignees: UserSummary[];
  onAssigneesChange: (assigneeIds: string[]) => void;
  disabled?: boolean;
}

export function IssueAssigneeSelector({
  assignees,
  onAssigneesChange,
  disabled = false,
}: IssueAssigneeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: availableUsers } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/users", {
        params: { search: search || undefined, pageSize: 50 },
      });
      return data.users as UserSummary[];
    },
  });

  const handleToggle = (userId: string) => {
    const currentIds = assignees.map((a) => a.id);
    if (currentIds.includes(userId)) {
      onAssigneesChange(currentIds.filter((id) => id !== userId));
    } else {
      onAssigneesChange([...currentIds, userId]);
    }
  };

  const selectedUsers = assignees;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start",
            selectedUsers.length === 0 && "text-slate-500"
          )}
          disabled={disabled}
        >
          {selectedUsers.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {selectedUsers.slice(0, 3).map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sm"
                >
                  <UserAvatar user={user} size="xs" />
                  {user.displayName}
                </span>
              ))}
              {selectedUsers.length > 3 && (
                <span className="text-sm text-slate-500">
                  +{selectedUsers.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span>Select assignees...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>
        <ScrollArea className="h-64">
          {availableUsers && availableUsers.length > 0 ? (
            <div className="p-1">
              {availableUsers.map((user) => {
                const isSelected = assignees.some((a) => a.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleToggle(user.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <UserAvatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500">
              <p className="text-sm">No users found</p>
            </div>
          )}
        </ScrollArea>
        {selectedUsers.length > 0 && (
          <div className="p-2 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => onAssigneesChange([])}
            >
              <X className="mr-1 h-4 w-4" />
              Clear all assignees
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
