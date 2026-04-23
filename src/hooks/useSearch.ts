"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { SEARCH_DEBOUNCE_MS } from "@/lib/utils/constants";
import type { SearchResult as _SearchResult, SearchResponse } from "@/types/api.types";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<{
    types?: string[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    userId?: string | undefined;
  }>({
    types: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    userId: undefined,
  });
  const _debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", query, filters],
    queryFn: async () => {
      if (!query.trim()) return null;
      const { data } = await axios.get<SearchResponse>("/api/v1/search", {
        params: { query, ...filters },
      });
      return data;
    },
    enabled: query.trim().length > 0,
  } as UseQueryOptions<SearchResponse | null, unknown, SearchResponse | null, string[]>);

  const search = useCallback(
    (newQuery: string, newFilters?: typeof filters) => {
      setQuery(newQuery);
      if (newFilters) setFilters(newFilters);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setFilters({
      types: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      userId: undefined,
    });
  }, []);

  return {
    query,
    results: (data as SearchResponse | null)?.results ?? [],
    total: (data as SearchResponse | null)?.total ?? 0,
    isLoading,
    error,
    search,
    clearSearch,
    filters,
    setFilters,
  };
}

export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  debounceMs = SEARCH_DEBOUNCE_MS
) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    void searchFn(debouncedQuery)
      .then((result) => setResults(result))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, searchFn]);

  return {
    query,
    setQuery,
    results,
    isLoading,
  };
}
