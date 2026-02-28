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
import { generateBookPDF } from "@/lib/pdf-book";
import { Loader2 } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import {
  ExportModal,
  BookSettings,
  type BookExportSettings,
} from "@/components/resource/ExportModal";
import type { BookContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";
import { AddToCollectionDialog } from "@/components/resource/AddToCollectionDialog";
import { toast } from "sonner";

interface BookDetailProps {
  resourceId: Id<"resources">;
}

export function BookDetail({ resourceId }: BookDetailProps) {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState<BookExportSettings>({ booklet: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);
  const [hoveredCover, setHoveredCover] = useState(false);
  const [regeneratingCover, setRegeneratingCover] = useState(false);
  const [regeneratingPages, setRegeneratingPages] = useState<Set<string>>(
    new Set(),
  );
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const assets = useQuery(api.assets.getByOwner, {
    ownerType: "resource",
    ownerId: resourceId,
  });
  const style = useQuery(
    api.styles.getStyleWithFrameUrls,
    resource?.styleId
      ? { styleId: resource.styleId as Id<"styles"> }
      : "skip",
  );
  const resourceCollections = useQuery(
    api.collections.getCollectionsForResource,
    user?._id ? { userId: user._id, resourceId } : "skip",
  );

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const assetMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!assets) return map;
    for (const asset of assets) {
      if (asset.currentVersion?.url) {
        map.set(asset.assetKey, asset.currentVersion.url);
      }
    }
    return map;
  }, [assets]);

  const buildPdfBlob = useCallback(async () => {
    if (!resource) throw new Error("Resource not loaded");
    const content = resource.content as BookContent;
    return generateBookPDF({
      content,
      assetMap,
      booklet: exportSettings.booklet,
      watermark: user?.subscription !== "pro",
      style: style
        ? {
            colors: style.colors,
            typography: style.typography,
          }
        : undefined,
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
    async (pageId: string, newPrompt: string) => {
      if (!resource) return;
      const content = resource.content as BookContent;
      const updatedPages = content.pages.map((p) =>
        p.id === pageId ? { ...p, imagePrompt: newPrompt } : p,
      );
      await updateResource({
        resourceId: resource._id,
        content: { ...content, pages: updatedPages },
      });
    },
    [resource, updateResource],
  );

  const handleRegenerate = useCallback(
    async (pageId: string) => {
      if (!resource) return;
      const content = resource.content as BookContent;
      const page = content.pages.find((p) => p.id === pageId);
      if (!page?.imageAssetKey) return;

      setRegeneratingPages((prev) => new Set(prev).add(pageId));
      try {
        const charIds = page.characterIds
          ?.map((id) => id as Id<"characters">)
          ?? (content.characters?.characterIds
            ?.map((id) => id as Id<"characters">));
        await generateStyledImage({
          ownerType: "resource",
          ownerId: resource._id,
          assetType: "book_page_image",
          assetKey: page.imageAssetKey,
          prompt: page.imagePrompt ?? page.text,
          styleId: resource.styleId as Id<"styles"> | undefined,
          characterIds: charIds,
          aspect: "3:4",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Image generation failed. Please try again.");
      } finally {
        setRegeneratingPages((prev) => {
          const next = new Set(prev);
          next.delete(pageId);
          return next;
        });
      }
    },
    [resource, generateStyledImage],
  );

  const handleCoverPromptChange = useCallback(
    async (newPrompt: string) => {
      if (!resource) return;
      const content = resource.content as BookContent;
      if (!content.cover) return;
      await updateResource({
        resourceId: resource._id,
        content: { ...content, cover: { ...content.cover, imagePrompt: newPrompt } },
      });
    },
    [resource, updateResource],
  );

  const handleCoverRegenerate = useCallback(async () => {
    if (!resource) return;
    const content = resource.content as BookContent;
    if (!content.cover?.imageAssetKey) return;

    setRegeneratingCover(true);
    try {
      const charIds = content.characters?.characterIds
        ?.map((id) => id as Id<"characters">);
      await generateStyledImage({
        ownerType: "resource",
        ownerId: resource._id,
        assetType: "book_cover_image",
        assetKey: content.cover.imageAssetKey,
        prompt: content.cover.imagePrompt ?? content.cover.title,
        styleId: resource.styleId as Id<"styles"> | undefined,
        characterIds: charIds,
        aspect: "3:4",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image generation failed. Please try again.");
    } finally {
      setRegeneratingCover(false);
    }
  }, [resource, generateStyledImage]);

  if (!resource) return <DetailPageSkeleton />;
  const content = resource.content as BookContent;
  const coverUrl = content.cover?.imageAssetKey
    ? assetMap.get(content.cover.imageAssetKey)
    : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle={<>{content.bookType || "Book"} &middot; {content.pages.length} page{content.pages.length !== 1 ? "s" : ""}</>}
        onExport={() => setExportOpen(true)}
        deleteTitle="Delete this book?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        collections={resourceCollections}
        onAddToCollection={() => setShowCollectionDialog(true)}
      />

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      {/* Cover */}
      {content.cover && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Cover
          </h2>
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden max-w-sm">
            <div
              className="relative aspect-[3/4] bg-muted/20"
              onMouseEnter={() => setHoveredCover(true)}
              onMouseLeave={() => setHoveredCover(false)}
            >
              {regeneratingCover ? (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                  role="status"
                >
                  <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">
                    Generating...
                  </span>
                </div>
              ) : coverUrl ? (
                <>
                  <Image
                    src={coverUrl}
                    alt={content.cover.title}
                    fill
                    className="object-cover"
                  />
                  {/* Title overlay — matches PDF output */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-16 pb-6 px-5">
                    <p className="font-serif text-xl font-semibold text-white leading-tight">
                      {content.cover.title}
                    </p>
                    {content.cover.subtitle && (
                      <p className="text-sm text-white/80 mt-1">
                        {content.cover.subtitle}
                      </p>
                    )}
                  </div>
                  {/* Hover controls */}
                  <ImageHoverOverlay
                    isHovered={hoveredCover}
                    onEdit={() => setEditingKey(content.cover!.imageAssetKey!)}
                    onImprove={() => setImprovingKey(content.cover!.imageAssetKey!)}
                    assetRef={{
                      ownerType: "resource",
                      ownerId: resourceId,
                      assetType: "book_cover_image",
                      assetKey: content.cover!.imageAssetKey!,
                    }}
                    aspectRatio="3/4"
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    No cover image
                  </span>
                </div>
              )}
            </div>
            {content.cover.imageAssetKey && (
              <div className="p-4">
                <PromptEditor
                  prompt={content.cover.imagePrompt ?? content.cover.title}
                  onPromptChange={handleCoverPromptChange}
                  onRegenerate={handleCoverRegenerate}
                  isGenerating={regeneratingCover}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pages */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Pages
        </h2>
        <div className="space-y-4">
          {content.pages.map((page, i) => {
            const imageUrl = page.imageAssetKey
              ? assetMap.get(page.imageAssetKey)
              : undefined;
            const isRegenerating = regeneratingPages.has(page.id);
            const isHovered = hoveredPage === page.id;

            return (
              <div
                key={page.id}
                className="rounded-xl border border-border/60 bg-card overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  {page.imageAssetKey && (
                    <div
                      className="relative w-full sm:w-64 shrink-0 aspect-[3/4] sm:aspect-auto sm:min-h-[180px] bg-muted/20"
                      onMouseEnter={() => setHoveredPage(page.id)}
                      onMouseLeave={() => setHoveredPage(null)}
                    >
                      {isRegenerating ? (
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                          role="status"
                        >
                          <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" aria-hidden="true" />
                          <span className="text-sm text-muted-foreground">
                            Generating...
                          </span>
                        </div>
                      ) : imageUrl ? (
                        <>
                          <Image
                            src={imageUrl}
                            alt={`Page ${i + 1} illustration`}
                            fill
                            className="object-cover"
                          />
                          <ImageHoverOverlay
                            isHovered={isHovered}
                            onEdit={() => setEditingKey(page.imageAssetKey!)}
                            onImprove={() => setImprovingKey(page.imageAssetKey!)}
                            assetRef={{
                              ownerType: "resource",
                              ownerId: resourceId,
                              assetType: "book_page_image",
                              assetKey: page.imageAssetKey!,
                            }}
                          />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text content */}
                  <div className="flex-1 p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Page {i + 1}
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {page.text}
                    </p>

                    {page.imageAssetKey && (
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <PromptEditor
                          prompt={page.imagePrompt ?? page.text}
                          onPromptChange={(newPrompt) =>
                            handlePromptChange(page.id, newPrompt)
                          }
                          onRegenerate={() => handleRegenerate(page.id)}
                          isGenerating={isRegenerating}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={`${resource.name || "book"}${exportSettings.booklet ? "-booklet" : ""}`}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
        showWatermarkNotice={user?.subscription !== "pro"}
        settingsPanel={
          <BookSettings
            settings={exportSettings}
            onSettingsChange={setExportSettings}
          />
        }
      />

      {editingKey && (
        <ImageEditorModal
          open={!!editingKey}
          onOpenChange={(open) => setEditingKey(open ? editingKey : null)}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: editingKey === "book_cover"
              ? "book_cover_image"
              : "book_page_image",
            assetKey: editingKey,
          }}
          imageUrl={assetMap.get(editingKey) as string}
          aspectRatio={editingKey === "book_cover" ? 3 / 4 : 4 / 3}
          title="Edit book image"
        />
      )}

      {improvingKey && (() => {
        const asset = assets?.find((a) => a.assetKey === improvingKey);
        const cv = asset?.currentVersion;
        const url = cv?.url;
        if (!cv || !url) return null;
        const isCover = asset?.assetType === "book_cover_image";
        return (
          <ImproveImageModal
            open={true}
            onOpenChange={(open) => { if (!open) setImprovingKey(null); }}
            imageUrl={url}
            originalPrompt={cv.prompt}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: isCover ? "book_cover_image" : "book_page_image",
              assetKey: improvingKey,
            }}
            currentStorageId={cv.storageId}
            currentVersionId={cv._id}
            styleId={resource?.styleId as Id<"styles"> | undefined}
            aspect="3:4"
          />
        );
      })()}

      {user && (
        <AddToCollectionDialog
          open={showCollectionDialog}
          onOpenChange={setShowCollectionDialog}
          resourceIds={[resourceId]}
          userId={user._id}
        />
      )}
    </div>
  );
}
