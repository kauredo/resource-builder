"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Check, User, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardState } from "../EmotionCardsWizard";

interface CharacterStepProps {
  characterId: Id<"characters"> | null;
  styleId: Id<"styles"> | null;
  onUpdate: (updates: Partial<WizardState>) => void;
}

export function CharacterStep({
  characterId,
  styleId,
  onUpdate,
}: CharacterStepProps) {
  const user = useQuery(api.users.currentUser);
  const userCharacters = useQuery(
    api.characters.getUserCharacters,
    user?._id ? { userId: user._id } : "skip"
  );

  // Filter characters by style if a style is selected
  const filteredCharacters = styleId
    ? userCharacters?.filter((c) => c.styleId === styleId) || []
    : userCharacters || [];

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
          "transition-colors duration-150 hover:border-coral/40 hover:bg-coral/5",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
          characterId === null
            ? "border-coral bg-coral/5"
            : "border-border bg-card"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            characterId === null ? "bg-coral/20" : "bg-muted"
          )}
        >
          <UserX
            className={cn(
              "size-6",
              characterId === null ? "text-coral" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium">No character</span>
          <p className="text-sm text-muted-foreground">
            Generate unique illustrations for each emotion without a recurring character.
          </p>
        </div>
        {characterId === null && (
          <div className="w-6 h-6 bg-coral rounded-full flex items-center justify-center shrink-0">
            <Check className="size-4 text-white" aria-hidden="true" />
          </div>
        )}
      </button>

      {/* Character Options */}
      {filteredCharacters.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Your Characters
            {styleId && (
              <span className="font-normal normal-case ml-1">(matching selected style)</span>
            )}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCharacters.map((character) => {
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
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      isSelected ? "bg-teal/20" : "bg-muted"
                    )}
                  >
                    <User
                      className={cn(
                        "size-6",
                        isSelected ? "text-teal" : "text-muted-foreground"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{character.name}</span>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {character.description}
                    </p>
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

      {/* No characters available */}
      {userCharacters && userCharacters.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-8 text-center">
          <User className="size-10 text-muted-foreground/50 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-medium text-foreground/80 mb-1">No characters yet</h3>
          <p className="text-sm text-muted-foreground">
            You can create characters in the Characters section to use them across your resources.
          </p>
        </div>
      )}

      {/* Characters exist but none match style */}
      {userCharacters &&
        userCharacters.length > 0 &&
        filteredCharacters.length === 0 &&
        styleId && (
          <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              You have characters, but none match the selected style.
              Characters work best when their style matches your deck.
            </p>
          </div>
        )}
    </div>
  );
}
