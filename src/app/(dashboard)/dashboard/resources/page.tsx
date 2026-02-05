"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResourceCard } from "@/components/resource/ResourceCard";
import {
  Plus,
  FileStack,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

type StatusFilter = "all" | "draft" | "complete";
type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

const SORT_OPTIONS: SortOption[] = ["newest", "oldest", "name-asc", "name-desc"];

export default function ResourcesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useQuery(api.users.currentUser);
  const resources = useQuery(
    api.resources.getUserResources,
    user?._id ? { userId: user._id } : "skip"
  );

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) || "all"
  );
  const [sortOption, setSortOption] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "newest"
  );
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync state to URL
  const updateURL = useCallback((newSearch: string, newStatus: StatusFilter, newSort: SortOption) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set("q", newSearch.trim());
    if (newStatus !== "all") params.set("status", newStatus);
    if (newSort !== "newest") params.set("sort", newSort);

    const queryString = params.toString();
    router.replace(`/dashboard/resources${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [router]);

  // Update URL when filters change (debounced for search)
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateURL(search, statusFilter, sortOption);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, sortOption, updateURL]);

  // Count resources by status
  const statusCounts = useMemo(() => {
    if (!resources) return { all: 0, draft: 0, complete: 0 };
    return {
      all: resources.length,
      draft: resources.filter((r) => r.status === "draft").length,
      complete: resources.filter((r) => r.status === "complete").length,
    };
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
  }, [resources, search, statusFilter, sortOption]);

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest",
    oldest: "Oldest",
    "name-asc": "Name A-Z",
    "name-desc": "Name Z-A",
  };

  const hasAnyResources = resources && resources.length > 0;
  const hasFilteredResults = filteredResources.length > 0;
  const isFiltering = search.trim() !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortOption("newest");
  };

  // Dropdown keyboard navigation
  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!sortDropdownOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setSortDropdownOpen(true);
        setFocusedOptionIndex(SORT_OPTIONS.indexOf(sortOption));
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedOptionIndex((prev) =>
          prev < SORT_OPTIONS.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedOptionIndex((prev) =>
          prev > 0 ? prev - 1 : SORT_OPTIONS.length - 1
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedOptionIndex >= 0) {
          setSortOption(SORT_OPTIONS[focusedOptionIndex]);
          setSortDropdownOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case "Escape":
        e.preventDefault();
        setSortDropdownOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setSortDropdownOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-serif text-4xl font-medium tracking-tight">
          Resources
        </h1>
        <Button asChild className="btn-coral gap-2">
          <Link href="/dashboard/resources/new/emotion-cards">
            <Plus className="size-4" aria-hidden="true" />
            Create Emotion Cards
          </Link>
        </Button>
      </div>

      {/* Search, Filter, and Sort Controls */}
      {hasAnyResources && (
        <>
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Find a deck..."
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
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Pills and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Status Filter Pills */}
            <div className="flex gap-2" role="group" aria-label="Filter by status">
              {(["all", "draft", "complete"] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`min-h-[32px] px-3 py-1.5 text-sm font-medium rounded-full cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                    statusFilter === status
                      ? "bg-coral text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                  }`}
                  aria-pressed={statusFilter === status}
                >
                  {status === "all" ? "All" : status === "draft" ? "Draft" : "Complete"}{" "}
                  <span className="tabular-nums">({statusCounts[status]})</span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => {
                  setSortDropdownOpen(!sortDropdownOpen);
                  if (!sortDropdownOpen) {
                    setFocusedOptionIndex(SORT_OPTIONS.indexOf(sortOption));
                  }
                }}
                onKeyDown={handleDropdownKeyDown}
                className="inline-flex items-center gap-2 min-h-[32px] px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                aria-haspopup="listbox"
                aria-expanded={sortDropdownOpen}
              >
                Sort: {sortLabels[sortOption]}
                <ChevronDown className={`size-4 transition-transform duration-150 motion-reduce:transition-none ${sortDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {sortDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg py-1 z-10"
                  role="listbox"
                  aria-label="Sort options"
                  aria-activedescendant={focusedOptionIndex >= 0 ? `sort-option-${SORT_OPTIONS[focusedOptionIndex]}` : undefined}
                  onKeyDown={handleDropdownKeyDown}
                >
                  {SORT_OPTIONS.map((value, index) => (
                    <button
                      key={value}
                      id={`sort-option-${value}`}
                      type="button"
                      onClick={() => {
                        setSortOption(value);
                        setSortDropdownOpen(false);
                        triggerRef.current?.focus();
                      }}
                      onMouseEnter={() => setFocusedOptionIndex(index)}
                      className={`w-full min-h-[36px] px-3 py-2 text-sm text-left cursor-pointer transition-colors duration-150 motion-reduce:transition-none ${
                        focusedOptionIndex === index ? "bg-muted border-l-2 border-coral" : "border-l-2 border-transparent"
                      } ${sortOption === value ? "text-coral font-medium" : "text-foreground"}`}
                      role="option"
                      aria-selected={sortOption === value}
                    >
                      {sortLabels[value]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty State - No Resources */}
      {!hasAnyResources && (
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
              <FileStack className="size-6 text-coral/70" aria-hidden="true" />
            </div>
            <h2 className="font-medium text-foreground mb-1">
              Ready to create your first deck?
            </h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
              Choose a style, pick emotions, and AI generates matching
              illustrations — all in a few minutes.
            </p>
            <Button asChild className="btn-coral gap-2">
              <Link href="/dashboard/resources/new/emotion-cards">
                <Plus className="size-4" aria-hidden="true" />
                Create Emotion Cards
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
              onClick={clearFilters}
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
              Showing {filteredResources.length} of {resources?.length ?? 0} resource{(resources?.length ?? 0) !== 1 ? "s" : ""}
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
                cardCount={resource.images.length}
                updatedAt={resource.updatedAt}
                thumbnailUrl={resource.thumbnailUrl}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
