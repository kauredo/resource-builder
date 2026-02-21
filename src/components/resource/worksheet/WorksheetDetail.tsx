"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DetailPageHeader } from "@/components/resource/DetailPageHeader";
import { ImageHoverOverlay } from "@/components/resource/ImageHoverOverlay";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { PromptEditor } from "@/components/resource/PromptEditor";
import { BLOCK_TYPE_LABELS } from "./WorksheetBlockEditor";
import { generateWorksheetPDF } from "@/lib/pdf-worksheet";
import { Loader2 } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import {
  ExportModal,
  WorksheetSettings,
  type WorksheetExportSettings,
} from "@/components/resource/ExportModal";
import type { WorksheetContent, WorksheetBlock } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";

interface WorksheetDetailProps {
  resourceId: Id<"resources">;
}

export function WorksheetDetail({ resourceId }: WorksheetDetailProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState<WorksheetExportSettings | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [regeneratingBlocks, setRegeneratingBlocks] = useState<Set<string>>(
    new Set(),
  );
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
    if (!resource) throw new Error("No resource");
    const content = resource.content as WorksheetContent;
    const headerAsset = assets?.find(
      (a) => a.assetKey === "worksheet_header",
    );
    const headerImageUrl = headerAsset?.currentVersion?.url ?? undefined;

    return generateWorksheetPDF({
      content,
      style: style
        ? { colors: style.colors, typography: style.typography }
        : undefined,
      headerImageUrl,
      assetMap,
      orientation: exportSettings?.orientation ?? content.orientation,
    });
  }, [resource, assets, assetMap, style, exportSettings]);

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

  const handleBlockPromptChange = useCallback(
    async (blockId: string, newPrompt: string) => {
      if (!resource) return;
      const content = resource.content as WorksheetContent;
      const updatedBlocks = content.blocks.map((b) =>
        b.id === blockId ? { ...b, imagePrompt: newPrompt } : b,
      );
      await updateResource({
        resourceId: resource._id,
        content: { ...content, blocks: updatedBlocks },
      });
    },
    [resource, updateResource],
  );

  const handleBlockRegenerate = useCallback(
    async (blockId: string) => {
      if (!resource) return;
      const content = resource.content as WorksheetContent;
      const block = content.blocks.find((b) => b.id === blockId);
      if (!block?.imageAssetKey || !block.imagePrompt) return;

      setRegeneratingBlocks((prev) => new Set(prev).add(blockId));
      try {
        await generateStyledImage({
          ownerType: "resource",
          ownerId: resource._id,
          assetType: "worksheet_block_image",
          assetKey: block.imageAssetKey,
          prompt: `Worksheet illustration: ${block.imagePrompt}`,
          styleId: resource.styleId as Id<"styles"> | undefined,
          characterIds: block.characterIds?.map((id) => id as Id<"characters">),
          aspect: "4:3",
        });
      } finally {
        setRegeneratingBlocks((prev) => {
          const next = new Set(prev);
          next.delete(blockId);
          return next;
        });
      }
    },
    [resource, generateStyledImage],
  );

  if (!resource) return null;
  const content = resource.content as WorksheetContent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle={<>Worksheet &middot; {content.blocks.length} block{content.blocks.length !== 1 ? "s" : ""}</>}
        onExport={() => {
          const c = resource.content as WorksheetContent;
          setExportSettings({
            orientation: c.orientation ?? "portrait",
          });
          setExportOpen(true);
        }}
        deleteTitle="Delete this worksheet?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor
          resourceId={resourceId}
          tags={resource.tags ?? []}
        />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      {/* Worksheet title */}
      <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
        {content.title}
      </h2>

      {/* Blocks — each in its own card */}
      <div className="space-y-3">
        {content.blocks.map((block, index) => (
          <BlockPreview
            key={block.id || index}
            block={block}
            index={index}
            assetMap={assetMap}
            isRegenerating={regeneratingBlocks.has(block.id)}
            resourceId={resourceId}
            onPromptChange={handleBlockPromptChange}
            onRegenerate={handleBlockRegenerate}
            onEditImage={setEditingKey}
            onImproveImage={setImprovingKey}
          />
        ))}
      </div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "worksheet"}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
        settingsPanel={
          exportSettings && (
            <WorksheetSettings
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
            assetType: "worksheet_block_image",
            assetKey: editingKey,
          }}
          imageUrl={assetMap.get(editingKey) as string}
          aspectRatio={4 / 3}
          title="Edit worksheet image"
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
              assetType: "worksheet_block_image",
              assetKey: improvingKey,
            }}
            currentStorageId={cv.storageId}
            currentVersionId={cv._id}
            styleId={resource?.styleId as Id<"styles"> | undefined}
            aspect="4:3"
          />
        );
      })()}
    </div>
  );
}

