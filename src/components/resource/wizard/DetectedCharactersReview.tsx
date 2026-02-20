"use client";

import { useState, useCallback, useId, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Unlink, ChevronDown, User, RefreshCw } from "lucide-react";
import type { DetectedCharacterResult } from "@/types";

interface DetectedCharactersReviewProps {
  characters: DetectedCharacterResult[];
  status: "idle" | "creating" | "ready" | "skipped";
  styleId?: string;
  onUpdatePromptFragment: (characterId: string, promptFragment: string) => void;
  onRemoveCharacter: (characterId: string) => void;
}

/** Format appearsOn keys into readable text: "cover + 3 pages", "4 cards", etc. */
function formatAppearsOn(keys: string[]): string {
  if (keys.length === 0) return "no items";
  const hasCover = keys.includes("cover");
  const hasBoard = keys.includes("board");
  const hasPoster = keys.includes("poster");
  const pageCount = keys.filter((k) => k.startsWith("page_")).length;
  const cardCount = keys.filter((k) => k.startsWith("card_")).length;
  const tokenCount = keys.filter((k) => k.startsWith("token_")).length;
  const bgCount = keys.filter((k) => k.startsWith("background_")).length;
  const iconCount = keys.filter((k) => k.startsWith("icon_")).length;

  const parts: string[] = [];
  if (hasCover) parts.push("cover");
  if (hasBoard) parts.push("board");
  if (hasPoster) parts.push("poster");
  if (pageCount > 0) parts.push(`${pageCount} ${pageCount === 1 ? "page" : "pages"}`);
  if (cardCount > 0) parts.push(`${cardCount} ${cardCount === 1 ? "card" : "cards"}`);
  if (tokenCount > 0) parts.push(`${tokenCount} ${tokenCount === 1 ? "token" : "tokens"}`);
  if (bgCount > 0) parts.push(`${bgCount} ${bgCount === 1 ? "background" : "backgrounds"}`);
  if (iconCount > 0) parts.push(`${iconCount} ${iconCount === 1 ? "icon" : "icons"}`);

  if (parts.length === 0) return `${keys.length} ${keys.length === 1 ? "item" : "items"}`;
  return parts.join(", ");
}

export function DetectedCharactersReview({
  characters,
  status,
  styleId,
  onUpdatePromptFragment,
  onRemoveCharacter,
}: DetectedCharactersReviewProps) {
  if (status === "creating") {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3" role="status">
        <div className="flex items-center gap-2.5">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none text-coral" aria-hidden="true" />
          <span className="text-sm font-medium">Creating characters...</span>
        </div>
        <div className="space-y-2">
          <div className="h-10 rounded-lg bg-muted/50 animate-pulse motion-reduce:animate-none" />
          <div className="h-10 rounded-lg bg-muted/30 animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  if (status !== "ready" || characters.length === 0) {
    return null;
  }

  const names = characters.map((c) => c.name);
  const nameList = names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium">
          Found {characters.length} {characters.length === 1 ? "character" : "characters"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {nameList} will look the same across all illustrations.
          Expand a character to adjust how they look.
        </p>
      </div>

      <div className="space-y-2">
        {characters.map((char) => (
          <CharacterCard
            key={char.characterId}
            character={char}
            styleId={styleId}
            onUpdatePromptFragment={onUpdatePromptFragment}
            onRemove={onRemoveCharacter}
          />
        ))}
      </div>
    </div>
  );
}

/** Reactive thumbnail that auto-updates when the character's styled reference changes */
function CharacterThumbnail({
  characterId,
  name,
  size,
}: {
  characterId: string;
  name: string;
  size: "sm" | "lg";
}) {
  const character = useQuery(api.characters.getCharacter, {
    characterId: characterId as Id<"characters">,
  });
  const imageUrl = useQuery(
    api.images.getImageUrl,
    character?.styledReferenceImageId
      ? { storageId: character.styledReferenceImageId }
      : "skip",
  );

  const sizeClass = size === "sm" ? "size-10" : "size-20";
  const iconSize = size === "sm" ? "size-4" : "size-8";

  // Loading: character query pending, or image URL resolving
  if (character === undefined || (character?.styledReferenceImageId && imageUrl === undefined)) {
    return (
      <div
        className={`${sizeClass} rounded-lg bg-muted/50 animate-pulse motion-reduce:animate-none shrink-0`}
        aria-hidden="true"
      />
    );
  }

  // Has a resolved image URL
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`Portrait of ${name}`}
        className={`${sizeClass} rounded-lg object-cover shrink-0`}
      />
    );
  }

  // No reference image — placeholder
  return (
    <div
      className={`${sizeClass} rounded-lg bg-muted/40 flex items-center justify-center shrink-0`}
      aria-hidden="true"
    >
      <User className={iconSize} strokeWidth={1.5} />
    </div>
  );
}

