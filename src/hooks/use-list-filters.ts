"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseListFiltersOptions<TFilter extends string, TSort extends string> {
  route: string;
  filterParam: string;
  sortParam: string;
  allowedFilters: readonly TFilter[];
  allowedSorts: readonly TSort[];
  defaultFilter: TFilter;
  defaultSort: TSort;
  searchParam?: string;
  debounceMs?: number;
}

function getAllowedValue<T extends string>(
  raw: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  if (!raw) return fallback;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

export function useListFilters<TFilter extends string, TSort extends string>(
  options: UseListFiltersOptions<TFilter, TSort>
) {
  const {
    route,
    filterParam,
    sortParam,
    allowedFilters,
    allowedSorts,
    defaultFilter,
    defaultSort,
    searchParam = "q",
    debounceMs = 300,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    () => searchParams.get(searchParam) ?? ""
  );
  const [filter, setFilter] = useState<TFilter>(() =>
    getAllowedValue(searchParams.get(filterParam), allowedFilters, defaultFilter)
  );
  const [sort, setSort] = useState<TSort>(() =>
    getAllowedValue(searchParams.get(sortParam), allowedSorts, defaultSort)
  );

  const updateURL = useCallback(
    (nextSearch: string, nextFilter: TFilter, nextSort: TSort) => {
      const params = new URLSearchParams();
      if (nextSearch.trim()) params.set(searchParam, nextSearch.trim());
      if (nextFilter !== defaultFilter) params.set(filterParam, nextFilter);
      if (nextSort !== defaultSort) params.set(sortParam, nextSort);

      const queryString = params.toString();
      router.replace(`${route}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [
      route,
      router,
      searchParam,
      filterParam,
      sortParam,
      defaultFilter,
      defaultSort,
    ]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateURL(search, filter, sort);
    }, debounceMs);
    return () => clearTimeout(timeout);
  }, [search, filter, sort, debounceMs, updateURL]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilter(defaultFilter);
    setSort(defaultSort);
  }, [defaultFilter, defaultSort]);

  const isFiltering = search.trim() !== "" || filter !== defaultFilter;

  return {
    search,
    setSearch,
    filter,
    setFilter,
    sort,
    setSort,
    clearFilters,
    isFiltering,
  };
}
