"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderOpen, Loader2 } from "lucide-react";

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
  initialResourceIds?: Id<"resources">[];
  onCreated?: (collectionId: Id<"collections">) => void;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  userId,
  initialResourceIds,
  onCreated,
}: CreateCollectionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createCollection = useMutation(api.collections.createCollection);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const collectionId = await createCollection({
        userId,
        name: name.trim(),
        description: description.trim() || undefined,
        resourceIds: initialResourceIds,
      });
      onCreated?.(collectionId);
      onOpenChange(false);
      setName("");
      setDescription("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <FolderOpen className="size-5 text-coral" aria-hidden="true" />
            New Collection
          </DialogTitle>
          <DialogDescription>
            Group resources into named collections for easy access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anxiety Toolkit, Tuesday Group"
              maxLength={100}
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) handleSubmit();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection-description">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection for?"
              rows={2}
              maxLength={500}
              disabled={isCreating}
            />
          </div>

          {initialResourceIds && initialResourceIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {initialResourceIds.length} resource{initialResourceIds.length !== 1 ? "s" : ""} will be added.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || !name.trim()}
            className="btn-coral gap-2"
          >
            {isCreating ? (
              <>
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Creating...
              </>
            ) : (
              "Create Collection"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
