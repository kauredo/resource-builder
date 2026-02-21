"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { DetailPageHeader, DetailPageSkeleton } from "@/components/resource/DetailPageHeader";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { Loader2, RefreshCw, Paintbrush } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import { ExportModal } from "@/components/resource/ExportModal";
import type { PosterContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";
import { toast } from "sonner";

interface PosterDetailProps {
  resourceId: Id<"resources">;
}

export function PosterDetail({ resourceId }: PosterDetailProps) {
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isImproveOpen, setIsImproveOpen] = useState(false);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const style = useQuery(
    api.styles.getStyle,
    resource?.styleId ? { styleId: resource.styleId } : "skip",
  );
  const asset = useQuery(api.assets.getAsset, {
    ownerType: "resource",
    ownerId: resourceId,
    assetType: "poster_image",
    assetKey: "poster_main",
  });

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const handleRegenerate = useCallback(async () => {
    if (!resource) return;
    const content = resource.content as PosterContent;
    setIsRegenerating(true);
    try {
      await generateStyledImage({
        ownerType: "resource",
        ownerId: resource._id,
        assetType: "poster_image",
        assetKey: content.imageAssetKey ?? "poster_main",
        prompt: content.headline + (content.subtext ? ` — ${content.subtext}` : ""),
        styleId: resource.styleId as Id<"styles"> | undefined,
        aspect: "3:4",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image generation failed. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  }, [resource, generateStyledImage]);

  const buildPdfBlob = useCallback(async () => {
    if (!asset?.currentVersion?.url) throw new Error("No image");
    return generateImagePagesPDF({
      images: [asset.currentVersion.url],
      layout: "full_page",
    });
  }, [asset]);

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

  if (!resource) return <DetailPageSkeleton />;

  const content = resource.content as PosterContent;
  const imageUrl = asset?.currentVersion?.url ?? null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle="Poster"
        onExport={() => setExportOpen(true)}
        exportDisabled={!imageUrl}
        deleteTitle="Delete this poster?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="aspect-[3/4] rounded-xl border border-border/60 bg-muted/20 overflow-hidden mb-6">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={content.headline}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                No image generated yet
              </div>
            )}
          </div>
          <h2 className="font-serif text-2xl font-medium text-foreground">
            {content.headline}
          </h2>
          {content.subtext && (
            <p className="text-muted-foreground mt-2">{content.subtext}</p>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-sm font-medium">Asset controls</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="gap-1.5"
              >
                {isRegenerating ? (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <RefreshCw className="size-4" aria-hidden="true" />
                )}
                Regenerate
              </Button>
              {imageUrl && (
                <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
                  Edit image
                </Button>
              )}
              {asset?.currentVersion && imageUrl && (
                <Button variant="outline" onClick={() => setIsImproveOpen(true)} className="gap-1.5">
                  <Paintbrush className="size-4" aria-hidden="true" />
                  Improve
                </Button>
              )}
              <AssetHistoryDialog
                assetRef={{
                  ownerType: "resource",
                  ownerId: resourceId,
                  assetType: "poster_image",
                  assetKey: "poster_main",
                }}
                triggerLabel="History"
                aspectRatio="3/4"
              />
            </div>
          </div>
        </aside>
      </div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "poster"}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
      />

      {imageUrl && (
        <>
          <ImageEditorModal
            open={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: "poster_image",
              assetKey: "poster_main",
            }}
            imageUrl={imageUrl}
            aspectRatio={3 / 4}
            title="Edit poster image"
          />
          {asset?.currentVersion && (
            <ImproveImageModal
              open={isImproveOpen}
              onOpenChange={setIsImproveOpen}
              imageUrl={imageUrl}
              originalPrompt={asset.currentVersion.prompt}
              assetRef={{
                ownerType: "resource",
                ownerId: resourceId,
                assetType: "poster_image",
                assetKey: "poster_main",
              }}
              currentStorageId={asset.currentVersion.storageId}
              currentVersionId={asset.currentVersion._id}
              styleId={resource?.styleId as Id<"styles"> | undefined}
              aspect="3:4"
            />
          )}
        </>
      )}
    </div>
  );
}
