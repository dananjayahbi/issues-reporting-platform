"use client";

import { useState } from "react";
import type { IssueVersion } from "@/types/issue.types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/users/UserAvatar";
import { cn } from "@/lib/utils/cn";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Plus, Minus } from "lucide-react";

interface IssueVersionDiffProps {
  versions: IssueVersion[];
  currentVersion: number;
}

export function IssueVersionDiff({ versions, currentVersion }: IssueVersionDiffProps) {
  const [selectedVersion, setSelectedVersion] = useState<number>(currentVersion);

  const current = versions.find((v) => v.version === selectedVersion);
  const previous = versions.find((v) => v.version === selectedVersion - 1);

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p className="text-sm">No version history available</p>
      </div>
    );
  }

  const versionOptions = versions
    .slice()
    .sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-4">
      {/* Version Selector */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              Version {selectedVersion}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {versionOptions.map((v) => (
              <DropdownMenuItem
                key={v.version}
                onClick={() => setSelectedVersion(v.version)}
                className={cn(v.version === selectedVersion && "bg-primary/5")}
              >
                <div className="flex flex-col">
                  <span>Version {v.version}</span>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedVersion > 1 && (
          <span className="text-sm text-slate-500">
            vs version {selectedVersion - 1}
          </span>
        )}
      </div>

      {/* Diff View */}
      {current && (
        <div className="border rounded-lg overflow-hidden">
          {/* Version Info */}
          <div className="bg-slate-50 dark:bg-slate-900 p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <UserAvatar user={null} size="sm" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Version {current.version}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(current.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Changes */}
          <ScrollArea className="h-96">
            <div className="p-4 space-y-4">
              {/* Title Diff */}
              {previous && current.title !== previous.title && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Title
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <Minus className="h-3 w-3 text-red-600 mb-1" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {previous.title}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <Plus className="h-3 w-3 text-green-600 mb-1" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {current.title}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Body Diff */}
              {previous && current.body !== previous.body && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </p>
                  <div className="p-3 rounded bg-slate-100 dark:bg-slate-800 text-sm font-mono whitespace-pre-wrap">
                    <DiffView oldText={previous.body} newText={current.body} />
                  </div>
                </div>
              )}

              {/* Metadata Changes */}
              {current.metadata && previous?.metadata && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Changes
                  </p>
                  {Object.entries(current.metadata).map(([key, value]) => {
                    const oldValue = previous.metadata?.[key];
                    if (JSON.stringify(value) !== JSON.stringify(oldValue)) {
                      return (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span>{" "}
                          <span className="text-red-600 line-through">
                            {String(oldValue)}
                          </span>{" "}
                          →{" "}
                          <span className="text-green-600">{String(value)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {/* If first version or no previous */}
              {!previous && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Title
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {current.title}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Description
                    </p>
                    <div
                      className="p-3 rounded bg-slate-100 dark:bg-slate-800 text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: current.body }}
                    />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const maxLines = Math.max(oldLines.length, newLines.length);

  const diffLines: Array<{
    type: "same" | "added" | "removed";
    oldLine?: string;
    newLine?: string;
  }> = [];

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      diffLines.push({ type: "same", oldLine: oldLine ?? "", newLine: newLine ?? "" });
    } else if (oldLine === undefined) {
      diffLines.push({ type: "added", newLine: newLine ?? "" });
    } else if (newLine === undefined) {
      diffLines.push({ type: "removed", oldLine: oldLine ?? "" });
    } else {
      diffLines.push({ type: "removed", oldLine });
      diffLines.push({ type: "added", newLine });
    }
  }

  return (
    <div className="space-y-0.5">
      {diffLines.map((line, idx) => (
        <div
          key={idx}
          className={cn(
            "flex",
            line.type === "added" && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
            line.type === "removed" && "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          )}
        >
          <span className="w-8 flex-shrink-0 text-slate-400 select-none">
            {line.type === "added" && "+"}
            {line.type === "removed" && "-"}
            {line.type === "same" && " "}
          </span>
          <span className="flex-1">{line.type === "removed" ? line.oldLine : line.newLine}</span>
        </div>
      ))}
    </div>
  );
}
