"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  size = "md",
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "border-4 border-primary border-t-transparent rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export function LoadingOverlay({
  text,
  className,
  ...props
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
}
