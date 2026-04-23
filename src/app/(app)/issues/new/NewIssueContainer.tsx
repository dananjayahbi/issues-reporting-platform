"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateIssue } from "@/hooks/useIssues";
import { NewIssueWizard } from "@/components/issues/NewIssueWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function NewIssueContainer() {
  const router = useRouter();
  const createIssue = useCreateIssue();
  const [step, setStep] = useState(1);

  const handleSubmit = async (data: unknown) => {
    try {
      const result = await createIssue.mutateAsync(data as Parameters<typeof createIssue.mutateAsync>[0]);
      router.push(`/issues/${result.id}`);
    } catch (error) {
      console.error("Failed to create issue:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/issues">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Issue</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Step {step} of 4: {getStepTitle(step)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>

      <NewIssueWizard
        step={step}
        onStepChange={setStep}
        onSubmit={handleSubmit}
        isSubmitting={createIssue.isPending}
      />
    </div>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1: return "Basic Information";
    case 2: return "Details & Description";
    case 3: return "Attachments & Links";
    case 4: return "Review & Submit";
    default: return "";
  }
}
