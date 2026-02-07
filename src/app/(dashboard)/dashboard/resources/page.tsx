"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortDropdown } from "@/components/ui/sort-dropdown";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { useListFilters } from "@/hooks/use-list-filters";
import {
  Plus,
  FileStack,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import type {
  EmotionCardContent,
  FlashcardsContent,
  WorksheetContent,
  BoardGameContent,
  CardGameContent,
  FreePromptContent,
  PosterContent,
} from "@/types";

const STATUS_FILTERS = ["all", "draft", "complete"] as const;
const TYPE_FILTERS = [
  "all",
  "emotion_cards",
  "poster",
  "flashcards",
  "worksheet",
  "board_game",
  "card_game",
  "free_prompt",
] as const;
const SORT_OPTIONS = ["newest", "oldest", "name-asc", "name-desc"] as const;

type StatusFilter = typeof STATUS_FILTERS[number];
type TypeFilter = typeof TYPE_FILTERS[number];
type SortOption = typeof SORT_OPTIONS[number];

export default function ResourcesPage() {
  const user = useQuery(api.users.currentUser);
  const resources = useQuery(
    api.resources.getUserResources,
    user?._id ? { userId: user._id } : "skip"
  );
  const {
    search,
    setSearch,
    filter: statusFilter,
    setFilter: setStatusFilter,
    sort: sortOption,
    setSort: setSortOption,
    clearFilters,
    isFiltering: isBaseFiltering,
  } = useListFilters<StatusFilter, SortOption>({
    route: "/dashboard/resources",
    filterParam: "status",
    sortParam: "sort",
    allowedFilters: STATUS_FILTERS,
    allowedSorts: SORT_OPTIONS,
    defaultFilter: "all",
    defaultSort: "newest",
  });

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Count resources by status
  const statusCounts = useMemo(() => {
    if (!resources) return { all: 0, draft: 0, complete: 0 };
    return {
      all: resources.length,
      draft: resources.filter((r) => r.status === "draft").length,
      complete: resources.filter((r) => r.status === "complete").length,
    };
  }, [resources]);

  const typeCounts = useMemo(() => {
    if (!resources) {
      return TYPE_FILTERS.reduce<Record<string, number>>((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {});
    }
    return resources.reduce<Record<string, number>>((acc, resource) => {
      acc[resource.type] = (acc[resource.type] ?? 0) + 1;
      acc.all = (acc.all ?? 0) + 1;
      return acc;
    }, { all: 0 });
  }, [resources]);

  const tagOptions = useMemo(() => {
    if (!resources) return [];
    const tags = new Set<string>();
    resources.forEach((resource) => {
      (resource.tags ?? []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    if (!resources) return [];

    let result = [...resources];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((r) => r.type === typeFilter);
    }

    // Tag filter
    if (tagFilter !== "all") {
      result = result.filter((r) => (r.tags ?? []).includes(tagFilter));
    }

    // Sort
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      case "oldest":
        result.sort((a, b) => a.updatedAt - b.updatedAt);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [resources, search, statusFilter, typeFilter, tagFilter, sortOption]);

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest",
    oldest: "Oldest",
    "name-asc": "Name A-Z",
    "name-desc": "Name Z-A",
  };

  const clearAllFilters = () => {
    clearFilters();
    setTypeFilter("all");
    setTagFilter("all");
  };

  const hasAnyResources = resources && resources.length > 0;
  const hasFilteredResults = filteredResources.length > 0;
  const isFiltering = isBaseFiltering || typeFilter !== "all" || tagFilter !== "all";

  const getItemCount = (resource: any): number => {
    switch (resource.type) {
      case "emotion_cards":
        return (resource.content as EmotionCardContent)?.cards?.length ?? 0;
      case "flashcards":
        return (resource.content as FlashcardsContent)?.cards?.length ?? 0;
      case "worksheet":
        return (resource.content as WorksheetContent)?.blocks?.length ?? 0;
      case "board_game": {
        const grid = (resource.content as BoardGameContent)?.grid;
        if (!grid) return 0;
        return grid.rows * grid.cols;
      }
      case "card_game":
        return (
          (resource.content as CardGameContent)?.cards?.reduce(
            (sum, card) => sum + (card.count ?? 0),
            0,
          ) ?? 0
        );
      case "poster":
        return (resource.content as PosterContent)?.imageAssetKey ? 1 : 0;
      case "free_prompt":
        return (resource.content as FreePromptContent)?.imageAssetKey ? 1 : 0;
      default:
        return resource.assetCount ?? resource.images?.length ?? 0;
    }
  };
  // Loading state
  if (resources === undefined) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" role="status" aria-label="Loading resources">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8" aria-hidden="true">
          <div className="h-10 w-40 bg-muted rounded animate-pulse motion-reduce:animate-none" />
          <div className="h-10 w-44 bg-muted rounded animate-pulse motion-reduce:animate-none" />
        </div>
        {/* Search skeleton */}
        <div className="h-10 w-full bg-muted rounded animate-pulse motion-reduce:animate-none mb-6" aria-hidden="true" />
        {/* Filters skeleton */}
        <div className="flex justify-between mb-6" aria-hidden="true">
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted rounded-full animate-pulse motion-reduce:animate-none" />
            <div className="h-8 w-20 bg-muted rounded-full animate-pulse motion-reduce:animate-none" />
            <div className="h-8 w-24 bg-muted rounded-full animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="h-8 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border bg-card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="size-10 rounded-lg bg-muted animate-pulse motion-reduce:animate-none" />
                <div className="h-5 w-16 bg-muted rounded-full animate-pulse motion-reduce:animate-none" />
              </div>
              <div className="h-5 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundColor: "var(--background)",
          backgroundImage:
            "radial-gradient(circle at 12% 12%, color-mix(in oklch, var(--coral) 12%, transparent), transparent 55%), radial-gradient(circle at 88% 8%, color-mix(in oklch, var(--teal) 10%, transparent), transparent 45%), radial-gradient(circle at 70% 80%, color-mix(in oklch, var(--foreground) 4%, transparent), transparent 50%)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex flex-col gap-3 mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Resource Library
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl font-medium tracking-tight">
                Resources
              </h1>
              {resources && (
                <p className="text-sm text-muted-foreground mt-2">
                  {resources.length} total · {statusCounts.complete} complete ·{" "}
                  {statusCounts.draft} draft
                </p>
              )}
            </div>
            <Button asChild className="btn-coral gap-2">
              <Link href="/dashboard/resources/new">
                <Plus className="size-4" aria-hidden="true" />
                Create Resource
              </Link>
            </Button>
          </div>
        </div>

        {/* Search, Filter, and Sort Controls */}
        {hasAnyResources && (
          <section
            className="mb-8 rounded-2xl border border-border/60 p-4 sm:p-5"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--card) 92%, var(--background) 8%)",
            }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  placeholder="Find a resource..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-10 bg-background/70"
                  aria-label="Search resources by name"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 motion-reduce:transition-none"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Sort
                  </span>
                  <SortDropdown
                    value={sortOption}
                    onChange={setSortOption}
                    options={[...SORT_OPTIONS]}
                    labels={sortLabels}
                  />
                </div>
                {isFiltering && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                  className="min-h-[44px] px-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded-full border border-transparent hover:border-border/60"
                >
                  Clear filters
                </button>
              )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[auto_1fr]">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Status
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter by status"
                >
                  {STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`min-h-[44px] px-3.5 py-1.5 text-sm font-medium rounded-full border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                        statusFilter === status
                          ? "border-coral/40 text-foreground bg-[color-mix(in_oklch,var(--coral)_12%,transparent)]"
                          : "border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted/40"
                      }`}
                      aria-pressed={statusFilter === status}
                    >
                      {status === "all" ? "All" : status === "draft" ? "Draft" : "Complete"}{" "}
                      <span className="tabular-nums">({statusCounts[status]})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Type
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter by type"
                >
                  {TYPE_FILTERS.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTypeFilter(type)}
                      className={`min-h-[44px] px-3.5 py-1.5 text-sm font-medium rounded-full border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                        typeFilter === type
                          ? "border-coral/40 text-foreground bg-[color-mix(in_oklch,var(--coral)_12%,transparent)]"
                          : "border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted/40"
                      }`}
                      aria-pressed={typeFilter === type}
                    >
                      {type === "all"
                        ? "All types"
                        : type
                            .split("_")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}{" "}
                      <span className="tabular-nums">({typeCounts[type] ?? 0})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {tagOptions.length > 0 && (
              <details
                className="mt-4 rounded-xl border border-border/50 bg-background/70 p-3 group"
                open={tagFilter !== "all" || undefined}
              >
                <summary className="cursor-pointer list-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors duration-150 motion-reduce:transition-none">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Tags
                      </span>
                    <span className="text-xs text-muted-foreground/70 max-w-[200px] truncate">
                      {tagFilter === "all"
                        ? `${tagOptions.length} available`
                        : `Selected: ${tagFilter}`}
                    </span>
                    </div>
                    <ChevronDown
                      className="size-3 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </div>
                </summary>
                <div
                  className="mt-3 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter by tag"
                >
                  <button
                    type="button"
                    onClick={() => setTagFilter("all")}
                    className={`min-h-[44px] px-3.5 py-1.5 text-sm font-medium rounded-full border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                      tagFilter === "all"
                        ? "border-coral/40 text-foreground bg-[color-mix(in_oklch,var(--coral)_12%,transparent)]"
                        : "border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted/40"
                    }`}
                    aria-pressed={tagFilter === "all"}
                  >
                    All tags
                  </button>
                  {tagOptions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTagFilter(tag)}
                      className={`min-h-[44px] px-3.5 py-1.5 text-sm font-medium rounded-full border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                        tagFilter === tag
                          ? "border-coral/40 text-foreground bg-[color-mix(in_oklch,var(--coral)_12%,transparent)]"
                          : "border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted/40"
                      }`}
                      aria-pressed={tagFilter === tag}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </section>
        )}

        {/* Empty State - No Resources */}
        {!hasAnyResources && (
          <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="size-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
                <FileStack className="size-6 text-coral/70" aria-hidden="true" />
              </div>
              <h2 className="font-medium text-foreground mb-1">
                Ready to create your first resource?
              </h2>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
                Choose a style and build print-ready materials in a few minutes.
              </p>
              <Button asChild className="btn-coral gap-2">
                <Link href="/dashboard/resources/new">
                  <Plus className="size-4" aria-hidden="true" />
                  Create Resource
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State - No Matching Results */}
        {hasAnyResources && !hasFilteredResults && isFiltering && (
          <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Search className="size-6 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <h2 className="font-medium text-foreground mb-1">
                No resources found
              </h2>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <X className="size-4" aria-hidden="true" />
                Clear filters
              </Button>
            </div>
          </div>
        )}

        {/* Resource Grid */}
        {hasFilteredResults && (
          <>
            {/* Results count when filtering */}
            {isFiltering && (
              <p className="text-sm text-muted-foreground mb-4" aria-live="polite">
                Showing {filteredResources.length} of {resources?.length ?? 0} resource
                {(resources?.length ?? 0) !== 1 ? "s" : ""}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  id={resource._id}
                  name={resource.name}
                  type={resource.type}
                  status={resource.status}
                  itemCount={getItemCount(resource)}
                  updatedAt={resource.updatedAt}
                  thumbnailUrl={resource.thumbnailUrl}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
