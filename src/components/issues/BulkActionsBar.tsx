"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, MoreHorizontal, Trash2, Tag, UserPlus, CheckCircle } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, onAction, onClear }: BulkActionsBarProps) {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-primary">
          {selectedCount} issue{selectedCount !== 1 ? "s" : ""} selected
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="mr-1 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onAction("assign")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign to...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("tag")}>
              <Tag className="mr-2 h-4 w-4" />
              Add Tags
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("status")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Change Status
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction("delete")}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button variant="ghost" size="icon" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
