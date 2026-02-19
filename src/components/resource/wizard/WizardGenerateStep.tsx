"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw, Check, AlertCircle, Loader2, Pencil } from "lucide-react";
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import type { AIWizardState, ImageItem, StateUpdater } from "./use-ai-wizard";

interface WizardGenerateStepProps {
  state: AIWizardState;
  onUpdate: (updates: StateUpdater) => void;
}

export function WizardGenerateStep({
  state,
  onUpdate,
}: WizardGenerateStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const generateImage = useAction(api.images.generateStyledImage);
  const generateIconImage = useAction(api.cardGameImages.generateIconImage);
  const ensureCharacterRef = useAction(api.characterActions.ensureCharacterReference);

  // Query assets to restore previously generated images
  const assets = useQuery(
    api.assets.getByOwner,
    state.resourceId
      ? { ownerType: "resource", ownerId: state.resourceId }
      : "skip",
  );

  // Restore image statuses from existing assets on mount
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    // Only restore if all items are still pending
    const allPending = state.imageItems.every((i) => i.status === "pending");
    if (!allPending) return;

    const updated = state.imageItems.map((item) => {
      const asset = assets.find((a) => a.assetKey === item.assetKey);
      if (asset?.currentVersion?.url) {
        return { ...item, status: "complete" as const };
      }
      return item;
    });

    if (updated.some((item, i) => item.status !== state.imageItems[i].status)) {
      onUpdate({ imageItems: updated });
    }
  }, [assets]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Generate images for given indices with batched concurrency */
  const runBatchGeneration = useCallback(
    async (indices: number[]) => {
      if (!state.resourceId) return;

      const BATCH_SIZE = 3;
      for (let b = 0; b < indices.length; b += BATCH_SIZE) {
        const batchIndices = indices.slice(b, b + BATCH_SIZE);

        // Mark batch as generating (functional updater avoids stale closure)
        onUpdate((prev) => ({
          imageItems: prev.imageItems.map((it, i) =>
            batchIndices.includes(i)
              ? { ...it, status: "generating" as const, error: undefined }
              : it,
          ),
        }));

        await Promise.allSettled(
          batchIndices.map(async (idx) => {
            // Read immutable item data (prompt, assetKey, etc.) from closure
            const item = state.imageItems[idx];
            try {
              const styleArg = state.stylePreset
                ? {
                    colors: {
                      primary: state.stylePreset.colors.primary,
                      secondary: state.stylePreset.colors.secondary,
                      accent: state.stylePreset.colors.accent,
                    },
                    illustrationStyle: state.stylePreset.illustrationStyle,
                  }
                : undefined;

              if (item.greenScreen) {
                // Route to green screen icon generation (single character only)
                await generateIconImage({
                  ownerType: "resource",
                  ownerId: state.resourceId!,
                  assetType: item.assetType,
                  assetKey: item.assetKey,
                  prompt: item.prompt,
                  style: styleArg,
                  characterId: item.characterIds?.[0],
                });
              } else {
                await generateImage({
                  ownerType: "resource",
                  ownerId: state.resourceId!,
                  assetType: item.assetType,
                  assetKey: item.assetKey,
                  prompt: item.prompt,
                  style: styleArg,
                  characterIds: item.characterIds,
                  includeText: item.includeText,
                  aspect: item.aspect,
                });
              }

              onUpdate((prev) => ({
                imageItems: prev.imageItems.map((it, i) =>
                  i === idx
                    ? { ...it, status: "complete" as const, error: undefined }
                    : it,
                ),
              }));
            } catch (error) {
              onUpdate((prev) => ({
                imageItems: prev.imageItems.map((it, i) =>
                  i === idx
                    ? {
                        ...it,
                        status: "error" as const,
                        error:
                          error instanceof Error
                            ? error.message
                            : "Unknown error",
                      }
                    : it,
                ),
              }));
            }
          }),
        );
      }
    },
    [state.imageItems, state.resourceId, state.stylePreset, generateImage, generateIconImage, onUpdate],
  );

  const generateSingle = useCallback(
    async (index: number) => {
      if (!state.resourceId || !state.imageItems[index]) return;
      await runBatchGeneration([index]);
    },
    [state.resourceId, state.imageItems, runBatchGeneration],
  );

  /** Ensure styled reference images exist for all characters in the given indices */
  const ensureReferences = useCallback(
    async (indices: number[]) => {
      if (!state.styleId) return;
      const charIds = [
        ...new Set(
          indices.flatMap((i) => state.imageItems[i]?.characterIds ?? []),
        ),
      ];
      if (charIds.length === 0) return;
      await Promise.allSettled(
        charIds.map((id) =>
          ensureCharacterRef({ characterId: id, styleId: state.styleId! }),
        ),
      );
    },
    [state.styleId, state.imageItems, ensureCharacterRef],
  );

  const generateAll = useCallback(async () => {
    const pendingIndices = state.imageItems
      .map((item, i) => (item.status !== "complete" ? i : -1))
      .filter((i) => i !== -1);
    if (pendingIndices.length === 0) return;
    setIsGenerating(true);
    await ensureReferences(pendingIndices);
    await runBatchGeneration(pendingIndices);
    setIsGenerating(false);
  }, [state.imageItems, runBatchGeneration, ensureReferences]);

  const regenerateAll = useCallback(async () => {
    // Reset all to pending
    onUpdate((prev) => ({
      imageItems: prev.imageItems.map((item) => ({
        ...item,
        status: "pending" as const,
        error: undefined,
      })),
    }));
    setIsGenerating(true);
    const allIndices = state.imageItems.map((_, i) => i);
    await ensureReferences(allIndices);
    await runBatchGeneration(allIndices);
    setIsGenerating(false);
  }, [state.imageItems, onUpdate, runBatchGeneration, ensureReferences]);

  const completedCount = state.imageItems.filter(
    (i) => i.status === "complete",
  ).length;
  const failedCount = state.imageItems.filter(
    (i) => i.status === "error",
  ).length;
  const pendingCount = state.imageItems.filter(
    (i) => i.status === "pending",
  ).length;
  const totalCount = state.imageItems.length;
  const hasStarted = state.imageItems.some((i) => i.status !== "pending");

  // Group items for display
  const groups = useMemo(() => {
    const grouped: { label: string; items: { item: ImageItem; index: number }[] }[] = [];
    const seen = new Set<string>();

    state.imageItems.forEach((item, index) => {
      const label = item.group || "Images";
      if (!seen.has(label)) {
        seen.add(label);
        grouped.push({ label, items: [] });
      }
      grouped.find((g) => g.label === label)!.items.push({ item, index });
    });

    return grouped;
  }, [state.imageItems]);

  const hasGroups = groups.length > 1 || (groups.length === 1 && groups[0].label !== "Images");

  // Pre-generation view
  if (!hasStarted) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coral/5 via-coral/8 to-teal/5 border border-coral/20 p-8 text-center">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-4 left-8 w-16 h-16 rounded-2xl bg-coral/10 rotate-12" />
            <div className="absolute bottom-6 right-12 w-12 h-12 rounded-xl bg-teal/10 -rotate-6" />
          </div>

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-coral/20 flex items-center justify-center mx-auto mb-5">
              <Wand2 className="size-8 text-coral" aria-hidden="true" />
            </div>

            <h3 className="font-serif text-2xl font-medium mb-2">
              Ready to generate images
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              AI will create {totalCount} image{totalCount !== 1 ? "s" : ""} styled to match your selection.
            </p>

            <Button
              size="lg"
              onClick={generateAll}
              className="btn-coral gap-2 text-base px-8 min-h-[48px]"
            >
              <Wand2 className="size-5" aria-hidden="true" />
              Generate {totalCount} Image{totalCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>

        {/* Preview of what will be generated */}
        <div className="space-y-4">
          {hasGroups ? (
            groups.map((group) => (
              <div key={group.label}>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {group.label}
                </h4>
                <div className="space-y-2">
                  {group.items.map(({ item }) => (
                    <ItemPreviewRow key={item.assetKey} item={item} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Images to generate
              </h4>
              <div className="space-y-2">
                {state.imageItems.map((item) => (
                  <ItemPreviewRow key={item.assetKey} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // During/after generation
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {isGenerating ? "Generating..." : "Generation complete"}
          </span>
          <span className="tabular-nums font-medium">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-border/70">
          <div
            className="h-2 rounded-full bg-coral transition-all duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        {failedCount > 0 && (
          <p className="text-xs text-red-600">
            {failedCount} image{failedCount !== 1 ? "s" : ""} failed
          </p>
        )}
      </div>

      {/* Action buttons */}
      {!isGenerating && (
        <div className="flex justify-center gap-3">
          {pendingCount > 0 && (
            <Button onClick={generateAll} className="btn-coral gap-2">
              <Wand2 className="size-4" aria-hidden="true" />
              Generate Remaining ({pendingCount})
            </Button>
          )}
          {failedCount > 0 && (
            <Button variant="outline" onClick={generateAll} className="gap-2">
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry Failed ({failedCount})
            </Button>
          )}
          {completedCount > 0 && (
            <Button
              variant="outline"
              onClick={regenerateAll}
              className="gap-2"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Regenerate All
            </Button>
          )}
        </div>
      )}

      {/* Image grid — grouped if groups exist */}
      {hasGroups ? (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {group.label}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.items.map(({ item, index }) => {
                  const asset = assets?.find((a) => a.assetKey === item.assetKey);
                  const imageUrl = asset?.currentVersion?.url ?? null;

                  return (
                    <ImageItemCard
                      key={item.assetKey}
                      item={item}
                      imageUrl={imageUrl}
                      isGeneratingAll={isGenerating}
                      onRegenerate={() => generateSingle(index)}
                      resourceId={state.resourceId ?? null}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {state.imageItems.map((item, index) => {
            const asset = assets?.find((a) => a.assetKey === item.assetKey);
            const imageUrl = asset?.currentVersion?.url ?? null;

            return (
              <ImageItemCard
                key={item.assetKey}
                item={item}
                imageUrl={imageUrl}
                isGeneratingAll={isGenerating}
                onRegenerate={() => generateSingle(index)}
                resourceId={state.resourceId ?? null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemPreviewRow({ item }: { item: ImageItem }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-foreground/80 flex items-center gap-2">
      {item.greenScreen && (
        <span className="text-[10px] font-medium uppercase tracking-wider text-teal bg-teal/10 px-1.5 py-0.5 rounded">
          Icon
        </span>
      )}
      <span className="font-medium capitalize">
        {item.label || item.assetKey.replaceAll("_", " ")}
      </span>
      <span className="text-muted-foreground ml-auto text-xs truncate max-w-[50%]">
        {item.prompt.slice(0, 80)}
        {item.prompt.length > 80 ? "..." : ""}
      </span>
    </div>
  );
}

function ImageItemCard({
  item,
  imageUrl,
  isGeneratingAll,
  onRegenerate,
  resourceId,
}: {
  item: ImageItem;
  imageUrl: string | null;
  isGeneratingAll: boolean;
  onRegenerate: () => void;
  resourceId: string | null;
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const hasAsset = !!resourceId && !!imageUrl;
  // Checkerboard background for transparent icons
  const bgStyle = item.greenScreen
    ? {
        backgroundImage:
          "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), " +
          "linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), " +
          "linear-gradient(45deg, transparent 75%, #e0e0e0 75%), " +
          "linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
        backgroundSize: "16px 16px",
        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
      }
    : undefined;

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div
        className={`relative bg-muted/30 ${item.aspect === "1:1" ? "aspect-square" : "aspect-[3/4]"}`}
        style={bgStyle}
      >
        {item.status === "complete" && imageUrl && (
          <img
            src={imageUrl}
            alt={item.label || item.assetKey}
            className="w-full h-full object-cover"
          />
        )}

        {item.status === "generating" && (
          <div className="absolute inset-0 flex items-center justify-center" role="status">
            <Loader2
              className="size-8 text-coral animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span className="sr-only">Generating image</span>
          </div>
        )}

        {item.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle
              className="size-8 text-red-400 mb-2"
              aria-hidden="true"
            />
            <p className="text-xs text-red-600 line-clamp-2">
              {item.error || "Failed"}
            </p>
          </div>
        )}

        {item.status === "pending" && !isGeneratingAll && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="sm"
              onClick={onRegenerate}
              className="btn-coral gap-1.5"
            >
              <Wand2 className="size-3.5" aria-hidden="true" />
              Generate
            </Button>
          </div>
        )}
        {item.status === "pending" && isGeneratingAll && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-border/50" />
          </div>
        )}

        {/* Action overlay on hover */}
        {item.status === "complete" && !isGeneratingAll && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 focus-within:bg-black/40 transition-colors duration-150 motion-reduce:transition-none flex items-center justify-center opacity-0 hover:opacity-100 focus-within:opacity-100">
            <div className="flex flex-col gap-2 min-w-[140px]">
              <Button
                size="sm"
                variant="secondary"
                onClick={onRegenerate}
                className="w-full gap-1.5"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Regenerate
              </Button>
              {hasAsset && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditorOpen(true)}
                    className="w-full gap-1.5"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <AssetHistoryDialog
                    assetRef={{
                      ownerType: "resource",
                      ownerId: resourceId!,
                      assetType: item.assetType as any,
                      assetKey: item.assetKey,
                    }}
                    triggerLabel="History"
                    triggerClassName="w-full"
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-2 flex items-center gap-2">
        {item.status === "complete" && (
          <Check className="size-3.5 text-teal shrink-0" aria-hidden="true" />
        )}
        <span className="text-xs text-muted-foreground truncate capitalize">
          {item.label || item.assetKey.replaceAll("_", " ")}
        </span>
        {item.status === "error" && !isGeneratingAll && (
          <button
            type="button"
            onClick={onRegenerate}
            className="ml-auto text-xs text-coral hover:text-coral/80 cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            Retry
          </button>
        )}
      </div>

      {hasAsset && (
        <ImageEditorModal
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId!,
            assetType: item.assetType as any,
            assetKey: item.assetKey,
          }}
          imageUrl={imageUrl!}
          aspectRatio={
            item.aspect
              ? Number(item.aspect.split(":")[0]) / Number(item.aspect.split(":")[1])
              : undefined
          }
        />
      )}
    </div>
  );
}
