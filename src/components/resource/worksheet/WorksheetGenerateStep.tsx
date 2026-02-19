"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  Pencil,
} from "lucide-react";
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import type {
  WorksheetWizardState,
  WorksheetStateUpdater,
} from "./use-worksheet-wizard";
import type { ImageItem } from "@/components/resource/wizard/use-ai-wizard";

interface WorksheetGenerateStepProps {
  state: WorksheetWizardState;
  onUpdate: (updates: WorksheetStateUpdater) => void;
}

export function WorksheetGenerateStep({
  state,
  onUpdate,
}: WorksheetGenerateStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const generateImage = useAction(api.images.generateStyledImage);
  const ensureCharacterRef = useAction(
    api.characterActions.ensureCharacterReference,
  );

  const assets = useQuery(
    api.assets.getByOwner,
    state.resourceId
      ? { ownerType: "resource", ownerId: state.resourceId }
      : "skip",
  );

  // Restore image statuses from existing assets on mount
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    const allPending = state.imageItems.every((i) => i.status === "pending");
    if (!allPending) return;

    const updated = state.imageItems.map((item) => {
      const asset = assets.find((a) => a.assetKey === item.assetKey);
      if (asset?.currentVersion?.url) {
        return { ...item, status: "complete" as const };
      }
      return item;
    });

    if (
      updated.some((item, i) => item.status !== state.imageItems[i].status)
    ) {
      onUpdate({ imageItems: updated });
    }
  }, [assets]); // eslint-disable-line react-hooks/exhaustive-deps

  const runBatchGeneration = useCallback(
    async (indices: number[]) => {
      if (!state.resourceId) return;

      const BATCH_SIZE = 3;
      for (let b = 0; b < indices.length; b += BATCH_SIZE) {
        const batchIndices = indices.slice(b, b + BATCH_SIZE);

        onUpdate((prev) => ({
          imageItems: prev.imageItems.map((it, i) =>
            batchIndices.includes(i)
              ? { ...it, status: "generating" as const, error: undefined }
              : it,
          ),
        }));

        await Promise.allSettled(
          batchIndices.map(async (idx) => {
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

              await generateImage({
                ownerType: "resource",
                ownerId: state.resourceId!,
                assetType: item.assetType,
                assetKey: item.assetKey,
                prompt: item.prompt,
                style: styleArg,
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
    [
      state.imageItems,
      state.resourceId,
      state.stylePreset,
      generateImage,
      onUpdate,
    ],
  );

  const ensureReferences = useCallback(
    async (indices: number[]) => {
      if (!state.styleId) return;
      const charIds = [
        ...new Set(
          indices
            .map((i) => state.imageItems[i]?.characterId)
            .filter((id): id is NonNullable<typeof id> => !!id),
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

  const generateSingle = useCallback(
    async (index: number) => {
      await runBatchGeneration([index]);
    },
    [runBatchGeneration],
  );

  const completedCount = state.imageItems.filter(
    (i) => i.status === "complete",
  ).length;
  const failedCount = state.imageItems.filter(
    (i) => i.status === "error",
  ).length;
  const totalCount = state.imageItems.length;
  const hasStarted = state.imageItems.some((i) => i.status !== "pending");

  const groups = useMemo(() => {
    const grouped: {
      label: string;
      items: { item: ImageItem; index: number }[];
    }[] = [];
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

  // No images to generate — text-only worksheet
  if (totalCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
          <FileText
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <h3 className="text-lg font-medium mb-2">Text-only worksheet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          This worksheet has no image blocks — you can proceed directly to
          export.
        </p>
      </div>
    );
  }

  // Pre-generation
  if (!hasStarted) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
          <div className="size-16 rounded-2xl bg-coral/20 flex items-center justify-center mx-auto mb-5">
            <Wand2 className="size-8 text-coral" aria-hidden="true" />
          </div>
          <h3 className="text-2xl font-medium mb-2">
            Ready to illustrate your worksheet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            AI will create {totalCount} illustration
            {totalCount !== 1 ? "s" : ""} for your worksheet.
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

        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.items.map(({ item }) => (
                  <div
                    key={item.assetKey}
                    className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-foreground/80 flex items-center gap-2"
                  >
                    <span className="font-medium capitalize">
                      {item.label}
                    </span>
                    <span className="text-muted-foreground ml-auto text-xs truncate max-w-[50%]">
                      {item.prompt.slice(0, 80)}
                      {item.prompt.length > 80 ? "..." : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // During/after generation
  return (
    <div className="space-y-6">
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

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {group.label}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.items.map(({ item, index }) => {
                const asset = assets?.find(
                  (a) => a.assetKey === item.assetKey,
                );
                const imageUrl = asset?.currentVersion?.url ?? null;

                return (
                  <div
                    key={item.assetKey}
                    className="rounded-xl border border-border/60 bg-card overflow-hidden"
                  >
                    <div className="relative bg-muted/30 aspect-[4/3]">
                      {item.status === "complete" && imageUrl && (
                        <img
                          src={imageUrl}
                          alt={item.label || item.assetKey}
                          className="size-full object-cover"
                        />
                      )}
                      {item.status === "generating" && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          role="status"
                        >
                          <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" />
                        </div>
                      )}
                      {item.status === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <AlertCircle className="size-8 text-red-400 mb-2" />
                          <p className="text-xs text-red-600 line-clamp-2">
                            {item.error || "Failed"}
                          </p>
                        </div>
                      )}
                      {item.status === "pending" && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          role="status"
                          aria-label="Pending"
                        >
                          <div className="size-8 rounded-full border-2 border-border/50" />
                        </div>
                      )}
                      {item.status === "complete" && !isGenerating && (
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 focus-within:bg-black/40 transition-colors duration-150 motion-reduce:transition-none flex items-center justify-center opacity-0 hover:opacity-100 focus-within:opacity-100">
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => generateSingle(index)}
                              className="w-full gap-1.5"
                            >
                              <RefreshCw
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              Regenerate
                            </Button>
                            {state.resourceId && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setEditingKey(item.assetKey)}
                                  className="w-full gap-1.5"
                                >
                                  <Pencil className="size-3.5" aria-hidden="true" />
                                  Edit
                                </Button>
                                <AssetHistoryDialog
                                  assetRef={{
                                    ownerType: "resource",
                                    ownerId: state.resourceId,
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
                        <Check className="size-3.5 text-teal shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground truncate">
                        {item.label}
                      </span>
                      {item.status === "error" && !isGenerating && (
                        <button
                          type="button"
                          onClick={() => generateSingle(index)}
                          className="ml-auto text-xs text-coral hover:text-coral/80 cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Image editor modal */}
      {editingKey && state.resourceId && (() => {
        const item = state.imageItems.find((i) => i.assetKey === editingKey);
        const asset = assets?.find((a) => a.assetKey === editingKey);
        const url = asset?.currentVersion?.url;
        if (!item || !url) return null;
        return (
          <ImageEditorModal
            open={true}
            onOpenChange={(open) => { if (!open) setEditingKey(null); }}
            assetRef={{
              ownerType: "resource",
              ownerId: state.resourceId!,
              assetType: item.assetType as any,
              assetKey: item.assetKey,
            }}
            imageUrl={url}
            aspectRatio={
              item.aspect
                ? Number(item.aspect.split(":")[0]) / Number(item.aspect.split(":")[1])
                : undefined
            }
          />
        );
      })()}
    </div>
  );
}
