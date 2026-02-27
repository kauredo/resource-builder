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
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { Loader2 } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import { ExportModal } from "@/components/resource/ExportModal";
import type { ColoringPagesContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";

interface ColoringPagesDetailProps {
  resourceId: Id<"resources">;
}

export function ColoringPagesDetail({ resourceId }: ColoringPagesDetailProps) {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const [exportOpen, setExportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);
  const [regeneratingPages, setRegeneratingPages] = useState<Set<string>>(new Set());

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
      if (asset.assetType !== "coloring_page_image") continue;
      if (asset.currentVersion?.url) map.set(asset.assetKey, asset.currentVersion.url);
    }
    return map;
  }, [assets]);

  const buildPdfBlob = useCallback(async () => {
    if (!resource) throw new Error("Resource not loaded");
    const content = resource.content as ColoringPagesContent;
    const imageUrls: string[] = [];
    for (const page of content.pages) {
      const url = page.imageAssetKey ? assetMap.get(page.imageAssetKey) : undefined;
      if (url) imageUrls.push(url);
    }
    if (imageUrls.length === 0) throw new Error("No images available");
    return generateImagePagesPDF({
      images: imageUrls,
      layout: "full_page",
      watermark: user?.subscription !== "pro",
    });
  }, [resource, assetMap, user?.subscription]);

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
      const content = resource.content as ColoringPagesContent;
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
      const content = resource.content as ColoringPagesContent;
      const page = content.pages.find((p) => p.id === pageId);
      if (!page?.imageAssetKey) return;

      setRegeneratingPages((prev) => new Set(prev).add(pageId));
      try {
        await generateStyledImage({
          ownerType: "resource",
          ownerId: resource._id,
          assetType: "coloring_page_image",
          assetKey: page.imageAssetKey,
          prompt: page.imagePrompt || page.title,
          styleId: resource.styleId as Id<"styles"> | undefined,
          characterIds: page.characterIds?.map((id) => id as Id<"characters">),
          aspect: "3:4",
        });
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

  if (!resource) return <DetailPageSkeleton />;
  const content = resource.content as ColoringPagesContent;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle={<>Coloring Pages &middot; {content.pages.length} page{content.pages.length !== 1 ? "s" : ""}</>}
        onExport={() => setExportOpen(true)}
        deleteTitle="Delete these coloring pages?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      {/* Page grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {content.pages.map((page) => {
          const imageUrl = page.imageAssetKey ? assetMap.get(page.imageAssetKey) : undefined;
          const isRegenerating = regeneratingPages.has(page.id);
          const isHovered = hoveredPage === page.id;

          return (
            <div key={page.id} className="space-y-2">
              <div
                className="rounded-xl border border-border/60 overflow-hidden bg-card"
                onMouseEnter={() => setHoveredPage(page.id)}
                onMouseLeave={() => setHoveredPage(null)}
              >
                <div className="relative aspect-[3/4] bg-muted/20">
                  {isRegenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" role="status">
                      <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">Generating...</span>
                    </div>
                  ) : imageUrl ? (
                    <>
                      <Image src={imageUrl} alt={page.title} fill className="object-cover" />
                      {page.imageAssetKey && (
                        <ImageHoverOverlay
                          isHovered={isHovered}
                          onEdit={() => setEditingKey(page.imageAssetKey)}
                          onImprove={() => setImprovingKey(page.imageAssetKey)}
                          assetRef={{
                            ownerType: "resource",
                            ownerId: resourceId,
                            assetType: "coloring_page_image",
                            assetKey: page.imageAssetKey,
                          }}
                          aspectRatio="3/4"
                        />
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">No image generated yet</span>
                    </div>
                  )}
                </div>

                <div className="px-3 py-2.5 text-center border-t border-border/40">
                  <p className="text-sm font-medium leading-tight">{page.title}</p>
                </div>
              </div>

              {page.description && (
                <p className="text-xs text-muted-foreground text-center leading-tight px-1">
                  {page.description}
                </p>
              )}

              {page.imageAssetKey && (
                <PromptEditor
                  prompt={page.imagePrompt || page.title}
                  onPromptChange={(newPrompt) => handlePromptChange(page.id, newPrompt)}
                  onRegenerate={() => handleRegenerate(page.id)}
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
        resourceName={resource.name || "coloring-pages"}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
        showWatermarkNotice={user?.subscription !== "pro"}
      />

      {editingKey && (
        <ImageEditorModal
          open={!!editingKey}
          onOpenChange={(open) => setEditingKey(open ? editingKey : null)}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "coloring_page_image",
            assetKey: editingKey,
          }}
          imageUrl={assetMap.get(editingKey) as string}
          aspectRatio={3 / 4}
          title="Edit coloring page"
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
              assetType: "coloring_page_image",
              assetKey: improvingKey,
            }}
            currentStorageId={cv.storageId}
            currentVersionId={cv._id}
            styleId={resource?.styleId as Id<"styles"> | undefined}
            aspect="3:4"
          />
        );
      })()}
    </div>
  );
}
