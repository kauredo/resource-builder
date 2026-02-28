"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { AddToCollectionDialog } from "@/components/resource/AddToCollectionDialog";
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
import {
  ArrowLeft,
  Trash2,
  Loader2,
  FolderOpen,
  Download,
  Minus,
  Pencil,
  Plus,
} from "lucide-react";
import { useBatchExport } from "@/hooks/use-batch-export";
import { BatchExportBar } from "@/components/resource/BatchExportBar";
import { getItemCount } from "@/lib/resource-utils";
import { toast } from "sonner";

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const collectionId = id as Id<"collections">;

  const user = useQuery(api.users.currentUser);
  const collection = useQuery(api.collections.getCollectionWithResources, {
    collectionId,
  });
  const updateCollection = useMutation(api.collections.updateCollection);
  const deleteCollection = useMutation(api.collections.deleteCollection);
  const removeResource = useMutation(api.collections.removeResourceFromCollection);

  const [isDeleting, setIsDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const {
    isSelectMode,
    selectedIds,
    isExporting,
    exportProgress,
    enterSelectMode,
    exitSelectMode,
    toggleSelection,
    selectAll,
    deselectAll,
    startExport,
    cancelExport,
  } = useBatchExport();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCollection({ collectionId });
      router.push("/dashboard/resources?tab=collections");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNameSave = async () => {
    if (!name.trim()) return;
    await updateCollection({ collectionId, name: name.trim() });
    setEditingName(false);
  };

  const handleDescSave = async () => {
    await updateCollection({
      collectionId,
      description: description.trim() || undefined,
    });
    setEditingDesc(false);
  };

  const handleRemoveResource = async (resourceId: Id<"resources">) => {
    await removeResource({ collectionId, resourceId });
    toast.success("Removed from collection");
  };

  const [isExportingAll, setIsExportingAll] = useState(false);
  const handleExportAll = async () => {
    if (!collection?.resources.length) return;
    setIsExportingAll(true);
    const ids = collection.resources.map((r) => r._id);
    await startExport(user?.subscription !== "pro", ids);
    setIsExportingAll(false);
  };

  if (collection === undefined) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="status"
        aria-label="Loading collection"
      >
        <div className="h-4 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4" />
        <div className="h-8 w-48 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse motion-reduce:animate-none mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card">
              <div className="aspect-[4/3] bg-muted animate-pulse motion-reduce:animate-none rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (collection === null) {
    router.replace("/dashboard/resources?tab=collections");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/resources?tab=collections"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-150 mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Collections
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
                  setName(collection.name);
                  setEditingName(true);
                }}
                className="group/edit inline-flex items-center gap-2 text-left cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight group-hover/edit:text-foreground/80 transition-colors duration-150">
                  {collection.name}
                </h1>
                <Pencil className="size-3.5 text-muted-foreground/0 group-hover/edit:text-muted-foreground/60 transition-colors duration-150 motion-reduce:transition-none shrink-0" aria-hidden="true" />
              </button>
            )}

            {editingDesc ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDescSave();
                    if (e.key === "Escape") setEditingDesc(false);
                  }}
                  placeholder="Add a description..."
                  className="text-sm h-auto py-1"
                  autoFocus
                />
                <Button size="sm" onClick={handleDescSave}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingDesc(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDescription(collection.description ?? "");
                  setEditingDesc(true);
                }}
                className="group/edit-desc inline-flex items-center gap-1.5 text-left cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                <p className="text-sm text-muted-foreground mt-1 group-hover/edit-desc:text-foreground/80 transition-colors duration-150">
                  {collection.description || "Add a description..."}
                </p>
                <Pencil className="size-3 text-muted-foreground/0 group-hover/edit-desc:text-muted-foreground/60 transition-colors duration-150 motion-reduce:transition-none shrink-0 mt-1" aria-hidden="true" />
              </button>
            )}

            <div className="flex items-center gap-2 mt-2">
              <FolderOpen
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">
                {collection.resources.length} resource
                {collection.resources.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {collection.resources.length > 0 && (
              <Button
                variant="outline"
                onClick={handleExportAll}
                disabled={isExportingAll}
                className="gap-1.5"
              >
                {isExportingAll ? (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                {isExportingAll ? "Exporting..." : "Export All"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(true)}
              className="gap-1.5"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add Resources
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete collection</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this collection?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the collection but keeps the individual resources.
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
                    Delete Collection
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {collection.resources.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
              <FolderOpen
                className="size-6 text-coral/70"
                aria-hidden="true"
              />
            </div>
            <h2 className="font-medium text-foreground mb-1">
              No resources yet
            </h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
              Add resources to this collection to group them together.
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="btn-coral gap-2"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add Resources
            </Button>
          </div>
        </div>
      )}

      {/* Resource grid */}
      {collection.resources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collection.resources.map((resource) => (
            <div key={resource._id} className="relative group/card">
              <ResourceCard
                id={resource._id}
                name={resource.name}
                type={resource.type}
                status={resource.status}
                itemCount={getItemCount(resource)}
                updatedAt={resource.updatedAt}
                thumbnailUrl={resource.thumbnailUrl}
                selectable={isSelectMode}
                selected={selectedIds.has(resource._id)}
                onSelect={toggleSelection}
              />
              {!isSelectMode && (
                <button
                  type="button"
                  onClick={() => handleRemoveResource(resource._id)}
                  className="absolute bottom-2 left-2 p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-destructive opacity-0 group-hover/card:opacity-100 cursor-pointer transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:opacity-100"
                  aria-label={`Remove ${resource.name} from collection`}
                >
                  <Minus className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom spacer for batch bar */}
      {isSelectMode && (
        <div className="h-20" aria-hidden="true" />
      )}

      {/* Batch export bar */}
      {isSelectMode && (
        <BatchExportBar
          selectedCount={selectedIds.size}
          totalCount={collection.resources.length}
          isExporting={isExporting}
          exportProgress={exportProgress}
          onSelectAll={() => selectAll(collection.resources.map((r) => r._id))}
          onDeselectAll={deselectAll}
          onExport={() => startExport(user?.subscription !== "pro")}
          onCancelExport={cancelExport}
          onExit={exitSelectMode}
        />
      )}

      {/* Add to Collection Dialog */}
      {user && (
        <AddToCollectionDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          resourceIds={[]}
          userId={user._id}
          collectionId={collectionId}
        />
      )}
    </div>
  );
}
