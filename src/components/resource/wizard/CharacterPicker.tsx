"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Check,
  User,
  UserX,
  Plus,
  AlertCircle,
  Palette,
  Users,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CharacterSelection, StylePreset } from "@/types";

interface CharacterPickerProps {
  selection: CharacterSelection | null;
  onChange: (selection: CharacterSelection | null) => void;
  styleId: Id<"styles"> | null;
  userId: Id<"users">;
  /** Allow per-item character mode (for multi-item resource types) */
  allowPerItem?: boolean;
  onStyleChange?: (styleId: Id<"styles">, preset: StylePreset) => void;
}

export function CharacterPicker({
  selection,
  onChange,
  styleId,
  userId,
  allowPerItem = true,
  onStyleChange,
}: CharacterPickerProps) {
  const [dismissedStyleHint, setDismissedStyleHint] = useState(false);

  const characters = useQuery(
    api.characters.getUserCharactersWithThumbnails,
    { userId },
  );

  const groups = useQuery(
    api.characterGroups.getUserGroups,
    { userId },
  );

  // Get the first selected character's linked style (if different from current)
  const selectedCharId =
    selection?.characterIds?.[0] as Id<"characters"> | undefined;
  const selectedChar = characters?.find((c) => c._id === selectedCharId);
  const charStyleId = selectedChar?.styleId;
  const charStyle = useQuery(
    api.styles.getStyle,
    charStyleId && charStyleId !== styleId ? { styleId: charStyleId } : "skip",
  );
  const showStyleHint =
    !!charStyle && charStyleId !== styleId && !dismissedStyleHint;

  const handleToggleCharacter = (charId: Id<"characters">) => {
    setDismissedStyleHint(false);

    if (!selection) {
      // First character selected
      onChange({ mode: "resource", characterIds: [charId] });
      return;
    }

    const isSelected = selection.characterIds.includes(charId);

    if (selection.mode === "resource") {
      if (isSelected) {
        // Deselect → no character
        onChange(null);
      } else {
        // Replace selection
        onChange({ mode: "resource", characterIds: [charId] });
      }
    } else {
      // per_item mode — toggle in list
      if (isSelected) {
        const remaining = selection.characterIds.filter((id) => id !== charId);
        if (remaining.length === 0) {
          onChange(null);
        } else {
          onChange({ ...selection, characterIds: remaining });
        }
      } else {
        onChange({
          ...selection,
          characterIds: [...selection.characterIds, charId],
        });
      }
    }
  };

  const handleClearSelection = () => {
    setDismissedStyleHint(false);
    onChange(null);
  };

  const handleToggleMode = () => {
    if (!selection) return;
    const newMode = selection.mode === "resource" ? "per_item" : "resource";
    const newIds =
      newMode === "resource"
        ? [selection.characterIds[0]]
        : selection.characterIds;
    onChange({ mode: newMode, characterIds: newIds });
  };

  if (!characters) return null;
  if (characters.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-base font-medium">Character (optional)</Label>
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-6 text-center">
          <User
            className="size-8 text-muted-foreground/50 mx-auto mb-2"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground mb-3">
            No characters yet. Create one for consistent visuals across
            resources.
          </p>
          <Link
            href="/dashboard/characters"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-coral hover:text-coral/80 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Create a Character
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Character (optional)</Label>
        {allowPerItem && selection && (
          <button
            type="button"
            onClick={handleToggleMode}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            <Users className="size-3" aria-hidden="true" />
            {selection.mode === "resource"
              ? "Use different characters per item"
              : "Use one character for all"}
          </button>
        )}
      </div>

      {/* No Character Option */}
      <button
        type="button"
        onClick={handleClearSelection}
        className={cn(
          "w-full flex items-center gap-4 p-3 rounded-xl border-2 text-left cursor-pointer",
          "transition-colors duration-150 motion-reduce:transition-none hover:border-border hover:bg-muted/30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
          !selection
            ? "border-foreground/15 bg-muted/20"
            : "border-border bg-card",
        )}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-muted">
          <UserX
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-muted-foreground">
            No character
          </span>
        </div>
        {!selection && (
          <div className="w-5 h-5 bg-foreground/15 rounded-full flex items-center justify-center shrink-0">
            <Check
              className="size-3 text-foreground/50"
              aria-hidden="true"
            />
          </div>
        )}
      </button>

      {/* Character list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {characters.map((character) => {
          const isSelected =
            selection?.characterIds.includes(character._id) ?? false;
          return (
            <button
              key={character._id}
              type="button"
              onClick={() => handleToggleCharacter(character._id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 text-left cursor-pointer",
                "transition-colors duration-150 motion-reduce:transition-none hover:border-teal/40 hover:bg-teal/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
                isSelected
                  ? "border-teal bg-teal/5"
                  : "border-border bg-card",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                  isSelected ? "bg-teal/20" : "bg-muted",
                )}
              >
                {character.thumbnailUrl ? (
                  <img
                    src={character.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    className={cn(
                      "size-5",
                      isSelected ? "text-teal" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{character.name}</span>
                {character.personality && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {character.personality}
                  </p>
                )}
              </div>
              {isSelected && (
                <div className="w-5 h-5 bg-teal rounded-full flex items-center justify-center shrink-0">
                  <Check
                    className="size-3 text-white"
                    aria-hidden="true"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Group quick-select (per_item mode or initial selection) */}
      {allowPerItem && groups && groups.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Quick select from group
          </p>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => {
              const allSelected =
                selection?.mode === "per_item" &&
                group.characterIds.every((id) =>
                  selection.characterIds.includes(id),
                );
              return (
                <button
                  key={group._id}
                  type="button"
                  onClick={() => {
                    onChange({
                      mode: "per_item",
                      characterIds: [...group.characterIds],
                    });
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer",
                    "transition-colors duration-150 motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
                    allSelected
                      ? "border-teal bg-teal/10 text-teal"
                      : "border-border bg-card text-muted-foreground hover:border-teal/40 hover:text-foreground",
                  )}
                >
                  <FolderOpen className="size-3" aria-hidden="true" />
                  {group.name}
                  <span className="text-[10px] opacity-60">
                    ({group.characterIds.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Style hint */}
      {showStyleHint && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-teal/5 border border-teal/20">
          <Palette
            className="size-4 text-teal shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-medium">{selectedChar?.name}</span> is
              linked to the{" "}
              <span className="font-medium">{charStyle?.name}</span> style.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Switch to it for the best visual match.
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => {
                  if (charStyle && charStyleId && onStyleChange) {
                    onStyleChange(charStyleId, {
                      name: charStyle.name,
                      colors: charStyle.colors,
                      typography: charStyle.typography,
                      illustrationStyle: charStyle.illustrationStyle,
                    });
                    setDismissedStyleHint(true);
                  }
                }}
                className="gap-1.5 bg-teal text-white hover:bg-teal/90 text-xs"
              >
                <Check className="size-3" aria-hidden="true" />
                Use {charStyle?.name}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissedStyleHint(true)}
                className="text-xs text-muted-foreground"
              >
                Keep current
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stale prompt fragment warning */}
      {selectedChar &&
        (() => {
          if (
            !selectedChar.promptFragment?.trim() ||
            selectedChar.promptFragmentUpdatedAt === undefined ||
            selectedChar.updatedAt === undefined ||
            selectedChar.updatedAt <= selectedChar.promptFragmentUpdatedAt
          )
            return null;
          return (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <AlertCircle
                className="size-3.5 text-amber-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs text-amber-800">
                <span className="font-medium">
                  {selectedChar.name}&apos;s
                </span>{" "}
                visual description may be outdated.{" "}
                <Link
                  href={`/dashboard/characters/${selectedChar._id}`}
                  target="_blank"
                  className="underline underline-offset-2 hover:text-amber-900 transition-colors"
                >
                  Update it
                </Link>{" "}
                for the most consistent results.
              </p>
            </div>
          );
        })()}
    </div>
  );
}
