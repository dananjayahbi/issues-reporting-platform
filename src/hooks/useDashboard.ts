"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { IssueSeverity, IssueCategory } from "@/lib/utils/constants";

interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  resolvedToday: number;
  teamMembers: number;
  issuesChange: number;
  openIssuesChange: number;
  resolvedChange: number;
  velocity: Array<{ date: string; created: number; resolved: number }>;
  byCategory: Array<{ category: IssueCategory; count: number }>;
  bySeverity: Array<{ severity: IssueSeverity; count: number }>;
  recentIssues: Array<{
    id: string;
    title: string;
    status: string;
    severity: string;
    createdAt: string;
  }>;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await axios.get("/api/dashboard/stats");
  return response.data;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 60 * 1000, // 1 minute
  });
}
