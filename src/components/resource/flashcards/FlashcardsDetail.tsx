"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { generateFlashcardsPDF } from "@/lib/pdf-flashcards";
import { ArrowLeft, Download, Pencil, Trash2, Loader2, Paintbrush } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import {
  ExportModal,
  FlashcardsSettings,
  type FlashcardsExportSettings,
} from "@/components/resource/ExportModal";
import type { FlashcardsContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";

interface FlashcardsDetailProps {
  resourceId: Id<"resources">;
}

export function FlashcardsDetail({ resourceId }: FlashcardsDetailProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState<FlashcardsExportSettings | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [regeneratingCards, setRegeneratingCards] = useState<Set<string>>(new Set());

  const resource = useQuery(api.resources.getResource, { resourceId });
  const assets = useQuery(api.assets.getByOwner, {
    ownerType: "resource",
    ownerId: resourceId,
  });
  const style = useQuery(
    api.styles.getStyleWithFrameUrls,
    resource?.styleId ? { styleId: resource.styleId as Id<"styles"> } : "skip",
  );

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const assetMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!assets) return map;
    for (const asset of assets) {
      if (asset.assetType !== "flashcard_front_image") continue;
      if (asset.currentVersion?.url) map.set(asset.assetKey, asset.currentVersion.url);
    }
    return map;
  }, [assets]);

  const buildPdfBlob = useCallback(async () => {
    if (!resource) throw new Error("Resource not loaded");
    const content = resource.content as FlashcardsContent;
    const cards = content.cards.map((card) => ({
      frontText: card.frontText,
      backText: card.backText,
      imageUrl: card.frontImageAssetKey ? assetMap.get(card.frontImageAssetKey) : undefined,
    }));
    return generateFlashcardsPDF({
      cards,
      cardsPerPage: exportSettings?.cardsPerPage ?? content.layout?.cardsPerPage ?? 6,
      bodyFont: style?.typography?.bodyFont,
      headingFont: style?.typography?.headingFont,
    });
  }, [resource, assetMap, style, exportSettings]);

  const handleDownloaded = useCallback(async () => {
    if (resource?.status === "draft") {
      await updateResource({ resourceId: resource._id, status: "complete" });
    }
  }, [resource, updateResource]);

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

  const handlePromptChange = useCallback(
    async (cardId: string, newPrompt: string) => {
      if (!resource) return;
      const content = resource.content as FlashcardsContent;
      const updatedCards = content.cards.map((c) =>
        (c.id ?? c.frontText) === cardId ? { ...c, imagePrompt: newPrompt } : c,
      );
      await updateResource({
        resourceId: resource._id,
        content: { ...content, cards: updatedCards },
      });
    },
    [resource, updateResource],
  );

  const handleRegenerate = useCallback(
    async (cardId: string) => {
      if (!resource) return;
      const content = resource.content as FlashcardsContent;
      const card = content.cards.find((c) => (c.id ?? c.frontText) === cardId);
      if (!card?.frontImageAssetKey) return;

      setRegeneratingCards((prev) => new Set(prev).add(cardId));
      try {
        await generateStyledImage({
          ownerType: "resource",
          ownerId: resource._id,
          assetType: "flashcard_front_image",
          assetKey: card.frontImageAssetKey,
          prompt: card.imagePrompt ?? card.frontText,
          styleId: resource.styleId as Id<"styles"> | undefined,
          characterIds: card.characterIds?.map((id) => id as Id<"characters">),
          aspect: "1:1",
        });
      } finally {
        setRegeneratingCards((prev) => {
          const next = new Set(prev);
          next.delete(cardId);
          return next;
        });
      }
    },
    [resource, generateStyledImage],
  );

  if (!resource) return null;
  const content = resource.content as FlashcardsContent;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <p className="text-sm text-muted-foreground mt-1">
              Flashcards &middot; {content.cards.length} cards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="btn-coral gap-1.5 cursor-pointer"
              onClick={() => {
                const c = resource.content as FlashcardsContent;
                setExportSettings({
                  cardsPerPage: c.layout?.cardsPerPage ?? 6,
                });
                setExportOpen(true);
              }}
            >
              <Download className="size-4" aria-hidden="true" />
              Export
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
                  <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
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

      {/* Visual card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {content.cards.map((card) => {
          const cardId = card.id ?? card.frontText;
          const imageUrl = card.frontImageAssetKey ? assetMap.get(card.frontImageAssetKey) : undefined;
          const isRegenerating = regeneratingCards.has(cardId);
          const isHovered = hoveredCard === cardId;

          return (
            <div key={cardId} className="space-y-2">
              {/* Card */}
              <div
                className="rounded-xl border border-border/60 overflow-hidden bg-card"
                onMouseEnter={() => setHoveredCard(cardId)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image area */}
                <div className="relative aspect-square bg-muted/20">
                  {isRegenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" role="status">
                      <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">Generating...</span>
                    </div>
                  ) : imageUrl ? (
                    <>
                      <Image src={imageUrl} alt={card.frontText} fill className="object-cover" />
                      {/* Hover overlay */}
                      {card.frontImageAssetKey && (
                        <div
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 motion-reduce:transition-none ${
                            isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                          }`}
                        >
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingKey(card.frontImageAssetKey!)}
                              className="w-full gap-1.5"
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setImprovingKey(card.frontImageAssetKey!)}
                              className="w-full gap-1.5"
                            >
                              <Paintbrush className="size-3.5" aria-hidden="true" />
                              Improve
                            </Button>
                            <AssetHistoryDialog
                              assetRef={{
                                ownerType: "resource",
                                ownerId: resourceId,
                                assetType: "flashcard_front_image",
                                assetKey: card.frontImageAssetKey!,
                              }}
                              triggerLabel="History"
                              triggerClassName="w-full"
                              aspectRatio="1/1"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                {/* Front text */}
                <div className="px-3 py-2.5 text-center border-t border-border/40">
                  <p className="text-sm font-medium leading-tight">{card.frontText}</p>
                </div>
              </div>

              {/* Back text label */}
              <p className="text-xs text-muted-foreground text-center leading-tight px-1">
                {card.backText}
              </p>

              {/* Prompt editor */}
              {card.frontImageAssetKey && (
                <PromptEditor
                  prompt={card.imagePrompt ?? card.frontText}
                  onPromptChange={(newPrompt) => handlePromptChange(cardId, newPrompt)}
                  onRegenerate={() => handleRegenerate(cardId)}
                  isGenerating={isRegenerating}
                />
              )}
            </div>
          );
        })}
      </div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "flashcards"}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
        settingsPanel={
          exportSettings && (
            <FlashcardsSettings
              settings={exportSettings}
              onSettingsChange={setExportSettings}
            />
          )
        }
      />

      {editingKey && (
        <ImageEditorModal
          open={!!editingKey}
          onOpenChange={(open) => setEditingKey(open ? editingKey : null)}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "flashcard_front_image",
            assetKey: editingKey,
          }}
          imageUrl={assetMap.get(editingKey) as string}
          aspectRatio={1}
          title="Edit flashcard image"
        />
      )}

      {improvingKey && (() => {
        const asset = assets?.find((a) => a.assetKey === improvingKey);
        const cv = asset?.currentVersion;
        const url = cv?.url;
        if (!cv || !url) return null;
        return (
          <ImproveImageModal
            open={true}
            onOpenChange={(open) => { if (!open) setImprovingKey(null); }}
            imageUrl={url}
            originalPrompt={cv.prompt}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: "flashcard_front_image",
              assetKey: improvingKey,
            }}
            currentStorageId={cv.storageId}
            currentVersionId={cv._id}
            styleId={resource?.styleId as Id<"styles"> | undefined}
            aspect="1:1"
          />
        );
      })()}
    </div>
  );
}
