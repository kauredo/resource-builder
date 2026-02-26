"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortDropdown } from "@/components/ui/sort-dropdown";
import { StyleCard } from "@/components/style/StyleCard";
import { STYLE_PRESETS } from "@/lib/style-presets";
import { useListFilters } from "@/hooks/use-list-filters";
import { Plus, Palette, Search, X, ArrowUpRight } from "lucide-react";
import type { StyleFrames } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

type TypeFilter = "all" | "presets" | "custom";
type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

const TYPE_FILTERS: TypeFilter[] = ["all", "presets", "custom"];
const SORT_OPTIONS: SortOption[] = [
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
];

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
};

export default function StylesPage() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const stylesWithSummaries = useQuery(
    api.styles.getUserStylesWithSummaries,
    user?._id ? { userId: user._id } : "skip",
  );
  const styles = stylesWithSummaries;
  const limits = useQuery(api.users.getSubscriptionLimits);
  const createStyle = useMutation(api.styles.createStyle);

  const {
    search,
    setSearch,
    filter: typeFilter,
    setFilter: setTypeFilter,
    sort: sortOption,
    setSort: setSortOption,
    clearFilters,
    isFiltering,
  } = useListFilters<TypeFilter, SortOption>({
    route: "/dashboard/styles",
    filterParam: "type",
    sortParam: "sort",
    allowedFilters: TYPE_FILTERS,
    allowedSorts: SORT_OPTIONS,
    defaultFilter: "all",
    defaultSort: "newest",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Count styles by type
  const typeCounts = useMemo(() => {
    if (!styles) return { all: 0, presets: 0, custom: 0 };
    return {
      all: styles.length,
      presets: styles.filter(s => s.isPreset).length,
      custom: styles.filter(s => !s.isPreset).length,
    };
  }, [styles]);

  // Filter and sort styles
  const filteredStyles = useMemo(() => {
    if (!styles) return [];

    let result = [...styles];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(s => s.name.toLowerCase().includes(searchLower));
    }

    // Type filter
    if (typeFilter === "presets") {
      result = result.filter(s => s.isPreset);
    } else if (typeFilter === "custom") {
      result = result.filter(s => !s.isPreset);
    }

    // Sort
    switch (sortOption) {
      case "newest":
        result.sort(
          (a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) => (a.updatedAt ?? a.createdAt) - (b.updatedAt ?? b.createdAt),
        );
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [styles, search, typeFilter, sortOption]);

  const hasAnyStyles = styles && styles.length > 0;
  const hasFilteredResults = filteredStyles.length > 0;
  // Create a new custom style
  const handleCreateStyle = async () => {
    if (!user?._id) return;

    setIsCreating(true);
    try {
      const basePreset = STYLE_PRESETS[0];
      const newStyleId = await createStyle({
        userId: user._id,
        name: "My Custom Style",
        colors: basePreset.colors,
        typography: basePreset.typography,
        illustrationStyle: basePreset.illustrationStyle,
      });
      router.push(`/dashboard/styles/${newStyleId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.startsWith("LIMIT_REACHED:")) {
        const parts = message.split(":");
        const humanMessage = parts.slice(2).join(":");
        toast.error(humanMessage, {
          action: {
            label: "Upgrade",
            onClick: () => { window.location.href = "/dashboard/settings/billing"; },
          },
        });
      } else {
        console.error("Failed to create style:", error);
      }
      setIsCreating(false);
    }
  };

  // Loading state
  if (styles === undefined) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        role="status"
        aria-label="Loading styles"
      >
        {/* Header skeleton */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          aria-hidden="true"
        >
          <div className="h-10 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
          <div className="h-10 w-36 bg-muted rounded animate-pulse motion-reduce:animate-none" />
        </div>
        {/* Search skeleton */}
        <div
          className="h-10 w-full bg-muted rounded animate-pulse motion-reduce:animate-none mb-6"
          aria-hidden="true"
        />
        {/* Filters skeleton */}
        <div className="flex justify-between mb-6" aria-hidden="true">
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-muted rounded-full animate-pulse motion-reduce:animate-none" />
            <div className="h-8 w-20 bg-muted rounded-full animate-pulse motion-reduce:animate-none" />
            <div className="h-8 w-20 bg-muted rounded-full animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="h-8 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none" />
        </div>
        {/* Grid skeleton */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          aria-hidden="true"
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border bg-card">
              <div className="h-20 bg-muted rounded-xl mb-4 animate-pulse motion-reduce:animate-none" />
              <div className="flex gap-1.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="flex-1 h-2.5 bg-muted rounded-full animate-pulse motion-reduce:animate-none"
                  />
                ))}
              </div>
              <div className="h-5 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-serif text-4xl font-medium tracking-tight">
          Styles
        </h1>
        {limits && !limits.canCreate.style ? (
          <Button asChild variant="outline" className="gap-2 cursor-pointer">
            <Link href="/dashboard/settings/billing">
              <ArrowUpRight className="size-4" aria-hidden="true" />
              Upgrade to create more
            </Link>
          </Button>
        ) : (
          <Button
            onClick={handleCreateStyle}
            disabled={isCreating}
            className="btn-coral gap-2"
          >
            <Plus className="size-4" aria-hidden="true" />
            {isCreating ? "Creating..." : "Create Style"}
          </Button>
        )}
      </div>

      {/* Search, Filter, and Sort Controls */}
      {hasAnyStyles && (
        <>
          {/* Search + sort row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="text"
                placeholder="Find a style..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-10"
                aria-label="Search styles by name"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 motion-reduce:transition-none"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="ml-auto">
              <SortDropdown
                value={sortOption}
                onChange={setSortOption}
                options={SORT_OPTIONS}
                labels={SORT_LABELS}
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className="flex gap-2"
              role="group"
              aria-label="Filter by type"
            >
              {TYPE_FILTERS.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`min-h-[32px] px-3 py-1.5 text-sm font-medium rounded-full cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                    typeFilter === type
                      ? "bg-coral text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                  }`}
                  aria-pressed={typeFilter === type}
                >
                  {type === "all"
                    ? "All"
                    : type === "presets"
                      ? "Presets"
                      : "Custom"}{" "}
                  <span className="tabular-nums">({typeCounts[type]})</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty State - No Styles */}
      {!hasAnyStyles && (
        <div className="relative overflow-hidden rounded-lg border border-dashed border-border/60 bg-card">
          {/* Stacked paper illustration - suggests templates waiting */}
          <div className="absolute top-8 right-8 sm:right-16">
            <div className="relative">
              {/* Back card */}
              <div className="absolute -rotate-6 w-20 h-28 sm:w-28 sm:h-40 rounded-lg bg-muted/60 border border-border/40" />
              {/* Middle card */}
              <div className="absolute rotate-3 translate-x-2 -translate-y-1 w-20 h-28 sm:w-28 sm:h-40 rounded-lg bg-muted/80 border border-border/40" />
              {/* Front card with color hints */}
              <div className="relative translate-x-4 -translate-y-2 w-20 h-28 sm:w-28 sm:h-40 rounded-lg bg-card border border-border shadow-sm overflow-hidden">
                <div className="absolute top-2 left-2 right-2 h-8 sm:h-12 rounded bg-gradient-to-r from-coral/20 via-teal/20 to-amber-400/20" />
                <div className="absolute bottom-3 left-2 right-2 space-y-1.5">
                  <div className="h-1.5 w-3/4 rounded-full bg-muted" />
                  <div className="h-1.5 w-1/2 rounded-full bg-muted" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-start py-12 px-8 sm:py-16 sm:px-12 max-w-md">
            <div className="flex items-center gap-1.5 mb-4">
              <Palette className="size-5 text-coral" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
              Your creative palette
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Define the colors, typography, and visual style that make your
              therapy resources uniquely yours.
            </p>
            {limits && !limits.canCreate.style ? (
              <Button asChild variant="outline" className="gap-2 cursor-pointer">
                <Link href="/dashboard/settings/billing">
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                  Upgrade to create a style
                </Link>
              </Button>
            ) : (
              <Button
                onClick={handleCreateStyle}
                disabled={isCreating}
                className="btn-coral gap-2"
              >
                <Plus className="size-4" aria-hidden="true" />
                {isCreating ? "Creating..." : "Create Your First Style"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Empty State - No Matching Results */}
      {hasAnyStyles && !hasFilteredResults && isFiltering && (
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search
                className="size-6 text-muted-foreground/50"
                aria-hidden="true"
              />
            </div>
            <h2 className="font-medium text-foreground mb-1">
              No styles found
            </h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
              Try adjusting your search or filters.
            </p>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Style Grid */}
      {hasFilteredResults && (
        <>
          {/* Results count when filtering */}
          {isFiltering && (
            <p
              className="text-sm text-muted-foreground mb-4"
              aria-live="polite"
            >
              Showing {filteredStyles.length} of {styles?.length ?? 0} style
              {(styles?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStyles.map(style => (
                <StyleCard
                  key={style._id}
                  id={style._id}
                  name={style.name}
                  isPreset={style.isPreset}
                  colors={style.colors}
                  typography={style.typography}
                  illustrationStyle={style.illustrationStyle}
                  frames={style.frames as StyleFrames | undefined}
                  updatedAt={style.updatedAt ?? style.createdAt}
                  characterCount={style.characterCount}
                  resourceCount={style.resourceCount}
                />
              ))}
          </div>
        </>
      )}

    </div>
  );
}
