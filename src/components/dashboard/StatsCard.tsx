"use client";

import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  CheckCircle,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  icon?: "file-text" | "folder-open" | "check-circle" | "users" | "dashboard" | "shield";
}

const iconMap = {
  "file-text": FileText,
  "folder-open": FolderOpen,
  "check-circle": CheckCircle,
  users: Users,
  dashboard: LayoutDashboard,
  shield: Shield,
};

export function StatsCard({ title, value, change = 0, icon = "file-text" }: StatsCardProps) {
  const Icon = iconMap[icon];
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {change !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
              {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-green-500",
                  isNegative && "text-red-500"
                )}
              >
                {isPositive ? "+" : ""}
                {change}% from last month
              </span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
