"use client";

import { useState, useCallback, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw, Check, AlertCircle, Loader2 } from "lucide-react";
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
      if (!state.resourceId || !state.stylePreset) return;

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
              await generateImage({
                ownerType: "resource",
                ownerId: state.resourceId!,
                assetType: item.assetType,
                assetKey: item.assetKey,
                prompt: item.prompt,
                style: {
                  colors: {
                    primary: state.stylePreset!.colors.primary,
                    secondary: state.stylePreset!.colors.secondary,
                    accent: state.stylePreset!.colors.accent,
                  },
                  illustrationStyle: state.stylePreset!.illustrationStyle,
                },
                characterId: item.characterId,
                includeText: item.includeText,
                aspect: item.aspect,
              });

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
    [state.imageItems, state.resourceId, state.stylePreset, generateImage, onUpdate],
  );

  const generateSingle = useCallback(
    async (index: number) => {
      if (!state.resourceId || !state.stylePreset || !state.imageItems[index])
        return;
      await runBatchGeneration([index]);
    },
    [state.resourceId, state.stylePreset, state.imageItems, runBatchGeneration],
  );

  const generateAll = useCallback(async () => {
    const pendingIndices = state.imageItems
      .map((item, i) => (item.status !== "complete" ? i : -1))
      .filter((i) => i !== -1);
    if (pendingIndices.length === 0) return;
    setIsGenerating(true);
    await runBatchGeneration(pendingIndices);
    setIsGenerating(false);
  }, [state.imageItems, runBatchGeneration]);

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
    await runBatchGeneration(allIndices);
    setIsGenerating(false);
  }, [state.imageItems, onUpdate, runBatchGeneration]);

  const completedCount = state.imageItems.filter(
    (i) => i.status === "complete",
  ).length;
  const failedCount = state.imageItems.filter(
    (i) => i.status === "error",
  ).length;
  const totalCount = state.imageItems.length;
  const hasStarted = state.imageItems.some((i) => i.status !== "pending");

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
              AI will create {totalCount} illustration{totalCount !== 1 ? "s" : ""} with
              text baked into each image, styled to match your selection.
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
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Images to generate
          </h4>
          <div className="space-y-2">
            {state.imageItems.map((item) => (
              <div
                key={item.assetKey}
                className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-foreground/80"
              >
                <span className="font-medium capitalize">{item.assetKey.replaceAll("_", " ")}</span>
                <span className="text-muted-foreground ml-2">
                  — {item.prompt.slice(0, 80)}
                  {item.prompt.length > 80 ? "..." : ""}
                </span>
              </div>
            ))}
          </div>
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

      {/* Image grid */}
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
            />
          );
        })}
      </div>
    </div>
  );
}

function ImageItemCard({
  item,
  imageUrl,
  isGeneratingAll,
  onRegenerate,
}: {
  item: ImageItem;
  imageUrl: string | null;
  isGeneratingAll: boolean;
  onRegenerate: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="aspect-square relative bg-muted/30">
        {item.status === "complete" && imageUrl && (
          <img
            src={imageUrl}
            alt={item.assetKey}
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

        {item.status === "pending" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-border/50" />
          </div>
        )}

        {/* Regenerate overlay on hover */}
        {item.status === "complete" && !isGeneratingAll && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 focus-within:bg-black/40 transition-colors duration-150 motion-reduce:transition-none flex items-center justify-center opacity-0 hover:opacity-100 focus-within:opacity-100">
            <Button
              size="sm"
              variant="secondary"
              onClick={onRegenerate}
              className="gap-1.5"
            >
              <RefreshCw className="size-3" aria-hidden="true" />
              Regenerate
            </Button>
          </div>
        )}
      </div>

      <div className="px-3 py-2 flex items-center gap-2">
        {item.status === "complete" && (
          <Check className="size-3.5 text-teal shrink-0" aria-hidden="true" />
        )}
        <span className="text-xs text-muted-foreground truncate capitalize">
          {item.assetKey.replaceAll("_", " ")}
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
    </div>
  );
}
