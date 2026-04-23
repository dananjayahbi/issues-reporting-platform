"use client";

import { cn } from "@/lib/utils/cn";
import { CATEGORY_LABELS } from "@/lib/utils/constants";
import type { IssueCategory } from "@/lib/utils/constants";

interface CategoryData {
  category: IssueCategory;
  count: number;
}

interface IssueByCategoryChartProps {
  data?: CategoryData[];
}

export function IssueByCategoryChart({ data }: IssueByCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Issues by Category
        </h3>
        <div className="h-64 flex items-center justify-center text-slate-500">
          No data available
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Issues by Category
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const label = CATEGORY_LABELS[item.category] || item.category;
          return (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {label}
                </span>
                <span className="text-sm text-slate-500 font-medium">{item.count}</span>
              </div>
              <div className="relative h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-500", colors[index % colors.length])}
                  style={{ width: `${percentage}%` }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-600 dark:text-slate-300">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
