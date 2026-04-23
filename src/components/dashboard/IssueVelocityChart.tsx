"use client";

interface VelocityDataPoint {
  date: string;
  created: number;
  resolved: number;
}

interface IssueVelocityChartProps {
  data: VelocityDataPoint[];
}

export function IssueVelocityChart({ data }: IssueVelocityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Issue Velocity
        </h3>
        <div className="h-64 flex items-center justify-center text-slate-500">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => Math.max(d.created, d.resolved)));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Issue Velocity
      </h3>
      <div className="h-64 flex items-end gap-2">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center gap-1 h-48">
              <div
                className="w-4 bg-blue-500 rounded-t"
                style={{
                  height: `${(point.created / maxValue) * 100}%`,
                }}
                title={`Created: ${point.created}`}
              />
              <div
                className="w-4 bg-green-500 rounded-t"
                style={{
                  height: `${(point.resolved / maxValue) * 100}%`,
                }}
                title={`Resolved: ${point.resolved}`}
              />
            </div>
            <span className="text-xs text-slate-500">
              {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Resolved</span>
        </div>
      </div>
    </div>
  );
}
