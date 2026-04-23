"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { IssueLink, IssueLinkType, IssueSummary } from "@/types/issue.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import {
  Link2,
  Plus,
  X as _X,
  ArrowRight,
  Lock,
  Copy,
  Check,
  Unlink,
} from "lucide-react";

interface IssueLinkPanelProps {
  issueId: string;
  links: IssueLink[];
  onLinkCreated?: () => void;
}

const LINK_TYPE_CONFIG: Record<
  IssueLinkType,
  { label: string; icon: typeof ArrowRight; color: string }
> = {
  PARENT: { label: "Parent", icon: ArrowRight, color: "text-blue-600" },
  CHILD: { label: "Child", icon: ArrowRight, color: "text-blue-600" },
  BLOCKS: { label: "Blocks", icon: Lock, color: "text-red-600" },
  BLOCKED_BY: { label: "Blocked By", icon: Lock, color: "text-orange-600" },
  DUPLICATES_OF: { label: "Duplicates", icon: Copy, color: "text-gray-600" },
  RELATES_TO: { label: "Relates To", icon: Link2, color: "text-slate-600" },
};

export function IssueLinkPanel({ issueId, links, onLinkCreated }: IssueLinkPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<IssueLinkType>("RELATES_TO");
  const queryClient = useQueryClient();

  const { data: searchResults } = useQuery({
    queryKey: ["issue-search", search],
    queryFn: async () => {
      if (!search || search.length < 2) return [];
      const { data } = await axios.get("/api/v1/issues", {
        params: { search, pageSize: 10 },
      });
      return data.items as IssueSummary[];
    },
    enabled: search.length >= 2,
  });

  const createLink = useMutation({
    mutationFn: async ({
      targetIssueId,
      type,
    }: {
      targetIssueId: string;
      type: IssueLinkType;
    }) => {
      await axios.post(`/api/v1/issues/${issueId}/links`, {
        targetIssueId,
        linkType: type,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      setDialogOpen(false);
      setSearch("");
      setSelectedIssueId(null);
      onLinkCreated?.();
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (linkId: string) => {
      await axios.delete(`/api/v1/issues/${issueId}/links/${linkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
    },
  });

  const handleCreateLink = () => {
    if (!selectedIssueId) return;
    createLink.mutate({ targetIssueId: selectedIssueId, type: linkType });
  };

  const groupedLinks = links.reduce(
    (acc, link) => {
      const type = link.linkType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(link);
      return acc;
    },
    {} as Record<IssueLinkType, IssueLink[]>
  );

  return (
    <div className="space-y-4">
      {/* Add Link Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="mr-1 h-4 w-4" />
            Add Link
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Link Related Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Link Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Link Type
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(LINK_TYPE_CONFIG).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setLinkType(type as IssueLinkType)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                        linkType === type
                          ? "bg-primary text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Issue Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Search Issue
              </label>
              <Input
                placeholder="Search by title or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {searchResults && searchResults.length > 0 && (
                <ScrollArea className="h-48 border rounded-lg">
                  <div className="p-2">
                    {searchResults
                      .filter((i) => i.id !== issueId)
                      .map((issue) => (
                        <button
                          key={issue.id}
                          onClick={() => setSelectedIssueId(issue.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                            selectedIssueId === issue.id && "bg-primary/5"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {issue.title}
                            </p>
                            <p className="text-xs text-slate-500">{issue.id}</p>
                          </div>
                          {selectedIssueId === issue.id && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLink} disabled={!selectedIssueId}>
                Create Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Links List */}
      {links.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedLinks).map(([type, typeLinks]) => {
            const config = LINK_TYPE_CONFIG[type as IssueLinkType];
            const Icon = config.icon;
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  {config.label} ({typeLinks.length})
                </div>
                <div className="space-y-1">
                  {typeLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-slate-500">
                          {link.targetIssueId}
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                          {/* Would need to fetch issue title - showing ID for now */}
                          Issue {link.targetIssueId.slice(0, 8)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteLink.mutate(link.id)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 dark:text-slate-400">
          <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No linked issues</p>
        </div>
      )}
    </div>
  );
}
