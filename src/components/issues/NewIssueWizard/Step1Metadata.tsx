"use client";

import { useFormContext } from "react-hook-form";
import type { CreateIssuePayload } from "@/types/issue.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ISSUE_SEVERITIES,
  ISSUE_PRIORITIES,
  ISSUE_CATEGORIES,
  ISSUE_MODULES,
  ISSUE_ENVIRONMENTS,
  SEVERITY_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  MODULE_LABELS,
  ENVIRONMENT_LABELS,
} from "@/lib/utils/constants";
import type { IssueSeverity, IssuePriority, IssueCategory, IssueModule, IssueEnvironment } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

interface Step1MetadataProps {
  className?: string;
}

export function Step1Metadata({ className }: Step1MetadataProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext<CreateIssuePayload>();

  const severity = watch("severity");
  const priority = watch("priority");
  const category = watch("category");
  const issueModule = watch("module");
  const environment = watch("environment");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="required">Title</Label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
          placeholder="Brief description of the issue"
          className={cn(errors.title && "border-red-500")}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Category & Severity Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="required">Category</Label>
          <Select value={category || ""} onValueChange={(v) => setValue("category", v as IssueCategory, { shouldValidate: true })}>
            <SelectTrigger id="category" className={cn(!category && "text-slate-400")}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ISSUE_CATEGORIES).map(([_key, value]) => (
                <SelectItem key={value} value={value}>{CATEGORY_LABELS[value as IssueCategory]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity" className="required">Severity</Label>
          <Select value={severity || ""} onValueChange={(v) => setValue("severity", v as IssueSeverity, { shouldValidate: true })}>
            <SelectTrigger id="severity" className={cn(!severity && "text-slate-400")}>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ISSUE_SEVERITIES).map(([_key, value]) => (
                <SelectItem key={value} value={value}>{SEVERITY_LABELS[value as IssueSeverity]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Priority & Module Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority" className="required">Priority</Label>
          <Select value={priority || ""} onValueChange={(v) => setValue("priority", v as IssuePriority, { shouldValidate: true })}>
            <SelectTrigger id="priority" className={cn(!priority && "text-slate-400")}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ISSUE_PRIORITIES).map(([_key, value]) => (
                <SelectItem key={value} value={value}>{PRIORITY_LABELS[value as IssuePriority]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="module" className="required">Module</Label>
          <Select value={issueModule as string || ""} onValueChange={(v) => setValue("module", v as IssueModule, { shouldValidate: true })}>
            <SelectTrigger id="module" className={cn(!issueModule && "text-slate-400")}>
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ISSUE_MODULES).map(([_key, value]) => (
                <SelectItem key={value} value={value}>{MODULE_LABELS[value as IssueModule]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Environment */}
      <div className="space-y-2">
        <Label htmlFor="environment" className="required">Environment</Label>
        <Select value={environment || ""} onValueChange={(v) => setValue("environment", v as IssueEnvironment, { shouldValidate: true })}>
          <SelectTrigger id="environment" className={cn(!environment && "text-slate-400")}>
            <SelectValue placeholder="Select environment" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ISSUE_ENVIRONMENTS).map(([_key, value]) => (
              <SelectItem key={value} value={value}>{ENVIRONMENT_LABELS[value as IssueEnvironment]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
