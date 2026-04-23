interface IssueSeverityBadgeProps {
  severity: string;
}

export function IssueSeverityBadge({ severity }: IssueSeverityBadgeProps) {
  const styles: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[severity] || ""}`}>
      {severity}
    </span>
  );
}
