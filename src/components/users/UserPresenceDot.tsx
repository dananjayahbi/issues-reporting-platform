"use client";

import { cn } from "@/lib/utils/cn";

interface UserPresenceDotProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export function UserPresenceDot({
  isOnline,
  size = "md",
  className,
}: UserPresenceDotProps) {
  return (
    <span
      className={cn(
        "relative flex rounded-full",
        sizeClasses[size],
        className
      )}
    >
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
          isOnline ? "bg-green-400" : "bg-slate-400"
        )}
        style={{ animationDuration: "2s" }}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full h-full w-full",
          isOnline ? "bg-green-500" : "bg-slate-500"
        )}
      />
    </span>
  );
}
