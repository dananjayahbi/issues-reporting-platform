"use client";

import { useFormContext } from "react-hook-form";
import type { CreateIssuePayload } from "@/types/issue.types";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

interface Step2BodyProps {
  className?: string;
}

export function Step2Body({ className }: Step2BodyProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext<CreateIssuePayload>();
  const body = watch("body");

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="body" className="required">
          Description
        </Label>
        <p className="text-sm text-slate-500">
          Provide a detailed description of the issue including steps to reproduce, expected behavior, and actual behavior.
        </p>
        <input type="hidden" {...register("body", { required: "Description is required" })} />
        <RichTextEditor
          content={body || ""}
          onChange={(html) => setValue("body", html, { shouldValidate: true })}
          placeholder="Describe the issue in detail..."
        />
        {errors.body && <p className="text-sm text-red-500">{errors.body.message}</p>}
      </div>
    </div>
  );
}