function CharacterCard({
  character,
  styleId,
  onUpdatePromptFragment,
  onRemove,
}: {
  character: DetectedCharacterResult;
  styleId?: string;
  onUpdatePromptFragment: (characterId: string, promptFragment: string) => void;
  onRemove: (characterId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localValue, setLocalValue] = useState(character.promptFragment);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const textareaId = useId();

  const ensureReference = useAction(api.characterActions.ensureCharacterReference);

  // Auto-clear regeneration error after 5 seconds
  useEffect(() => {
    if (!regenerateError) return;
    const timer = setTimeout(() => setRegenerateError(null), 5000);
    return () => clearTimeout(timer);
  }, [regenerateError]);

  const handleBlur = useCallback(() => {
    if (localValue !== character.promptFragment) {
      onUpdatePromptFragment(character.characterId, localValue);
    }
  }, [localValue, character.promptFragment, character.characterId, onUpdatePromptFragment]);

  const handleRemove = useCallback(() => {
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      return;
    }
    onRemove(character.characterId);
  }, [confirmingRemove, character.characterId, onRemove]);

  // Reset confirmation if user clicks elsewhere
  const handleRemoveBlur = useCallback(() => {
    setTimeout(() => setConfirmingRemove(false), 200);
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (!styleId || isRegenerating) return;
    setIsRegenerating(true);
    setRegenerateError(null);
    try {
      await ensureReference({
        characterId: character.characterId as Id<"characters">,
        styleId: styleId as Id<"styles">,
        force: true,
      });
    } catch {
      setRegenerateError("Couldn't generate portrait — try again");
    } finally {
      setIsRegenerating(false);
    }
  }, [styleId, isRegenerating, ensureReference, character.characterId]);

  const handleApplySuggestion = useCallback(() => {
    if (!character.suggestedPromptFragment) return;
    setLocalValue(character.suggestedPromptFragment);
    onUpdatePromptFragment(character.characterId, character.suggestedPromptFragment);
    setSuggestionDismissed(true);
  }, [character.suggestedPromptFragment, character.characterId, onUpdatePromptFragment]);

  const showSuggestion =
    character.suggestedPromptFragment &&
    !suggestionDismissed &&
    character.suggestedPromptFragment !== localValue;

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 cursor-pointer text-left transition-colors duration-150 motion-reduce:transition-none hover:bg-muted/30 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        aria-expanded={isExpanded}
        aria-controls={`char-details-${character.characterId}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {!isExpanded && (
            <CharacterThumbnail characterId={character.characterId} name={character.name} size="sm" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{character.name}</span>
              {character.isNew ? (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-teal/10 text-teal shrink-0">
                  New
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground shrink-0">
                  Existing
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Appears on {formatAppearsOn(character.appearsOn)}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground shrink-0 transition-transform duration-150 motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div
          id={`char-details-${character.characterId}`}
          className="px-4 pb-4 space-y-3 border-t border-border/40"
        >
          <div className="flex items-start gap-4 pt-3">
            <CharacterThumbnail characterId={character.characterId} name={character.name} size="lg" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <label htmlFor={textareaId} className="text-xs font-medium text-muted-foreground">
                Appearance
              </label>
              <Textarea
                id={textareaId}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                rows={2}
                className="text-sm resize-none"
                placeholder="Describe how this character looks..."
              />
              <p className="text-xs text-muted-foreground/70">
                This description keeps the character looking the same across all illustrations.
              </p>
            </div>
          </div>

          {/* Suggestion UI */}
          {showSuggestion && (
            <div className="rounded-lg border border-teal/20 bg-teal/5 p-3 space-y-2">
              <p className="text-xs font-medium text-teal">
                This character&apos;s current description differs from what the AI generated — review the updated version below
              </p>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {character.suggestedPromptFragment}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs cursor-pointer"
                  onClick={handleApplySuggestion}
                >
                  Use this description
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground cursor-pointer"
                  onClick={() => setSuggestionDismissed(true)}
                >
                  Keep current
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center">
            {styleId && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground cursor-pointer"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                aria-label={`Regenerate portrait for ${character.name}`}
              >
                {isRegenerating ? (
                  <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <RefreshCw className="size-3" aria-hidden="true" />
                )}
                {isRegenerating ? "Regenerating..." : "Regenerate portrait"}
              </Button>
            )}
            {regenerateError && (
              <span className="text-xs text-destructive ml-2">{regenerateError}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-xs cursor-pointer ml-auto ${confirmingRemove ? "text-destructive hover:text-destructive" : "text-muted-foreground hover:text-destructive"}`}
              onClick={handleRemove}
              onBlur={handleRemoveBlur}
              aria-label={confirmingRemove ? `Confirm removing ${character.name}` : `Remove ${character.name}`}
            >
              <Unlink className="size-3" aria-hidden="true" />
              {confirmingRemove ? "Click again to confirm" : "Remove character"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
