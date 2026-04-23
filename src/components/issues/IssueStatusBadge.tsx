interface IssueStatusBadgeProps {
  status: string;
}

export function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
  const styles: Record<string, string> = {
    Open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    InProgress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Closed: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[status] || ""}`}>
      {status}
    </span>
  );
}
