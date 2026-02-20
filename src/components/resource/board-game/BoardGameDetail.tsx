"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
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
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { PromptEditor } from "@/components/resource/PromptEditor";
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { ArrowLeft, Download, Pencil, Trash2, Loader2 } from "lucide-react";
import type { BoardGameContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";

interface BoardGameDetailProps {
  resourceId: Id<"resources">;
}

export function BoardGameDetail({ resourceId }: BoardGameDetailProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const style = useQuery(
    api.styles.getStyle,
    resource?.styleId ? { styleId: resource.styleId } : "skip",
  );
  const boardAsset = useQuery(api.assets.getAsset, {
    ownerType: "resource",
    ownerId: resourceId,
    assetType: "board_image",
    assetKey: "board_main",
  });

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const handleDownloadPDF = useCallback(async () => {
    if (!resource || !boardAsset?.currentVersion?.url) return;
    setIsGeneratingPDF(true);
    try {
      const blob = await generateImagePagesPDF({
        images: [boardAsset.currentVersion.url],
        layout: "full_page",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.name || "board-game"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (resource.status === "draft") {
        await updateResource({ resourceId: resource._id, status: "complete" });
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [resource, boardAsset, updateResource]);

  const handleDelete = async () => {
    if (!resource) return;
    setIsDeleting(true);
    try {
      await deleteResource({ resourceId: resource._id });
      window.location.href = "/dashboard/resources";
    } finally {
      setIsDeleting(false);
    }
  };

  if (!resource) return null;
  const content = resource.content as BoardGameContent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/resources"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-150 mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Resources
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
              {resource.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Board Game</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="btn-coral gap-1.5"
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="size-4" aria-hidden="true" />
              )}
              Download PDF
            </Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/resources/${resource._id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this board game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this resource and its assets.
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
                      <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                    )}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <div className="aspect-square rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
          {boardAsset?.currentVersion?.url ? (
            <img
              src={boardAsset.currentVersion.url}
              alt="Board background"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              No image generated yet
            </div>
          )}
        </div>
        {content.boardImagePrompt && (
          <PromptEditor
            prompt={content.boardImagePrompt}
            onPromptChange={async (newPrompt) => {
              await updateResource({
                resourceId: resource._id,
                content: { ...content, boardImagePrompt: newPrompt },
              });
            }}
            onRegenerate={async () => {
              setIsRegenerating(true);
              try {
                await generateStyledImage({
                  ownerType: "resource",
                  ownerId: resource._id,
                  assetType: "board_image",
                  assetKey: content.boardImageAssetKey ?? "board_main",
                  prompt: content.boardImagePrompt!,
                  styleId: resource.styleId as Id<"styles"> | undefined,
                  aspect: "1:1",
                });
              } finally {
                setIsRegenerating(false);
              }
            }}
            isGenerating={isRegenerating}
          />
        )}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${content.grid.cols}, minmax(0, 1fr))`, gap: 6 }}>
          {content.grid.cells.map((cell, index) => (
            <div key={index} className="border border-border/60 rounded-md p-2 text-xs text-muted-foreground text-center">
              {cell.label || index + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <AssetHistoryDialog
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "board_image",
            assetKey: "board_main",
          }}
          triggerLabel="History"
          aspectRatio="1/1"
        />
        {boardAsset?.currentVersion?.url && (
          <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
            Edit board background
          </Button>
        )}
      </div>

      {boardAsset?.currentVersion?.url && (
        <ImageEditorModal
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "board_image",
            assetKey: "board_main",
          }}
          imageUrl={boardAsset.currentVersion.url}
          aspectRatio={1}
          title="Edit board background"
        />
      )}
    </div>
  );
}
