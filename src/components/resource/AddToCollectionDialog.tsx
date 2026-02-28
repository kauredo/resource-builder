"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderOpen, FolderPlus, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceIds: Id<"resources">[];
  userId: Id<"users">;
  /** When used from collection detail page, adds resources to this specific collection */
  collectionId?: Id<"collections">;
}

export function AddToCollectionDialog({
  open,
  onOpenChange,
  resourceIds,
  userId,
  collectionId,
}: AddToCollectionDialogProps) {
  const collections = useQuery(
    api.collections.getUserCollections,
    open ? { userId } : "skip"
  );
  const allResources = useQuery(
    api.resources.getUserResources,
    // When adding from collection detail (no resourceIds), fetch user resources to pick from
    open && collectionId && resourceIds.length === 0 ? { userId } : "skip"
  );
  const collection = useQuery(
    api.collections.getCollection,
    open && collectionId ? { collectionId } : "skip"
  );

  const createCollection = useMutation(api.collections.createCollection);
  const addResources = useMutation(api.collections.addResourcesToCollection);
  const removeResource = useMutation(api.collections.removeResourceFromCollection);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [initialChecked, setInitialChecked] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [showNewRow, setShowNewRow] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  // For collection detail "add resources" mode
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  // Whether we're in "add resources to collection" mode (from collection detail page)
  const isAddToSpecificCollection = Boolean(collectionId) && resourceIds.length === 0;

  // Initialize checked state when collections load
  useEffect(() => {
    if (!open || !collections || isAddToSpecificCollection) return;
    const initial = new Set<string>();
    for (const c of collections) {
      const hasAll = resourceIds.every((id) => c.resourceIds.includes(id));
      if (hasAll) initial.add(c._id);
    }
    setChecked(new Set(initial));
    setInitialChecked(new Set(initial));
  }, [open, collections, resourceIds, isAddToSpecificCollection]);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setShowNewRow(false);
      setNewName("");
      setSelectedResources(new Set());
    }
  }, [open]);

  // Resources available to add (not already in collection)
  const availableResources = useMemo(() => {
    if (!isAddToSpecificCollection || !allResources || !collection) return [];
    const existing = new Set(collection.resourceIds.map(String));
    return allResources.filter((r) => !existing.has(r._id));
  }, [isAddToSpecificCollection, allResources, collection]);

  const handleToggle = (collectionId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
  };

  const handleCreateNew = async () => {
    if (!newName.trim()) return;
    setIsCreatingNew(true);
    try {
      const newId = await createCollection({
        userId,
        name: newName.trim(),
        resourceIds: isAddToSpecificCollection ? undefined : resourceIds,
      });
      if (!isAddToSpecificCollection) {
        setChecked((prev) => new Set([...prev, newId]));
        setInitialChecked((prev) => new Set([...prev, newId]));
      }
      setNewName("");
      setShowNewRow(false);
      toast.success(`Created "${newName.trim()}"`);
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleSave = async () => {
    if (isAddToSpecificCollection) {
      // Add selected resources to this collection
      if (selectedResources.size === 0 || !collectionId) return;
      setIsSaving(true);
      try {
        await addResources({
          collectionId,
          resourceIds: [...selectedResources] as Id<"resources">[],
        });
        toast.success(
          `Added ${selectedResources.size} resource${selectedResources.size !== 1 ? "s" : ""}`
        );
        onOpenChange(false);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Diff-based save: add to newly checked, remove from newly unchecked
    if (!collections) return;
    setIsSaving(true);
    try {
      const toAdd = [...checked].filter((id) => !initialChecked.has(id));
      const toRemove = [...initialChecked].filter((id) => !checked.has(id));

      await Promise.all([
        ...toAdd.map((cId) =>
          addResources({
            collectionId: cId as Id<"collections">,
            resourceIds,
          })
        ),
        ...toRemove.flatMap((cId) =>
          resourceIds.map((rId) =>
            removeResource({
              collectionId: cId as Id<"collections">,
              resourceId: rId,
            })
          )
        ),
      ]);

      const changes = toAdd.length + toRemove.length;
      if (changes > 0) {
        toast.success("Collections updated");
      }
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = isAddToSpecificCollection
    ? selectedResources.size > 0
    : checked.size !== initialChecked.size ||
      [...checked].some((id) => !initialChecked.has(id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <FolderPlus className="size-5 text-coral" aria-hidden="true" />
            {isAddToSpecificCollection ? "Add Resources" : "Add to Collection"}
          </DialogTitle>
          <DialogDescription>
            {isAddToSpecificCollection
              ? "Select resources to add to this collection."
              : resourceIds.length === 1
                ? "Choose which collections this resource belongs to."
                : `Choose collections for ${resourceIds.length} resources.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 max-h-[50vh] overflow-y-auto -mx-6 px-6">
          {isAddToSpecificCollection ? (
            // Show available resources to add
            availableResources.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                All resources are already in this collection.
              </p>
            ) : (
              <div className="space-y-1">
                {availableResources.map((resource) => (
                  <label
                    key={resource._id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-150 motion-reduce:transition-none"
                  >
                    <Checkbox
                      checked={selectedResources.has(resource._id)}
                      onCheckedChange={() => {
                        setSelectedResources((prev) => {
                          const next = new Set(prev);
                          if (next.has(resource._id)) next.delete(resource._id);
                          else next.add(resource._id);
                          return next;
                        });
                      }}
                      className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </p>
                    </div>
                    {resource.thumbnailUrl && (
                      <img
                        src={resource.thumbnailUrl}
                        alt=""
                        className="size-8 rounded object-cover"
                      />
                    )}
                  </label>
                ))}
              </div>
            )
          ) : (
            // Show collections to add/remove resources from
            <>
              {collections === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-5 animate-spin motion-reduce:animate-none text-muted-foreground" />
                </div>
              ) : collections.length === 0 && !showNewRow ? (
                <div className="text-center py-6">
                  <FolderOpen className="size-8 text-muted-foreground/40 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No collections yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewRow(true)}
                    className="gap-1.5"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    Create one
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {collections?.map((c) => (
                    <label
                      key={c._id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-150 motion-reduce:transition-none"
                    >
                      <Checkbox
                        checked={checked.has(c._id)}
                        onCheckedChange={() => handleToggle(c._id)}
                        className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.resourceIds.length} resource{c.resourceIds.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* New collection row */}
              {showNewRow ? (
                <div className="flex items-center gap-2 px-3 py-2 mt-1">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Collection name..."
                    className="text-sm h-8"
                    autoFocus
                    disabled={isCreatingNew}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newName.trim()) handleCreateNew();
                      if (e.key === "Escape") {
                        setShowNewRow(false);
                        setNewName("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateNew}
                    disabled={!newName.trim() || isCreatingNew}
                    className="btn-coral h-8 px-3"
                  >
                    {isCreatingNew ? (
                      <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              ) : (
                collections &&
                collections.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewRow(true)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 mt-1 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    New collection
                  </button>
                )
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="btn-coral gap-2"
          >
            {isSaving ? (
              <>
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
