"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/character/CharacterCard";
import { Plus, Loader2, Users } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface StyleCharactersProps {
  styleId: Id<"styles">;
  userId: Id<"users">;
}

export function StyleCharacters({ styleId, userId }: StyleCharactersProps) {
  const router = useRouter();
  const characters = useQuery(api.characters.getCharactersByStyle, { styleId });
  const createCharacter = useMutation(api.characters.createCharacter);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const characterId = await createCharacter({
        userId,
        name: "New Character",
        styleId,
      });
      router.push(`/dashboard/characters/${characterId}`);
    } catch (error) {
      console.error("Failed to create character:", error);
      setIsCreating(false);
    }
  };

  if (characters === undefined) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        role="status"
        aria-label="Loading characters"
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-card overflow-hidden"
          >
            <div className="aspect-[4/3] bg-muted animate-pulse motion-reduce:animate-none" />
            <div className="h-0.5 bg-muted" />
            <div className="px-4 py-3 space-y-2">
              <div className="h-5 w-24 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="flex gap-2 pt-1">
                <div className="h-4 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none" />
                <div className="h-4 w-12 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="size-14 rounded-2xl bg-teal/10 flex items-center justify-center mb-4">
            <Users className="size-6 text-teal/70" aria-hidden="true" />
          </div>
          <h3 className="font-medium text-foreground mb-1">
            No characters yet
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
            Create a character to use across your resources with this style.
          </p>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="btn-coral gap-2"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            Create Character
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          {characters.length} character{characters.length !== 1 ? "s" : ""}
        </p>
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          size="sm"
          className="btn-coral gap-1.5"
        >
          {isCreating ? (
            <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Plus className="size-3.5" aria-hidden="true" />
          )}
          Create Character
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {characters
          .sort(
            (a, b) =>
              (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt),
          )
          .map((character) => (
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
    </div>
  );
}
