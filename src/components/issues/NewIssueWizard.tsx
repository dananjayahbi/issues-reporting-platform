"use client";

import { useState } from "react";
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
import { ISSUE_SEVERITY_ARRAY, ISSUE_PRIORITY_ARRAY, ISSUE_CATEGORY_ARRAY } from "@/lib/utils/constants";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface NewIssueWizardProps {
  step: number;
  onStepChange: (step: number) => void;
  onSubmit: (data: unknown) => void;
  isSubmitting: boolean;
}

export function NewIssueWizard({ step, onStepChange, onSubmit, isSubmitting }: NewIssueWizardProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "Medium",
    priority: "Medium",
    category: "Bug",
    tags: [] as string[],
    attachments: [] as File[],
  });

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) onStepChange(step + 1);
  };

  const handleBack = () => {
    if (step > 1) onStepChange(step - 1);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Enter a clear, descriptive title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={formData.severity} onValueChange={(v) => updateField("severity", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ISSUE_SEVERITY_ARRAY.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => updateField("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ISSUE_PRIORITY_ARRAY.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Details & Description</h3>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ISSUE_CATEGORY_ARRAY.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Provide detailed information about the issue..."
              rows={8}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Attachments & Links</h3>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Drag and drop files here, or click to browse
            </p>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review & Submit</h3>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
            <div><span className="font-medium">Title:</span> {formData.title || "Untitled"}</div>
            <div><span className="font-medium">Severity:</span> {formData.severity}</div>
            <div><span className="font-medium">Priority:</span> {formData.priority}</div>
            <div><span className="font-medium">Category:</span> {formData.category}</div>
            <div><span className="font-medium">Description:</span> {formData.description || "No description"}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {step < 4 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => onSubmit(formData)} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : <>
              <Check className="mr-2 h-4 w-4" />
              Create Issue
            </>}
          </Button>
        )}
      </div>
    </div>
  );
}
