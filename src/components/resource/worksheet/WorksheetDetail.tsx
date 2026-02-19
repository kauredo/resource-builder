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
import { BLOCK_TYPE_LABELS } from "./WorksheetBlockEditor";
import { generateWorksheetPDF } from "@/lib/pdf-worksheet";
import {
  ArrowLeft,
  Download,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import type { WorksheetContent, WorksheetBlock } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";

interface WorksheetDetailProps {
  resourceId: Id<"resources">;
}

export function WorksheetDetail({ resourceId }: WorksheetDetailProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
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

  const handleDownloadPDF = useCallback(async () => {
    if (!resource) return;
    const content = resource.content as WorksheetContent;
    setIsGeneratingPDF(true);
    try {
      // Legacy header image support
      const headerAsset = assets?.find(
        (a) => a.assetKey === "worksheet_header",
      );
      const headerImageUrl = headerAsset?.currentVersion?.url ?? undefined;

      const blob = await generateWorksheetPDF({
        content,
        style: style
          ? { colors: style.colors, typography: style.typography }
          : undefined,
        headerImageUrl,
        assetMap,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.name || "worksheet"}.pdf`;
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
  }, [resource, assets, assetMap, updateResource, style]);

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
          characterId: block.characterId as Id<"characters"> | undefined,
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
              Worksheet &middot; {content.blocks.length} block
              {content.blocks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="btn-coral gap-1.5"
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this worksheet?</AlertDialogTitle>
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
                      <Loader2
                        className="size-4 animate-spin motion-reduce:animate-none mr-2"
                        aria-hidden="true"
                      />
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
        <ResourceTagsEditor
          resourceId={resourceId}
          tags={resource.tags ?? []}
        />
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
          />
        ))}
      </div>

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
          title="Edit worksheet image"
        />
      )}
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
}: {
  block: WorksheetBlock;
  index: number;
  assetMap: Map<string, string>;
  isRegenerating: boolean;
  resourceId: Id<"resources">;
  onPromptChange: (blockId: string, newPrompt: string) => Promise<void>;
  onRegenerate: (blockId: string) => Promise<void>;
  onEditImage: (assetKey: string) => void;
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
                  className="object-cover"
                />
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 motion-reduce:transition-none ${
                    hoveredImage
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEditImage(block.imageAssetKey!)}
                      className="gap-1.5"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <AssetHistoryDialog
                      assetRef={{
                        ownerType: "resource",
                        ownerId: resourceId,
                        assetType: "worksheet_block_image",
                        assetKey: block.imageAssetKey!,
                      }}
                      triggerLabel="History"
                    />
                  </div>
                </div>
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