function BlockPreview({
  block,
  index,
  assetMap,
  isRegenerating,
  resourceId,
  onPromptChange,
  onRegenerate,
  onEditImage,
  onImproveImage,
}: {
  block: WorksheetBlock;
  index: number;
  assetMap: Map<string, string>;
  isRegenerating: boolean;
  resourceId: Id<"resources">;
  onPromptChange: (blockId: string, newPrompt: string) => Promise<void>;
  onRegenerate: (blockId: string) => Promise<void>;
  onEditImage: (assetKey: string) => void;
  onImproveImage: (assetKey: string) => void;
}) {
  const imageUrl = block.imageAssetKey
    ? assetMap.get(block.imageAssetKey)
    : undefined;
  const [hoveredImage, setHoveredImage] = useState(false);

  // Image blocks get a side-by-side layout like BookDetail pages
  if (block.type === "image") {
    return (
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="px-4 py-2 bg-muted/30 border-b border-border/40">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Image
          </span>
        </div>
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div
            className="relative w-full sm:w-64 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[180px] bg-muted/20"
            onMouseEnter={() => setHoveredImage(true)}
            onMouseLeave={() => setHoveredImage(false)}
          >
            {isRegenerating ? (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                role="status"
              >
                <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" />
                <span className="text-sm text-muted-foreground">
                  Generating...
                </span>
              </div>
            ) : imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={block.caption || `Block ${index + 1} image`}
                  fill
                  className="object-contain bg-muted/10"
                />
                <ImageHoverOverlay
                  isHovered={hoveredImage}
                  onEdit={() => onEditImage(block.imageAssetKey!)}
                  onImprove={() => onImproveImage(block.imageAssetKey!)}
                  assetRef={{
                    ownerType: "resource",
                    ownerId: resourceId,
                    assetType: "worksheet_block_image",
                    assetKey: block.imageAssetKey!,
                  }}
                />
              </>
            ) : block.imagePrompt ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">No image</span>
              </div>
            ) : null}
          </div>

          {/* Content + controls */}
          <div className="flex-1 p-4 space-y-3">
            {block.caption && (
              <p className="text-sm text-foreground">{block.caption}</p>
            )}
            {block.imageAssetKey && block.imagePrompt && (
              <div className={block.caption ? "pt-2 border-t border-border/40" : ""}>
                <PromptEditor
                  prompt={block.imagePrompt}
                  onPromptChange={(newPrompt) =>
                    onPromptChange(block.id, newPrompt)
                  }
                  onRegenerate={() => onRegenerate(block.id)}
                  isGenerating={isRegenerating}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Non-image blocks: card with header bar + content
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="px-4 py-2 bg-muted/30 border-b border-border/40">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {BLOCK_TYPE_LABELS[block.type] || block.type}
        </span>
      </div>
      <div className="p-4">
        {block.type === "heading" && (
          <h3 className="font-serif text-lg font-medium">{block.text}</h3>
        )}
        {(block.type === "prompt" || block.type === "text") && (
          <p className="text-sm leading-relaxed">{block.text}</p>
        )}
        {block.type === "lines" && (
          <div className="space-y-2.5 py-1">
            {Array.from({ length: block.lines ?? 3 }).map((_, i) => (
              <div key={i} className="h-px bg-foreground/15" />
            ))}
          </div>
        )}
        {block.type === "checklist" && (
          <ul className="space-y-1.5">
            {(block.items ?? []).map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <div className="size-3.5 rounded-sm border border-foreground/30 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {block.type === "scale" && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {block.scaleLabels?.min}
            </span>
            <div className="flex-1 flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="size-4 rounded-full border-2 border-foreground/20"
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {block.scaleLabels?.max}
            </span>
          </div>
        )}
        {block.type === "drawing_box" && (
          <div className="h-28 rounded-lg border-2 border-dashed border-foreground/20 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              {block.label || "Draw here"}
            </span>
          </div>
        )}
        {block.type === "word_bank" && (
          <div className="flex flex-wrap gap-2">
            {(block.words ?? []).map((word, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-coral/10 text-sm text-foreground"
              >
                {word}
              </span>
            ))}
          </div>
        )}
        {block.type === "matching" && (
          <div className="space-y-1.5">
            {(block.leftItems ?? []).map((left, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="font-medium w-6">{i + 1}.</span>
                <span className="flex-1">{left}</span>
                <span className="w-12 border-b border-dotted border-foreground/30" />
                <span className="font-medium w-6">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="flex-1">
                  {(block.rightItems ?? [])[i] || ""}
                </span>
              </div>
            ))}
          </div>
        )}
        {block.type === "fill_in_blank" && (
          <p className="text-sm leading-relaxed">
            {(block.text ?? "").split("___").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block w-24 border-b-2 border-foreground/30 mx-1" />
                )}
              </span>
            ))}
          </p>
        )}
        {block.type === "multiple_choice" && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{block.question}</p>
            <div className="space-y-1.5 ml-2">
              {(block.options ?? []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="size-3.5 rounded-full border-2 border-foreground/30 shrink-0" />
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}
        {block.type === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-foreground/15 rounded-lg">
              <thead>
                <tr className="bg-muted/30">
                  {(block.headers ?? []).map((h, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b border-foreground/15"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(block.tableRows ?? []).map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-foreground/10 last:border-b-0"
                  >
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="px-3 py-2 text-sm">
                        {cell || (
                          <span className="text-muted-foreground/40">...</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
