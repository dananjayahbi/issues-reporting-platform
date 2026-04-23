"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateIssue } from "@/hooks/useIssues";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ISSUE_SEVERITY_ARRAY, ISSUE_PRIORITY_ARRAY, ISSUE_CATEGORY_ARRAY, ISSUE_MODULE_ARRAY, ISSUE_ENVIRONMENT_ARRAY } from "@/lib/utils/constants";
import type { IssueSeverity, IssuePriority, IssueCategory, IssueModule, IssueEnvironment } from "@/lib/utils/constants";
import { Loader2 } from "lucide-react";

interface NewIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewIssueDialog({ open, onOpenChange }: NewIssueDialogProps) {
  const router = useRouter();
  const createIssue = useCreateIssue();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "CRITICAL",
    priority: "URGENT",
    category: "UI",
    module: "ADMIN",
    environment: "PRODUCTION",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createIssue.mutateAsync({
        title: formData.title,
        body: formData.description,
        severity: formData.severity as IssueSeverity,
        priority: formData.priority as IssuePriority,
        category: formData.category as IssueCategory,
        module: formData.module as IssueModule,
        environment: formData.environment as IssueEnvironment,
      });
      onOpenChange(false);
      router.push(`/issues/${result.id}`);
    } catch (error) {
      console.error("Failed to create issue:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(v) => setFormData({ ...formData, severity: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_SEVERITY_ARRAY.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_PRIORITY_ARRAY.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_CATEGORY_ARRAY.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              <Select
                value={formData.module}
                onValueChange={(v) => setFormData({ ...formData, module: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_MODULE_ARRAY.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={formData.environment}
                onValueChange={(v) => setFormData({ ...formData, environment: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_ENVIRONMENT_ARRAY.map((environment) => (
                    <SelectItem key={environment} value={environment}>
                      {environment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the issue..."
              rows={6}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createIssue.isPending}>
              {createIssue.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Issue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
