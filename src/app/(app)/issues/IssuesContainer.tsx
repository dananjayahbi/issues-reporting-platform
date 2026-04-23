"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIssues } from "@/hooks/useIssues";
import { IssueTable } from "@/components/issues/IssueTable";
import { IssueFilters } from "@/components/issues/IssueFilters";
import { BulkActionsBar } from "@/components/issues/BulkActionsBar";
import { NewIssueDialog } from "@/components/issues/NewIssueDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutGrid, List, Kanban } from "lucide-react";
import type { IssueFilters as IssueFiltersType } from "@/types/issue.types";

const _VIEW_MODES = ["list", "grid", "kanban"] as const;
  type ViewMode = (typeof _VIEW_MODES)[number];

export function IssuesContainer() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<IssueFiltersType>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  const { data, isLoading } = useIssues(filters);

  const handleFilterChange = (newFilters: IssueFiltersType) => {
    setFilters(newFilters);
  };

  const handleSelectionChange = (ids: Set<string>) => {
    setSelectedIds(ids);
  };

  const handleBulkAction = async (action: string) => {
    // Handle bulk actions
    console.warn("Bulk action:", action, Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Issues</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track, manage, and collaborate on issues
          </p>
        </div>
        <Button onClick={() => setNewIssueOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Issue
        </Button>
      </div>

      {/* View Mode & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IssueFilters onFilterChange={handleFilterChange} />

        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Kanban className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onAction={handleBulkAction}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Issues Display */}
      <IssueTable
        issues={data?.items || []}
        isLoading={isLoading}
        viewMode={viewMode}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onIssueClick={(issue) => router.push(`/issues/${issue.id}`)}
      />

      {/* New Issue Dialog */}
      <NewIssueDialog open={newIssueOpen} onOpenChange={setNewIssueOpen} />
    </div>
  );
}
