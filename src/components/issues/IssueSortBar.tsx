"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { IssueSortOptions } from "@/types/issue.types";

interface IssueSortBarProps {
  sortOptions: IssueSortOptions;
  onSortChange: (options: IssueSortOptions) => void;
}

const SORT_FIELDS = [
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "severity", label: "Severity" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
] as const;

export function IssueSortBar({ sortOptions, onSortChange }: IssueSortBarProps) {
  const [open, setOpen] = useState(false);

  const currentField = SORT_FIELDS.find((f) => f.value === sortOptions.field);

  const handleFieldSelect = (field: IssueSortOptions["field"]) => {
    if (field === sortOptions.field) {
      onSortChange({
        ...sortOptions,
        direction: sortOptions.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ field, direction: "desc" });
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          {sortOptions.direction === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span>Sort by {currentField?.label}</span>
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {SORT_FIELDS.map((field) => (
          <DropdownMenuItem
            key={field.value}
            onClick={() => handleFieldSelect(field.value as IssueSortOptions["field"])}
            className="gap-2"
          >
            {sortOptions.field === field.value && (
              sortOptions.direction === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )
            )}
            {field.label}
            {sortOptions.field === field.value && (
              <span className="ml-auto text-xs text-slate-400 capitalize">
                {sortOptions.direction}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
