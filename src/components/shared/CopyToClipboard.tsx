"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CopyToClipboardProps {
  value: string;
  className?: string;
  displayValue?: string;
  successDuration?: number;
}

export function CopyToClipboard({
  value,
  className,
  displayValue,
  successDuration = 2000,
}: CopyToClipboardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), successDuration);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("gap-2", className)}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-500">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>{displayValue || "Copy"}</span>
        </>
      )}
    </Button>
  );
}
