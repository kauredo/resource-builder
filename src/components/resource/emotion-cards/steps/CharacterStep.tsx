"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Check, User, UserX, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardState } from "../EmotionCardsWizard";

interface CharacterStepProps {
  characterId: Id<"characters"> | null;
  onUpdate: (updates: Partial<WizardState>) => void;
}

export function CharacterStep({
  characterId,
  onUpdate,
}: CharacterStepProps) {
  const user = useQuery(api.users.currentUser);
  const characters = useQuery(
    api.characters.getUserCharactersWithThumbnails,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]" role="status" aria-label="Loading">
        <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Optionally assign a character to appear in all your emotion cards. This helps maintain
          consistency across your deck.
        </p>
      </div>

      {/* No Character Option */}
      <button
        type="button"
        onClick={() => onUpdate({ characterId: null })}
        className={cn(
          "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left cursor-pointer",
          "transition-colors duration-150 hover:border-border hover:bg-muted/30",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
          characterId === null
            ? "border-foreground/15 bg-muted/20"
            : "border-border bg-card"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            characterId === null ? "bg-muted" : "bg-muted"
          )}
        >
          <UserX
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-muted-foreground">No character</span>
          <p className="text-sm text-muted-foreground/70">
            Generate unique illustrations for each emotion.
          </p>
        </div>
        {characterId === null && (
          <div className="w-6 h-6 bg-foreground/15 rounded-full flex items-center justify-center shrink-0">
            <Check className="size-4 text-foreground/50" aria-hidden="true" />
          </div>
        )}
      </button>

      {/* Character Options */}
      {characters && characters.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Your Characters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characters.map((character) => {
              const isSelected = characterId === character._id;
              return (
                <button
                  key={character._id}
                  type="button"
                  onClick={() => onUpdate({ characterId: character._id })}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 text-left cursor-pointer",
                    "transition-colors duration-150 hover:border-teal/40 hover:bg-teal/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
                    isSelected
                      ? "border-teal bg-teal/5"
                      : "border-border bg-card"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden",
                      isSelected ? "bg-teal/20" : "bg-muted"
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
                          "size-6",
                          isSelected ? "text-teal" : "text-muted-foreground"
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{character.name}</span>
                    {character.personality && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {character.personality}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-teal rounded-full flex items-center justify-center shrink-0">
                      <Check className="size-4 text-white" aria-hidden="true" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stale visual description warning */}
      {characterId && characters && (() => {
        const selected = characters.find(c => c._id === characterId);
        if (
          !selected ||
          !selected.promptFragment.trim() ||
          selected.promptFragmentUpdatedAt === undefined ||
          selected.updatedAt === undefined ||
          selected.updatedAt <= selected.promptFragmentUpdatedAt
        ) return null;
        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
            <AlertCircle className="size-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-amber-800">
              <p>
                <span className="font-medium">{selected.name}&apos;s</span> visual
                description may be outdated.{" "}
                <Link
                  href={`/dashboard/characters/${selected._id}`}
                  target="_blank"
                  className="underline underline-offset-2 hover:text-amber-900 transition-colors"
                >
                  Update it
                </Link>{" "}
                for the most consistent results.
              </p>
            </div>
          </div>
        );
      })()}

      {/* No characters available */}
      {characters && characters.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-8 text-center">
          <User className="size-10 text-muted-foreground/50 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-medium text-foreground/80 mb-1">No characters yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create characters to use them consistently across your resources.
          </p>
          <Link
            href="/dashboard/characters"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-coral hover:text-coral/80 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Create a Character
          </Link>
        </div>
      )}
    </div>
  );
}
