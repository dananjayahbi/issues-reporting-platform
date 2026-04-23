"use client";

import { useCallback } from "react";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

export function SearchContainer() {
  const {
    query,
    total,
    isLoading,
    error,
    clearSearch,
  } = useSearch();

  const hasQuery = query.trim().length > 0;
  const resultCount = total;

  const handleClear = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Search</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Find issues, comments, and team members
        </p>
      </div>

      {/* Results Section */}
      {hasQuery && (
        <div className="space-y-4">
          {/* Info Bar */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : (
                `Found ${resultCount} result${resultCount !== 1 ? "s" : ""}`
              )}
            </span>
            {hasQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Results */}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              <p className="font-medium">Error searching. Please try again.</p>
            </div>
          ) : resultCount === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">
                No results found for &quot;{query}&quot;
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
