"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ISSUE_STATUS_ARRAY, ISSUE_SEVERITY_ARRAY, ISSUE_PRIORITY_ARRAY, ISSUE_CATEGORY_ARRAY } from "@/lib/utils/constants";
import type { IssueFilters as IssueFiltersType } from "@/types/issue.types";
import { X } from "lucide-react";

interface IssueFiltersProps {
  onFilterChange: (filters: IssueFiltersType) => void;
}

export function IssueFilters({ onFilterChange }: IssueFiltersProps) {
  const [filters, setFilters] = useState<IssueFiltersType>({});
  const [search, setSearch] = useState("");

  const handleChange = (key: keyof IssueFiltersType, value: string) => {
    const newFilters = { 
      ...filters, 
      [key]: value && (key === "status" || key === "severity" || key === "priority" || key === "category" || key === "module" || key === "environment")
        ? [value] 
        : value || undefined 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleChange("search", search);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch("");
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(Boolean) || search;

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-4">
        <Select
          value={Array.isArray(filters.status) ? (filters.status[0] || "") : (filters.status || "")}
          onValueChange={(v) => handleChange("status", v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {ISSUE_STATUS_ARRAY.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={Array.isArray(filters.severity) ? (filters.severity[0] || "") : (filters.severity || "")}
          onValueChange={(v) => handleChange("severity", v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Severity</SelectItem>
            {ISSUE_SEVERITY_ARRAY.map((severity) => (
              <SelectItem key={severity} value={severity}>
                {severity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={Array.isArray(filters.priority) ? (filters.priority[0] || "") : (filters.priority || "")}
          onValueChange={(v) => handleChange("priority", v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priority</SelectItem>
            {ISSUE_PRIORITY_ARRAY.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={Array.isArray(filters.category) ? (filters.category[0] || "") : (filters.category || "")}
          onValueChange={(v) => handleChange("category", v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {ISSUE_CATEGORY_ARRAY.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
