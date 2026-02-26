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
import { Paintbrush } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import { ExportModal } from "@/components/resource/ExportModal";
import type { BoardGameContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";

interface BoardGameDetailProps {
  resourceId: Id<"resources">;
}

export function BoardGameDetail({ resourceId }: BoardGameDetailProps) {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
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
  const boardAsset = useQuery(api.assets.getAsset, {
    ownerType: "resource",
    ownerId: resourceId,
    assetType: "board_image",
    assetKey: "board_main",
  });

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const buildPdfBlob = useCallback(async () => {
    if (!boardAsset?.currentVersion?.url) throw new Error("No image");
    return generateImagePagesPDF({
      images: [boardAsset.currentVersion.url],
      layout: "full_page",
      watermark: user?.subscription !== "pro",
    });
  }, [boardAsset, user?.subscription]);

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
  const content = resource.content as BoardGameContent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle="Board Game"
        onExport={() => setExportOpen(true)}
        exportDisabled={!boardAsset?.currentVersion?.url}
        deleteTitle="Delete this board game?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

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
        {boardAsset?.currentVersion && (
          <Button variant="outline" onClick={() => setIsImproveOpen(true)} className="gap-1.5">
            <Paintbrush className="size-4" aria-hidden="true" />
            Improve
          </Button>
        )}
      </div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "board-game"}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
        showWatermarkNotice={user?.subscription !== "pro"}
      />

      {boardAsset?.currentVersion?.url && (
        <>
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
          {boardAsset.currentVersion && (
            <ImproveImageModal
              open={isImproveOpen}
              onOpenChange={setIsImproveOpen}
              imageUrl={boardAsset.currentVersion.url}
              originalPrompt={boardAsset.currentVersion.prompt}
              assetRef={{
                ownerType: "resource",
                ownerId: resourceId,
                assetType: "board_image",
                assetKey: "board_main",
              }}
              currentStorageId={boardAsset.currentVersion.storageId}
              currentVersionId={boardAsset.currentVersion._id}
              styleId={resource?.styleId as Id<"styles"> | undefined}
              aspect="1:1"
            />
          )}
        </>
      )}
    </div>
  );
}
