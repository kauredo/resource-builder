"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortDropdown } from "@/components/ui/sort-dropdown";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { BatchExportBar } from "@/components/resource/BatchExportBar";
import { useListFilters } from "@/hooks/use-list-filters";
import { useBatchExport } from "@/hooks/use-batch-export";
import {
  Plus,
  FileStack,
  Search,
  X,
  Tag,
  ListChecks,
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
  "book",
  "behavior_chart",
  "visual_schedule",
  "certificate",
  "coloring_pages",
] as const;
const SORT_OPTIONS = ["newest", "oldest", "name-asc", "name-desc"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type TypeFilter = (typeof TYPE_FILTERS)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "All",
  emotion_cards: "Emotion Cards",
  poster: "Posters",
  flashcards: "Flashcards",
  worksheet: "Worksheets",
  board_game: "Board Games",
  card_game: "Card Games",
  free_prompt: "Free Prompt",
  book: "Books",
  behavior_chart: "Behavior Charts",
  visual_schedule: "Visual Schedules",
  certificate: "Certificates",
  coloring_pages: "Coloring Pages",
};

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
};

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

  const {
    isSelectMode,
    selectedIds,
    isExporting,
    exportProgress,
    enterSelectMode,
    exitSelectMode,
    toggleSelection,
    selectAll,
    deselectAll,
    startExport,
    cancelExport,
  } = useBatchExport();

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
    return resources.reduce<Record<string, number>>(
      (acc, resource) => {
        acc[resource.type] = (acc[resource.type] ?? 0) + 1;
        acc.all = (acc.all ?? 0) + 1;
        return acc;
      },
      { all: 0 }
    );
  }, [resources]);

  const tagOptions = useMemo(() => {
    if (!resources) return [];
    const tags = new Set<string>();
    resources.forEach((resource) => {
      (resource.tags ?? []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const tagDropdownOptions = useMemo(
    () => ["all", ...tagOptions],
    [tagOptions]
  );
  const tagDropdownLabels = useMemo(() => {
    const labels: Record<string, string> = { all: "All" };
    tagOptions.forEach((t) => { labels[t] = t; });
    return labels;
  }, [tagOptions]);

  const filteredResources = useMemo(() => {
    if (!resources) return [];

    let result = [...resources];

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((r) => r.type === typeFilter);
    }

    if (tagFilter !== "all") {
      result = result.filter((r) => (r.tags ?? []).includes(tagFilter));
    }

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

  const clearAllFilters = () => {
    clearFilters();
    setTypeFilter("all");
    setTagFilter("all");
  };

  const hasAnyResources = resources && resources.length > 0;
  const hasFilteredResults = filteredResources.length > 0;
  const isFiltering =
    isBaseFiltering || typeFilter !== "all" || tagFilter !== "all";

  // Only show type tabs for types that actually have resources
  const activeTypes = useMemo(() => {
    return TYPE_FILTERS.filter(
      (type) => type === "all" || (typeCounts[type] ?? 0) > 0
    );
  }, [typeCounts]);

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
            0
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

  if (resources === undefined) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        role="status"
        aria-label="Loading resources"
      >
        <div
          className="flex items-center justify-between gap-4 mb-8"
          aria-hidden="true"
        >
          <div className="h-9 w-36 bg-muted rounded animate-pulse motion-reduce:animate-none" />
          <div className="h-9 w-40 bg-muted rounded animate-pulse motion-reduce:animate-none" />
        </div>
        <div
          className="h-10 w-full max-w-sm bg-muted rounded animate-pulse motion-reduce:animate-none mb-6"
          aria-hidden="true"
        />
        <div className="flex gap-2 mb-8" aria-hidden="true">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          aria-hidden="true"
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card">
              <div className="aspect-[4/3] bg-muted animate-pulse motion-reduce:animate-none rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header: title + actions */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-3xl font-medium tracking-tight">
          Library
        </h1>
        <div className="flex items-center gap-2">
          {hasAnyResources && (
            <Button
              variant="outline"
              onClick={isSelectMode ? exitSelectMode : enterSelectMode}
              className="gap-2"
              aria-pressed={isSelectMode}
            >
              <ListChecks className="size-4" aria-hidden="true" />
              {isSelectMode ? "Done" : "Select"}
            </Button>
          )}
          {!isSelectMode && (
            <Button asChild className="btn-coral gap-2">
              <Link href="/dashboard/resources/new">
                <Plus className="size-4" aria-hidden="true" />
                Create
              </Link>
            </Button>
          )}
        </div>
      </div>

      {hasAnyResources && (
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
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10"
                aria-label="Search resources by name"
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

            <div className="ml-auto flex items-center gap-2">
              {tagOptions.length > 0 && (
                <SortDropdown
                  value={tagFilter}
                  onChange={setTagFilter}
                  options={tagDropdownOptions}
                  labels={tagDropdownLabels}
                  prefix="Tag"
                  icon={Tag}
                />
              )}

              <SortDropdown
                value={sortOption}
                onChange={setSortOption}
                options={[...SORT_OPTIONS]}
                labels={SORT_LABELS}
              />
            </div>
          </div>

          {/* Type tabs + status + clear — single row */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {/* Type tabs — only shown when 3+ types exist */}
            {activeTypes.length > 2 && (
              <>
                <nav
                  className="flex items-center gap-1 overflow-x-auto"
                  role="tablist"
                  aria-label="Filter by resource type"
                >
                  {activeTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTypeFilter(type)}
                      role="tab"
                      aria-selected={typeFilter === type}
                      className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                        typeFilter === type
                          ? "bg-foreground text-background font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {TYPE_LABELS[type]}
                      {type !== "all" && (
                        <span className="ml-1.5 tabular-nums text-xs opacity-60">
                          {typeCounts[type] ?? 0}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                <div
                  className="h-5 w-px bg-border/60 mx-1 hidden sm:block"
                  aria-hidden="true"
                />
              </>
            )}

            {/* Status pills */}
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Filter by status"
            >
              {(["draft", "complete"] as const).map((status) =>
                statusCounts[status] > 0 ? (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        statusFilter === status ? "all" : status
                      )
                    }
                    aria-pressed={statusFilter === status}
                    className={`whitespace-nowrap px-2.5 py-1 text-xs rounded-full cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                      statusFilter === status
                        ? status === "complete"
                          ? "bg-[color-mix(in_oklch,var(--teal)_14%,transparent)] text-teal font-medium"
                          : "bg-[color-mix(in_oklch,var(--coral)_12%,transparent)] text-coral font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {status === "draft" ? "Drafts" : "Complete"}
                    <span className="ml-1 tabular-nums">
                      {statusCounts[status]}
                    </span>
                  </button>
                ) : null
              )}
            </div>

            {/* Clear filters */}
            {isFiltering && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded px-2 py-1"
              >
                <X className="size-3" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </>
      )}

      {/* Empty State - No Resources */}
      {!hasAnyResources && (
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="size-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
              <FileStack
                className="size-6 text-coral/70"
                aria-hidden="true"
              />
            </div>
            <h2 className="font-medium text-foreground mb-1">
              Ready to create your first resource?
            </h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
              Choose a format and build print-ready materials in minutes.
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
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search
                className="size-6 text-muted-foreground/50"
                aria-hidden="true"
              />
            </div>
            <h2 className="font-medium text-foreground mb-1">
              No resources found
            </h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
              Try adjusting your search or filters.
            </p>
            <Button variant="outline" onClick={clearAllFilters} className="gap-2">
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Resource Grid */}
      {hasFilteredResults && (
        <>
          {isFiltering && (
            <p
              className="text-sm text-muted-foreground mb-4"
              aria-live="polite"
            >
              {filteredResources.length} of {resources?.length ?? 0} resource
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
                selectable={isSelectMode}
                selected={selectedIds.has(resource._id)}
                onSelect={toggleSelection}
              />
            ))}
          </div>

          {/* Bottom spacer for batch bar */}
          {isSelectMode && (
            <div className="h-20" aria-hidden="true" />
          )}
        </>
      )}

      {/* Batch export floating bar */}
      {isSelectMode && (
        <BatchExportBar
          selectedCount={selectedIds.size}
          totalCount={filteredResources.length}
          isExporting={isExporting}
          exportProgress={exportProgress}
          onSelectAll={() => selectAll(filteredResources.map((r) => r._id))}
          onDeselectAll={deselectAll}
          onExport={() => startExport(user?.subscription !== "pro")}
          onCancelExport={cancelExport}
          onExit={exitSelectMode}
        />
      )}
    </div>
  );
}
