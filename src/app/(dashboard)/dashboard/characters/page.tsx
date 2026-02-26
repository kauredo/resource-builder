"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortDropdown } from "@/components/ui/sort-dropdown";
import { CharacterCard } from "@/components/character/CharacterCard";
import { GroupCard } from "@/components/character/GroupCard";
import { CreateGroupDialog } from "@/components/character/CreateGroupDialog";
import { Plus, Users, Search, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";
type TabValue = "characters" | "groups";

const SORT_OPTIONS: SortOption[] = ["newest", "oldest", "name-asc", "name-desc"];
const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
};

export default function CharactersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useQuery(api.users.currentUser);
  const characters = useQuery(
    api.characters.getUserCharactersWithThumbnails,
    user?._id ? { userId: user._id } : "skip"
  );
  const groups = useQuery(
    api.characterGroups.getUserGroupsWithThumbnails,
    user?._id ? { userId: user._id } : "skip"
  );
  const limits = useQuery(api.users.getSubscriptionLimits);
  const createCharacter = useMutation(api.characters.createCharacter);

  // Initialize state from URL params
  const [tab, setTab] = useState<TabValue>(
    (searchParams.get("tab") as TabValue) || "characters"
  );
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [sortOption, setSortOption] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "newest"
  );
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Sync state to URL
  const updateURL = useCallback(
    (newTab: TabValue, newSearch: string, newSort: SortOption) => {
      const params = new URLSearchParams();
      if (newTab !== "characters") params.set("tab", newTab);
      if (newSearch.trim()) params.set("q", newSearch.trim());
      if (newSort !== "newest") params.set("sort", newSort);

      const queryString = params.toString();
      router.replace(
        `/dashboard/characters${queryString ? `?${queryString}` : ""}`,
        { scroll: false }
      );
    },
    [router]
  );

  // Update URL when filters change (debounced for search)
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateURL(tab, search, sortOption);
    }, 300);
    return () => clearTimeout(timeout);
  }, [tab, search, sortOption, updateURL]);

  // Filter and sort characters
  const filteredCharacters = useMemo(() => {
    if (!characters) return [];

    let result = [...characters];

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.personality.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      );
    }

    switch (sortOption) {
      case "newest":
        result.sort(
          (a, b) =>
            (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            (a.updatedAt ?? a.createdAt) - (b.updatedAt ?? b.createdAt)
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
  }, [characters, search, sortOption]);

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    if (!groups) return [];

    let result = [...groups];

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(searchLower) ||
          g.description.toLowerCase().includes(searchLower)
      );
    }

    switch (sortOption) {
      case "newest":
        result.sort(
          (a, b) =>
            (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            (a.updatedAt ?? a.createdAt) - (b.updatedAt ?? b.createdAt)
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
  }, [groups, search, sortOption]);

  const isCharactersTab = tab === "characters";
  const hasAnyItems = isCharactersTab
    ? characters && characters.length > 0
    : groups && groups.length > 0;
  const filteredItems = isCharactersTab ? filteredCharacters : filteredGroups;
  const hasFilteredResults = filteredItems.length > 0;
  const isFiltering = search.trim() !== "";
  const totalCount = isCharactersTab
    ? characters?.length ?? 0
    : groups?.length ?? 0;

  const clearFilters = () => {
    setSearch("");
    setSortOption("newest");
  };

  const handleCreateCharacter = async () => {
    if (!user?._id) return;
    setIsCreating(true);
    try {
      const newCharacterId = await createCharacter({
        userId: user._id,
        name: "New Character",
      });
      router.push(`/dashboard/characters/${newCharacterId}`);
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
        console.error("Failed to create character:", error);
      }
      setIsCreating(false);
    }
  };

  // Loading state
  if (characters === undefined) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        role="status"
        aria-label="Loading characters"
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          aria-hidden="true"
        >
          <div className="h-10 w-40 bg-muted rounded animate-pulse motion-reduce:animate-none" />
          <div className="h-10 w-44 bg-muted rounded animate-pulse motion-reduce:animate-none" />
        </div>
        <div
          className="h-10 w-full bg-muted rounded animate-pulse motion-reduce:animate-none mb-6"
          aria-hidden="true"
        />
        <div className="flex justify-end mb-6" aria-hidden="true">
          <div className="h-8 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none" />
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          aria-hidden="true"
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="h-0.5 bg-teal/20" />
              <div className="px-4 py-3">
                <div className="h-5 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              </div>
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
          Characters
        </h1>
        <div className="flex items-center gap-2">
          {tab === "groups" ? (
            <Button
              onClick={() => setShowCreateGroup(true)}
              className="gap-2 bg-teal text-white hover:bg-teal/90"
            >
              <Plus className="size-4" aria-hidden="true" />
              Create Group
            </Button>
          ) : limits && !limits.canCreate.character ? (
            <Button asChild variant="outline" className="gap-2 cursor-pointer">
              <Link href="/dashboard/settings/billing">
                <ArrowUpRight className="size-4" aria-hidden="true" />
                Upgrade to create more
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handleCreateCharacter}
              disabled={isCreating}
              className="btn-coral gap-2"
            >
              <Plus className="size-4" aria-hidden="true" />
              Create Character
            </Button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border/40 w-fit mb-6"
        role="tablist"
        aria-label="View"
      >
        <button
          type="button"
          role="tab"
          id="tab-characters"
          aria-selected={tab === "characters"}
          aria-controls="tabpanel-characters"
          onClick={() => setTab("characters")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md cursor-pointer",
            "transition-colors duration-150 motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
            tab === "characters"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Characters
          {characters && characters.length > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              {characters.length}
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          id="tab-groups"
          aria-selected={tab === "groups"}
          aria-controls="tabpanel-groups"
          onClick={() => setTab("groups")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md cursor-pointer",
            "transition-colors duration-150 motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
            tab === "groups"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Groups
          {groups && groups.length > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              {groups.length}
            </span>
          )}
        </button>
      </div>

      {/* Search and Sort Controls */}
      {hasAnyItems && (
        <>
          <div className="relative mb-6">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder={
                isCharactersTab ? "Find a character..." : "Find a group..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
              aria-label={`Search ${isCharactersTab ? "characters" : "groups"}`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 motion-reduce:transition-none"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {isFiltering
                ? `${filteredItems.length} of ${totalCount} ${isCharactersTab ? "characters" : "groups"}`
                : `${totalCount} ${isCharactersTab ? "character" : "group"}${totalCount !== 1 ? "s" : ""}`}
            </p>
            <SortDropdown
              value={sortOption}
              onChange={setSortOption}
              options={SORT_OPTIONS}
              labels={SORT_LABELS}
            />
          </div>
        </>
      )}

      {/* Characters Tab Content */}
      {isCharactersTab && (
        <div role="tabpanel" id="tabpanel-characters" aria-labelledby="tab-characters">
          {/* Empty State - No Characters */}
          {!hasAnyItems && (
            <div className="relative overflow-hidden rounded-lg border border-dashed border-border/60 bg-card">
              <div className="absolute top-6 right-6 sm:top-8 sm:right-16" aria-hidden="true">
                <div className="relative w-24 h-28 sm:w-32 sm:h-36">
                  <div className="absolute top-0 left-2 sm:left-4 w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-muted/40 border border-border/30 -rotate-6">
                    <div className="size-8 sm:size-10 rounded-full bg-muted/60 mx-auto mt-3 sm:mt-4" />
                  </div>
                  <div className="absolute top-1 left-4 sm:left-6 w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-muted/60 border border-border/40 rotate-3">
                    <div className="size-8 sm:size-10 rounded-full bg-muted/80 mx-auto mt-3 sm:mt-4" />
                  </div>
                  <div className="absolute top-2 left-6 sm:left-8 w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-card border border-border shadow-sm">
                    <div className="size-8 sm:size-10 rounded-full border-2 border-dashed border-teal/30 mx-auto mt-3 sm:mt-4 flex items-center justify-center">
                      <Users className="size-3.5 sm:size-4 text-teal/40" />
                    </div>
                    <div className="mx-3 mt-2 space-y-1">
                      <div className="h-1.5 w-3/4 rounded-full bg-muted" />
                      <div className="h-1 w-1/2 rounded-full bg-muted" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col items-start py-12 px-8 sm:py-16 sm:px-12 max-w-md">
                <div className="flex items-center gap-1.5 mb-4">
                  <Users className="size-5 text-teal" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
                  Your recurring characters
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Create characters that appear consistently across your therapy
                  resources. Define their look once, use them everywhere.
                </p>
                {limits && !limits.canCreate.character ? (
                  <Button asChild variant="outline" className="gap-2 cursor-pointer">
                    <Link href="/dashboard/settings/billing">
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                      Upgrade to create a character
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateCharacter}
                    disabled={isCreating}
                    className="btn-coral gap-2"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Create Your First Character
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* No Matching Results */}
          {hasAnyItems && !hasFilteredResults && isFiltering && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground mb-4">
                No characters match &ldquo;{search}&rdquo;
              </p>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear filters
              </Button>
            </div>
          )}

          {/* Character Grid */}
          {hasFilteredResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCharacters.map((character) => (
                <CharacterCard
                  key={character._id}
                  id={character._id}
                  name={character.name}
                  personality={character.personality}
                  referenceImageCount={character.referenceImages.length}
                  thumbnailUrl={character.thumbnailUrl}
                  updatedAt={character.updatedAt ?? character.createdAt}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Groups Tab Content */}
      {!isCharactersTab && (
        <div role="tabpanel" id="tabpanel-groups" aria-labelledby="tab-groups">
          {/* Empty State - No Groups */}
          {!hasAnyItems && (
            <div className="relative overflow-hidden rounded-lg border border-dashed border-border/60 bg-card">
              <div className="relative flex flex-col items-start py-12 px-8 sm:py-16 sm:px-12 max-w-md">
                <div className="flex items-center gap-1.5 mb-4">
                  <Users className="size-5 text-teal" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
                  Character groups
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Generate a group of related characters with AI. They share a
                  theme but each has a unique look and personality.
                </p>
                <Button
                  onClick={() => setShowCreateGroup(true)}
                  className="gap-2 bg-teal text-white hover:bg-teal/90"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Create Your First Group
                </Button>
              </div>
            </div>
          )}

          {/* No Matching Results */}
          {hasAnyItems && !hasFilteredResults && isFiltering && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground mb-4">
                No groups match &ldquo;{search}&rdquo;
              </p>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear filters
              </Button>
            </div>
          )}

          {/* Groups Grid */}
          {hasFilteredResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group._id}
                  id={group._id}
                  name={group.name}
                  description={group.description}
                  characterCount={group.characterIds.length}
                  thumbnails={group.thumbnails}
                  updatedAt={group.updatedAt ?? group.createdAt}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Group Dialog */}
      {user && (
        <CreateGroupDialog
          open={showCreateGroup}
          onOpenChange={setShowCreateGroup}
          userId={user._id}
        />
      )}
    </div>
  );
}
