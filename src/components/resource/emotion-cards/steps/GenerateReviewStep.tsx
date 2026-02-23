"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CardPreview } from "../CardPreview";
import { GenerationProgress } from "../GenerationProgress";
import { StyleContextBar } from "../StyleContextBar";
import { Wand2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEmotionDescription } from "@/lib/emotions";
import type { WizardState } from "../use-emotion-cards-wizard";
import type { StyleFrames } from "@/types";

interface GenerateReviewStepProps {
  state: WizardState;
  onUpdate: (updates: Partial<WizardState>) => void;
}

interface GenerationResult {
  emotion: string;
  storageId?: Id<"_storage">;
  url?: string;
  status: "pending" | "generating" | "complete" | "error";
  error?: string;
}

export function GenerateReviewStep({ state, onUpdate }: GenerateReviewStepProps) {
  const [results, setResults] = useState<Map<string, GenerationResult>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string | undefined>();
  const [hasInitialized, setHasInitialized] = useState(false);

  const generateCard = useAction(api.images.generateEmotionCard);

  // Query the resource to restore previously generated images
  const resource = useQuery(
    api.resources.getResourceWithImages,
    state.resourceId ? { resourceId: state.resourceId } : "skip"
  );

  // Query style with frame URLs for styled previews
  const style = useQuery(
    api.styles.getStyleWithFrameUrls,
    state.styleId ? { styleId: state.styleId } : "skip"
  );

  // Extract frame data
  const frames = style?.frames as StyleFrames | undefined;
  const frameCount = [frames?.border, frames?.fullCard].filter(Boolean).length;

  // Get image URLs for completed cards (for newly generated ones)
  const completedStorageIds = Array.from(results.values())
    .filter((r) => r.status === "complete" && r.storageId)
    .map((r) => r.storageId as Id<"_storage">);

  const imageUrls = useQuery(
    api.images.getImageUrls,
    completedStorageIds.length > 0 ? { storageIds: completedStorageIds } : "skip"
  );

  // Update URLs when they come in
  useEffect(() => {
    if (imageUrls) {
      setResults((prev) => {
        const updated = new Map(prev);
        for (const [storageId, url] of Object.entries(imageUrls)) {
          for (const [emotion, result] of updated.entries()) {
            if (result.storageId === storageId && url) {
              updated.set(emotion, { ...result, url });
            }
          }
        }
        return updated;
      });
    }
  }, [imageUrls]);

  // Initialize results when step loads - restore from resource if available
  useEffect(() => {
    // Don't initialize until we have the emotions list
    if (state.selectedEmotions.length === 0) return;

    // Wait for resource query to complete (not undefined = still loading)
    // resource will be null if not found, or an object if found
    if (resource === undefined) return;

    // Already initialized for this resource
    if (hasInitialized) return;

    const initial = new Map<string, GenerationResult>();

    // Check if we have saved images on the resource
    if (resource?.images && resource.images.length > 0) {
      // Restore from saved images
      for (const emotion of state.selectedEmotions) {
        const savedImage = resource.images.find((img) => img.description === emotion);
        if (savedImage) {
          initial.set(emotion, {
            emotion,
            status: "complete",
            storageId: savedImage.storageId,
            url: savedImage.url ?? undefined,
          });
        } else {
          initial.set(emotion, { emotion, status: "pending" });
        }
      }
      // Update generation status if all are complete
      const allComplete = state.selectedEmotions.every((e) =>
        resource.images.some((img) => img.description === e)
      );
      if (allComplete) {
        onUpdate({ generationStatus: "complete" });
      }
    } else {
      // No saved images, start fresh
      for (const emotion of state.selectedEmotions) {
        initial.set(emotion, { emotion, status: "pending" });
      }
    }

    setResults(initial);
    setHasInitialized(true);
  }, [state.selectedEmotions, resource, hasInitialized, onUpdate]);

  // Update wizard state when generation completes
  useEffect(() => {
    const allComplete = Array.from(results.values()).every(
      (r) => r.status === "complete" || r.status === "error"
    );
    const anyComplete = Array.from(results.values()).some(
      (r) => r.status === "complete"
    );

    if (allComplete && anyComplete && results.size > 0) {
      onUpdate({ generationStatus: "complete" });
    }
  }, [results, onUpdate]);

  const generateSingleCard = useCallback(
    async (emotion: string) => {
      if (!state.resourceId) return;

      setResults((prev) => {
        const updated = new Map(prev);
        updated.set(emotion, { emotion, status: "generating" });
        return updated;
      });

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

        const result = await generateCard({
          resourceId: state.resourceId,
          emotion,
          style: styleArg,
          characterId: state.characterIds?.[0] ?? undefined,
          includeText: state.includeTextInImage,
        });

        setResults((prev) => {
          const updated = new Map(prev);
          updated.set(emotion, {
            emotion,
            status: "complete",
            storageId: result.storageId as Id<"_storage">,
          });
          return updated;
        });
      } catch (error) {
        setResults((prev) => {
          const updated = new Map(prev);
          updated.set(emotion, {
            emotion,
            status: "error",
            error: error instanceof Error ? error.message : "Generation failed — try again",
          });
          return updated;
        });
      }
    },
    [state.resourceId, state.stylePreset, state.characterIds, state.includeTextInImage, generateCard]
  );

  const startGeneration = useCallback(async () => {
    if (!state.resourceId) return;

    setIsGenerating(true);
    onUpdate({ generationStatus: "generating" });

    // Reset pending/error cards
    setResults((prev) => {
      const updated = new Map(prev);
      for (const [emotion, result] of updated.entries()) {
        if (result.status !== "complete") {
          updated.set(emotion, { emotion, status: "pending" });
        }
      }
      return updated;
    });

    // Build style arg once
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

    // Generate cards with concurrency limit
    const BATCH_SIZE = 3;
    const pendingEmotions = state.selectedEmotions.filter((emotion) => {
      const result = results.get(emotion);
      return !result || result.status !== "complete";
    });

    for (let i = 0; i < pendingEmotions.length; i += BATCH_SIZE) {
      const batch = pendingEmotions.slice(i, i + BATCH_SIZE);

      // Mark batch as generating
      setResults((prev) => {
        const updated = new Map(prev);
        for (const emotion of batch) {
          updated.set(emotion, { emotion, status: "generating" });
        }
        return updated;
      });

      setCurrentEmotion(batch[0]);

      // Generate batch in parallel
      await Promise.allSettled(
        batch.map(async (emotion) => {
          try {
            const result = await generateCard({
              resourceId: state.resourceId!,
              emotion,
              style: styleArg,
              characterId: state.characterIds?.[0] ?? undefined,
              includeText: state.includeTextInImage,
            });

            setResults((prev) => {
              const updated = new Map(prev);
              updated.set(emotion, {
                emotion,
                status: "complete",
                storageId: result.storageId as Id<"_storage">,
              });
              return updated;
            });
          } catch (error) {
            setResults((prev) => {
              const updated = new Map(prev);
              updated.set(emotion, {
                emotion,
                status: "error",
                error: error instanceof Error ? error.message : "Generation failed — try again",
              });
              return updated;
            });
          }
        })
      );
    }

    setIsGenerating(false);
    setCurrentEmotion(undefined);
  }, [
    state.resourceId,
    state.stylePreset,
    state.characterIds,
    state.includeTextInImage,
    state.selectedEmotions,
    results,
    generateCard,
    onUpdate,
  ]);

  const regenerateAll = useCallback(async () => {
    if (!state.resourceId) return;

    setIsGenerating(true);
    onUpdate({ generationStatus: "generating" });

    // Reset ALL cards to pending
    setResults(() => {
      const updated = new Map<string, GenerationResult>();
      for (const emotion of state.selectedEmotions) {
        updated.set(emotion, { emotion, status: "pending" });
      }
      return updated;
    });

    // Build style arg once
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

    // Generate ALL cards with concurrency limit
    const BATCH_SIZE = 3;
    const allEmotions = state.selectedEmotions;

    for (let i = 0; i < allEmotions.length; i += BATCH_SIZE) {
      const batch = allEmotions.slice(i, i + BATCH_SIZE);

      // Mark batch as generating
      setResults((prev) => {
        const updated = new Map(prev);
        for (const emotion of batch) {
          updated.set(emotion, { emotion, status: "generating" });
        }
        return updated;
      });

      setCurrentEmotion(batch[0]);

      // Generate batch in parallel
      await Promise.allSettled(
        batch.map(async (emotion) => {
          try {
            const result = await generateCard({
              resourceId: state.resourceId!,
              emotion,
              style: styleArg,
              characterId: state.characterIds?.[0] ?? undefined,
              includeText: state.includeTextInImage,
            });

            setResults((prev) => {
              const updated = new Map(prev);
              updated.set(emotion, {
                emotion,
                status: "complete",
                storageId: result.storageId as Id<"_storage">,
              });
              return updated;
            });
          } catch (error) {
            setResults((prev) => {
              const updated = new Map(prev);
              updated.set(emotion, {
                emotion,
                status: "error",
                error: error instanceof Error ? error.message : "Generation failed — try again",
              });
              return updated;
            });
          }
        })
      );
    }

    setIsGenerating(false);
    setCurrentEmotion(undefined);
  }, [
    state.resourceId,
    state.stylePreset,
    state.characterIds,
    state.includeTextInImage,
    state.selectedEmotions,
    generateCard,
    onUpdate,
  ]);

  const completedCount = Array.from(results.values()).filter(
    (r) => r.status === "complete"
  ).length;
  const failedCount = Array.from(results.values()).filter(
    (r) => r.status === "error"
  ).length;
  const hasStarted = Array.from(results.values()).some(
    (r) => r.status !== "pending"
  );

  // Pre-generation view
  if (!hasStarted) {
    return (
      <div className="space-y-6">
        {/* Hero section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coral/5 via-coral/8 to-teal/5 border border-coral/20 p-8 text-center">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-4 left-8 size-16 rounded-2xl bg-coral/10 rotate-12" />
            <div className="absolute bottom-6 right-12 size-12 rounded-xl bg-teal/10 -rotate-6" />
            <div className="absolute top-1/2 right-1/4 size-8 rounded-lg bg-coral/5 rotate-45" />
          </div>

          <div className="relative">
            <div className="size-16 rounded-2xl bg-coral/20 flex items-center justify-center mx-auto mb-5">
              <Wand2 className="size-8 text-coral" aria-hidden="true" />
            </div>

            <h3 className="font-serif text-2xl font-medium mb-2">
              Ready to create your deck
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              AI will generate unique illustrations for each emotion,
              styled to match your selection.
            </p>

            <Button
              size="lg"
              onClick={startGeneration}
              className="btn-coral gap-2 text-base px-8 min-h-[48px]"
            >
              <Wand2 className="size-5" aria-hidden="true" />
              Create {state.selectedEmotions.length} Card{state.selectedEmotions.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>

        {/* Preview of what will be generated */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Cards to generate
          </h4>
          <div className="flex flex-wrap gap-2">
            {state.selectedEmotions.map((emotion, i) => (
              <div
                key={emotion}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium",
                  "bg-muted/50 text-foreground/80"
                )}
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              >
                {emotion}
              </div>
            ))}
          </div>
        </div>

        {/* Style context */}
        {state.stylePreset && (
          <StyleContextBar style={state.stylePreset} frameCount={frameCount} />
        )}
      </div>
    );
  }

  // During/after generation view
  return (
    <div className="space-y-6">
      {/* Progress */}
      <GenerationProgress
        total={state.selectedEmotions.length}
        completed={completedCount}
        failed={failedCount}
        currentEmotion={currentEmotion}
      />

      {/* Action buttons */}
      {!isGenerating && (
        <div className="flex justify-center gap-3">
          {failedCount > 0 && (
            <Button
              variant="outline"
              onClick={startGeneration}
              className="gap-2"
            >
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

      {/* Style context bar */}
      {state.stylePreset && (
        <StyleContextBar style={state.stylePreset} frameCount={frameCount} />
      )}

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {state.selectedEmotions.map((emotion) => {
          const result = results.get(emotion);
          const url = result?.storageId && imageUrls?.[result.storageId];

          return (
            <CardPreview
              key={emotion}
              emotion={emotion}
              imageUrl={url || null}
              isGenerating={result?.status === "generating"}
              hasError={result?.status === "error"}
              showLabel={state.layout.showLabels}
              showDescription={state.layout.showDescriptions}
              description={getEmotionDescription(emotion)}
              cardsPerPage={state.layout.cardsPerPage}
              assetRef={
                state.resourceId
                  ? {
                      ownerType: "resource",
                      ownerId: state.resourceId,
                      assetType: "emotion_card_image",
                      assetKey: `emotion:${emotion}`,
                    }
                  : undefined
              }
              style={
                state.stylePreset
                  ? {
                      colors: state.stylePreset.colors,
                      typography: state.stylePreset.typography,
                    }
                  : undefined
              }
              cardLayout={style?.cardLayout}
              frameUrls={style?.frameUrls}
              useFrames={state.layout.useFrames}
              onRegenerate={
                !isGenerating && result?.status !== "generating"
                  ? () => generateSingleCard(emotion)
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
