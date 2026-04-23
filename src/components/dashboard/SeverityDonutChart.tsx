"use client";

import { cn } from "@/lib/utils/cn";
import { SEVERITY_LABELS, SEVERITY_COLORS } from "@/lib/utils/constants";
import type { IssueSeverity } from "@/lib/utils/constants";

interface SeverityData {
  severity: IssueSeverity;
  count: number;
}

interface SeverityDonutChartProps {
  data?: SeverityData[];
  size?: number;
}

export function SeverityDonutChart({ data, size = 200 }: SeverityDonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Severity Distribution
        </h3>
        <div className="h-64 flex items-center justify-center text-slate-500">
          No data available
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6;
  const _circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90;

  const slices = data.map((item, _index) => {
    const percentage = total > 0 ? (item.count / total) * 100 : 0;
    const sliceAngle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const pathD = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`,
    ].join(" ");

    return { ...item, percentage, pathD };
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Severity Distribution
      </h3>
      <div className="flex items-center justify-center gap-8">
        <div className="relative">
          <svg width={size} height={size}>
            {slices.map((slice, _index) => (
              <path
                key={slice.severity}
                d={slice.pathD}
                className={cn("transition-all duration-300 hover:opacity-80", SEVERITY_COLORS[slice.severity]?.split(" ")[1] || "bg-slate-500")}
                stroke="white"
                strokeWidth="2"
              >
                <title>{SEVERITY_LABELS[slice.severity]}: {slice.count} ({slice.percentage.toFixed(1)}%)</title>
              </path>
            ))}
            <circle cx={centerX} cy={centerY} r={innerRadius} fill="currentColor" className="text-white dark:text-slate-800" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{total}</span>
            <span className="text-sm text-slate-500">Total</span>
          </div>
        </div>
        <div className="space-y-2">
          {slices.map((slice) => (
            <div key={slice.severity} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", SEVERITY_COLORS[slice.severity]?.split(" ")[1] || "bg-slate-500")} />
              <span className="text-sm text-slate-700 dark:text-slate-300">{SEVERITY_LABELS[slice.severity]}</span>
              <span className="text-sm text-slate-500 ml-auto">{slice.count} ({slice.percentage.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
