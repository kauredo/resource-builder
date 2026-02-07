"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
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
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { ArrowLeft, Download, Pencil, Trash2, Loader2 } from "lucide-react";
import type { CardGameContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";

interface CardGameDetailProps {
  resourceId: Id<"resources">;
}

export function CardGameDetail({ resourceId }: CardGameDetailProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const assets = useQuery(api.assets.getByOwner, {
    ownerType: "resource",
    ownerId: resourceId,
  });

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);

  const assetMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!assets) return map;
    for (const asset of assets) {
      if (asset.assetType !== "card_image") continue;
      if (asset.currentVersion?.url) map.set(asset.assetKey, asset.currentVersion.url);
    }
    return map;
  }, [assets]);

  const handleDownloadPDF = useCallback(async () => {
    if (!resource) return;
    const content = resource.content as CardGameContent;
    const imageUrls = content.cards.flatMap((card) => {
      const cardUrl = card.imageAssetKey ? assetMap.get(card.imageAssetKey) : undefined;
      return cardUrl ? Array.from({ length: card.count }, () => cardUrl) : [];
    });
    if (imageUrls.length === 0) return;
    setIsGeneratingPDF(true);
    try {
      const blob = await generateImagePagesPDF({
        images: imageUrls,
        layout: "grid",
        cardsPerPage: 6,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.name || "card-game"}.pdf`;
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
  }, [resource, assetMap, updateResource]);

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
  const content = resource.content as CardGameContent;

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
            <p className="text-sm text-muted-foreground mt-1">Card Game</p>
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
                  <AlertDialogTitle>Delete this game?</AlertDialogTitle>
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

      <div className="mb-6">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
      </div>

      <div className="space-y-4">
        {content.cards.map((card) => {
          const imageUrl = card.imageAssetKey ? assetMap.get(card.imageAssetKey) : undefined;
          return (
            <div key={card.id ?? card.title} className="rounded-xl border border-border/60 p-4 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
              <div className="h-28 rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt="Card image" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{card.title}</p>
                    <p className="text-xs text-muted-foreground">Count: {card.count}</p>
                  </div>
                  {card.imageAssetKey && (
                    <div className="flex items-center gap-2">
                      <AssetHistoryDialog
                        assetRef={{
                          ownerType: "resource",
                          ownerId: resourceId,
                          assetType: "card_image",
                          assetKey: card.imageAssetKey,
                        }}
                        triggerLabel="History"
                      />
                      {imageUrl && (
                        <Button variant="outline" size="sm" onClick={() => setEditingKey(card.imageAssetKey!)}>
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{card.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {editingKey && (
        <ImageEditorModal
          open={!!editingKey}
          onOpenChange={(open) => setEditingKey(open ? editingKey : null)}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "card_image",
            assetKey: editingKey,
          }}
          imageUrl={assetMap.get(editingKey) as string}
          title="Edit card image"
        />
      )}
    </div>
  );
}
