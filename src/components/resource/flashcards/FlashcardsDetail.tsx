"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DetailPageHeader, DetailPageSkeleton } from "@/components/resource/DetailPageHeader";
import { ImageHoverOverlay } from "@/components/resource/ImageHoverOverlay";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { PromptEditor } from "@/components/resource/PromptEditor";
import { generateFlashcardsPDF } from "@/lib/pdf-flashcards";
import { Loader2 } from "lucide-react";
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
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
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
      watermark: user?.subscription !== "pro",
    });
  }, [resource, assetMap, style, exportSettings, user?.subscription]);

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
      router.push("/dashboard/resources");
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

  if (!resource) return <DetailPageSkeleton />;
  const content = resource.content as FlashcardsContent;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle={<>Flashcards &middot; {content.cards.length} cards</>}
        onExport={() => {
          const c = resource.content as FlashcardsContent;
          setExportSettings({
            cardsPerPage: c.layout?.cardsPerPage ?? 6,
          });
          setExportOpen(true);
        }}
        deleteTitle="Delete this deck?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

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
                        <ImageHoverOverlay
                          isHovered={isHovered}
                          onEdit={() => setEditingKey(card.frontImageAssetKey!)}
                          onImprove={() => setImprovingKey(card.frontImageAssetKey!)}
                          assetRef={{
                            ownerType: "resource",
                            ownerId: resourceId,
                            assetType: "flashcard_front_image",
                            assetKey: card.frontImageAssetKey!,
                          }}
                          aspectRatio="1/1"
                        />
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
        showWatermarkNotice={user?.subscription !== "pro"}
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
