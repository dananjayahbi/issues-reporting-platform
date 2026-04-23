"use client";

import Image from "next/image";
import type { UserSummary } from "@/types/issue.types";
import { cn } from "@/lib/utils/cn";

interface UserAvatarProps {
  user?: Partial<UserSummary> | null | undefined;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const initials = user?.displayName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const bgColor = "bg-slate-500";  // Default background color

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-medium",
        bgColor,
        sizeClasses[size],
        className
      )}
    >
      {user?.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={user.displayName || "User"}
          width={16}
          height={16}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
