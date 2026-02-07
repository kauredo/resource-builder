"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CharacterCard } from "@/components/character/CharacterCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Loader2, Users } from "lucide-react";

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const groupId = id as Id<"characterGroups">;

  const group = useQuery(api.characterGroups.getGroupWithCharacters, {
    groupId,
  });
  const updateGroup = useMutation(api.characterGroups.updateGroup);
  const deleteGroup = useMutation(api.characterGroups.deleteGroup);
  const removeFromGroup = useMutation(
    api.characterGroups.removeCharacterFromGroup,
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGroup({ groupId });
      router.push("/dashboard/characters?tab=groups");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNameSave = async () => {
    if (!name.trim()) return;
    await updateGroup({ groupId, name: name.trim() });
    setEditingName(false);
  };

  const handleRemoveCharacter = async (characterId: Id<"characters">) => {
    await removeFromGroup({ groupId, characterId });
  };

  if (!group) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        role="status"
        aria-label="Loading group"
      >
        <div className="h-8 w-48 bg-muted rounded animate-pulse motion-reduce:animate-none mb-8" />
        <div className="h-6 w-64 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/characters?tab=groups"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-150 mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Groups
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSave();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="font-serif text-2xl sm:text-3xl font-medium h-auto py-1"
                  autoFocus
                />
                <Button size="sm" onClick={handleNameSave}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setName(group.name);
                  setEditingName(true);
                }}
                className="text-left cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight hover:text-foreground/80 transition-colors duration-150">
                  {group.name}
                </h1>
              </button>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {group.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Users
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">
                {group.characterIds.length} character
                {group.characterIds.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span className="sr-only">Delete group</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this group?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the group but keeps the individual characters.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting && (
                    <Loader2
                      className="size-4 animate-spin motion-reduce:animate-none mr-2"
                      aria-hidden="true"
                    />
                  )}
                  Delete Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Characters in group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {group.characters.map((character) => {
          if (!character) return null;
          return (
            <div key={character._id} className="relative group/card">
              <CharacterCard
                id={character._id}
                name={character.name}
                personality={character.personality}
                referenceImageCount={character.referenceImages.length}
                thumbnailUrl={character.thumbnailUrl}
                updatedAt={character.updatedAt ?? character.createdAt}
              />
              {group.characterIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCharacter(character._id)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-destructive opacity-0 group-hover/card:opacity-100 cursor-pointer transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:opacity-100"
                  aria-label={`Remove ${character.name} from group`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
