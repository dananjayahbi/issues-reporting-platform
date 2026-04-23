"use client";

import { useState } from "react";
import { usePolls } from "@/hooks/usePolls";
import { PollCard } from "@/components/polls/PollCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Clock, CheckCircle2 } from "lucide-react";
import type { Poll } from "@/types/poll.types";

type PollStatus = "active" | "closed";

export function PollsContainer() {
  const [filterStatus, setFilterStatus] = useState<PollStatus>("active");

  const { data: polls, isLoading, error } = usePolls();

  const filteredPolls = (polls || []).filter((poll: Poll) => {
    if (filterStatus === "active") {
      return !poll.closedAt;
    }
    return poll.closedAt;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Polls</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Create and participate in team polls
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          New Poll
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterStatus} onValueChange={(val) => setFilterStatus(val as PollStatus)}>
        <TabsList>
          <TabsTrigger value="active">
            <Clock className="mr-2 h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="closed">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Closed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Polls Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <p className="font-medium">Failed to load polls</p>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              {filterStatus === "active" ? "No active polls yet" : "No closed polls"}
            </p>
          </div>
        ) : (
          filteredPolls.map((poll: Poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
            />
          ))
        )}
      </div>
    </div>
  );
}
