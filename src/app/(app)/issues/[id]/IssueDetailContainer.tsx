"use client";

import { useRouter } from "next/navigation";
import { useIssue } from "@/hooks/useIssues";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MessageSquare, Activity } from "lucide-react";

interface IssueDetailContainerProps {
  issueId: string;
}

export function IssueDetailContainer({ issueId }: IssueDetailContainerProps) {
  const router = useRouter();
  const { data: issueDetailRes, isLoading, error } = useIssue(issueId);

  const issueData = issueDetailRes?.issue;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !issueData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Issue not found</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {error ? "Error loading issue" : "The issue you&apos;re looking for doesn&apos;t exist"}
        </p>
        <Button onClick={() => router.push("/issues")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Issue Title */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {issueData.title}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Issue #{issueId}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">
            <MessageSquare className="mr-2 h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Description</h2>
            <p className="text-slate-600 dark:text-slate-400">{issueData.body || "No description provided"}</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="text-slate-600 dark:text-slate-400">Activity log will be displayed here</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
