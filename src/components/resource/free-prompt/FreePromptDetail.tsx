"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { DetailPageHeader, DetailPageSkeleton } from "@/components/resource/DetailPageHeader";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { PromptEditor } from "@/components/resource/PromptEditor";
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { Loader2, Paintbrush } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import { ExportModal } from "@/components/resource/ExportModal";
import type { FreePromptContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";
import { AddToCollectionDialog } from "@/components/resource/AddToCollectionDialog";

interface FreePromptDetailProps {
  resourceId: Id<"resources">;
}

export function FreePromptDetail({ resourceId }: FreePromptDetailProps) {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const [exportOpen, setExportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isImproveOpen, setIsImproveOpen] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const style = useQuery(
    api.styles.getStyle,
    resource?.styleId ? { styleId: resource.styleId } : "skip",
  );
  const asset = useQuery(api.assets.getAsset, {
    ownerType: "resource",
    ownerId: resourceId,
    assetType: "free_prompt_image",
    assetKey: "prompt_main",
  });
  const resourceCollections = useQuery(
    api.collections.getCollectionsForResource,
    user?._id ? { userId: user._id, resourceId } : "skip"
  );

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const buildPdfBlob = useCallback(async () => {
    if (!asset?.currentVersion?.url) throw new Error("No image");
    return generateImagePagesPDF({
      images: [asset.currentVersion.url],
      layout: "full_page",
      watermark: user?.subscription !== "pro",
    });
  }, [asset, user?.subscription]);

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
  const content = resource.content as FreePromptContent;
  const imageUrl = asset?.currentVersion?.url ?? null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle="Free Prompt"
        onExport={() => setExportOpen(true)}
        exportDisabled={!imageUrl}
        deleteTitle="Delete this resource?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        collections={resourceCollections}
        onAddToCollection={() => setShowCollectionDialog(true)}
      />

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <div
          className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden"
          style={{ aspectRatio: content.output.aspect === "1:1" ? "1/1" : content.output.aspect === "4:3" ? "4/3" : "3/4" }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              No image generated yet
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Prompt</p>
          <PromptEditor
            prompt={content.prompt}
            onPromptChange={async (newPrompt) => {
              await updateResource({
                resourceId: resource._id,
                content: { ...content, prompt: newPrompt },
              });
            }}
            onRegenerate={async () => {
              setIsRegenerating(true);
              try {
                await generateStyledImage({
                  ownerType: "resource",
                  ownerId: resource._id,
                  assetType: "free_prompt_image",
                  assetKey: content.imageAssetKey ?? "prompt_main",
                  prompt: content.prompt,
                  styleId: resource.styleId as Id<"styles"> | undefined,
                  aspect: content.output.aspect,
                });
              } finally {
                setIsRegenerating(false);
              }
            }}
            isGenerating={isRegenerating}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <AssetHistoryDialog
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "free_prompt_image",
            assetKey: "prompt_main",
          }}
          triggerLabel="History"
          aspectRatio={content.output.aspect === "1:1" ? "1/1" : content.output.aspect === "4:3" ? "4/3" : "3/4"}
        />
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
      </div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "free-prompt"}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
        showWatermarkNotice={user?.subscription !== "pro"}
      />

      {imageUrl && (
        <>
          <ImageEditorModal
            open={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: "free_prompt_image",
              assetKey: "prompt_main",
            }}
            imageUrl={imageUrl}
            aspectRatio={content.output.aspect === "3:4" ? 3/4 : content.output.aspect === "4:3" ? 4/3 : 1}
            title="Edit image"
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
                assetType: "free_prompt_image",
                assetKey: "prompt_main",
              }}
              currentStorageId={asset.currentVersion.storageId}
              currentVersionId={asset.currentVersion._id}
              styleId={resource?.styleId as Id<"styles"> | undefined}
              aspect={content.output.aspect}
            />
          )}
        </>
      )}

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
