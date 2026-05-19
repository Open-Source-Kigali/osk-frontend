import { useState, useMemo } from "react";

interface UseFilterConfig<T> {
  items:      T[];
  // Fields to search across when user types in the search box
  searchKeys: (keyof T)[];
  // Fields that have exact-match dropdown/pill filters
  filterKeys?: (keyof T)[];
}

interface UseFilterReturn<T, F extends Record<string, string>> {
  filtered:    T[];
  search:      string;
  setSearch:   (value: string) => void;
  filters:     F;
  setFilter:   (key: keyof F, value: string) => void;
  clearAll:    () => void;
  resultCount: number;
  hasActiveFilters: boolean;
}

/**
 * Generic filter + search hook for any typed array.
 *
 * Usage (Projects page):
 *   const { filtered, search, setSearch, filters, setFilter, clearAll } =
 *     useFilter<Project, { category: string; status: string }>({
 *       items:      PROJECTS,
 *       searchKeys: ["title", "description", "techStack"],
 *       filterKeys: ["category", "status"],
 *     });
 */
export function useFilter<T, F extends Record<string, string>>({
  items,
  searchKeys,
  filterKeys = [],
}: UseFilterConfig<T>): UseFilterReturn<T, F> {
  // Build initial filter state - all set to "all"
  const initialFilters = Object.fromEntries(
    filterKeys.map((k) => [k as string, "all"])
  ) as F;

  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState<F>(initialFilters);

  const setFilter = (key: keyof F, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAll = () => {
    setSearch("");
    setFilters(initialFilters);
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // ── Search match ──────────────────────────────────────────────────────
      const q = search.toLowerCase().trim();
      const matchSearch = !q || searchKeys.some((key) => {
        const val = item[key];
        // Handle arrays (e.g. techStack, tags)
        if (Array.isArray(val)) {
          return val.some((v) => String(v).toLowerCase().includes(q));
        }
        return String(val ?? "").toLowerCase().includes(q);
      });

      // ── Filter match ──────────────────────────────────────────────────────
      const matchFilters = filterKeys.every((key) => {
        const activeValue = filters[key as string];
        if (!activeValue || activeValue === "all") return true;
        return String(item[key]) === activeValue;
      });

      return matchSearch && matchFilters;
    });
  }, [items, search, filters, searchKeys, filterKeys]);

  const hasActiveFilters =
    search.trim() !== "" ||
    Object.values(filters).some((v) => v !== "all");

  return {
    filtered,
    search,
    setSearch,
    filters,
    setFilter,
    clearAll,
    resultCount:      filtered.length,
    hasActiveFilters,
  };
}