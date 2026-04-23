"use client";

import { useFormContext } from "react-hook-form";
import type { CreateIssuePayload } from "@/types/issue.types";
import { IssueStatusBadge } from "../IssueStatusBadge";
const _IssueSeverityBadge = IssueStatusBadge;
import { UserAvatar } from "@/components/users/UserAvatar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  SEVERITY_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  MODULE_LABELS,
  ENVIRONMENT_LABELS,
} from "@/lib/utils/constants";
import type { IssueSeverity, IssuePriority, IssueCategory, IssueModule, IssueEnvironment } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle, FileText as _FileText, Tag, Link2 as _Link2 } from "lucide-react";

interface Step4ReviewProps {
  className?: string;
}

export function Step4Review({ className }: Step4ReviewProps) {
  const { watch, formState: { errors } } = useFormContext<CreateIssuePayload>();

  const title = watch("title");
  const body = watch("body");
  const severity = watch("severity");
  const priority = watch("priority");
  const category = watch("category");
  const moduleName = watch("module");
  const environment = watch("environment");
  const assigneeIds = watch("assigneeIds");
  const tagIds = watch("tagIds");

  const hasErrors = Object.keys(errors).length > 0;

  const summaryItems = [
    { label: "Title", value: title || "Not set", isValid: !!title },
    { label: "Severity", value: severity ? SEVERITY_LABELS[severity as IssueSeverity] : "Not set", isValid: !!severity },
    { label: "Priority", value: priority ? PRIORITY_LABELS[priority as IssuePriority] : "Not set", isValid: !!priority },
    { label: "Category", value: category ? CATEGORY_LABELS[category as IssueCategory] : "Not set", isValid: !!category },
    { label: "Module", value: moduleName ? MODULE_LABELS[moduleName as IssueModule] : "Not set", isValid: !!moduleName },
    { label: "Environment", value: environment ? ENVIRONMENT_LABELS[environment as IssueEnvironment] : "Not set", isValid: !!environment },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Validation Status */}
      {hasErrors ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-400">Please fix the following issues:</p>
            <ul className="mt-1 text-sm text-red-700 dark:text-red-400 list-disc list-inside">
              {errors.title && <li>Title is required</li>}
              {errors.body && <li>Description is required</li>}
              {errors.severity && <li>Severity is required</li>}
              {errors.priority && <li>Priority is required</li>}
              {errors.category && <li>Category is required</li>}
              {errors.module && <li>Module is required</li>}
              {errors.environment && <li>Environment is required</li>}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-400">All required fields are complete</p>
            <p className="text-sm text-green-700 dark:text-green-400">Review the details below and click Submit to create the issue.</p>
          </div>
        </div>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
            <p className={cn("font-medium", item.isValid ? "text-slate-900 dark:text-white" : "text-red-500")}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Description Preview */}
      <div className="space-y-2">
        <Label>Description</Label>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          {body ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <p className="text-slate-400 italic">No description provided</p>
          )}
        </div>
      </div>

      {/* Assignees */}
      {assigneeIds && assigneeIds.length > 0 && (
        <div className="space-y-2">
          <Label>Assignees</Label>
          <div className="flex flex-wrap gap-2">
            {assigneeIds.map((id) => (
              <Badge key={id} variant="secondary">
                <UserAvatar user={{ id }} size="xs" />
                <span className="ml-1">{id}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tagIds && tagIds.length > 0 && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tagIds.map((id) => (
              <Badge key={id} variant="outline">
                <Tag className="h-3 w-3 mr-1" />
                {id}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
