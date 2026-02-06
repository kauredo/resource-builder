"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { FramePreview } from "./FramePreview";
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
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import type { StyleFrames, FrameType } from "@/types";

interface FrameGeneratorProps {
  styleId: Id<"styles">;
  style: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    illustrationStyle: string;
  };
  frames?: StyleFrames;
  frameUrls?: {
    border?: string | null;
    fullCard?: string | null;
  };
  /** Optional custom prompt to append to frame generation */
  framePromptSuffix?: string;
}

interface FrameTypeConfig {
  type: FrameType;
  label: string;
  shortDesc: string;
  aspectRatio: string;
}

const FRAME_TYPES: FrameTypeConfig[] = [
  {
    type: "border",
    label: "Border",
    shortDesc: "Card border decoration",
    aspectRatio: "aspect-[3/4]",
  },
  {
    type: "fullCard",
    label: "Full Card",
    shortDesc: "Complete card template",
    aspectRatio: "aspect-[3/4]",
  },
];

export function FrameGenerator({
  styleId,
  style,
  frames,
  frameUrls,
  framePromptSuffix,
}: FrameGeneratorProps) {
  const [generatingTypes, setGeneratingTypes] = useState<Set<FrameType>>(
    new Set(),
  );
  const [deletingType, setDeletingType] = useState<FrameType | null>(null);

  const generateFrame = useAction(api.frameActions.generateFrame);
  const deleteFrameMutation = useMutation(api.frames.deleteFrame);

  const handleGenerate = async (frameType: FrameType) => {
    setGeneratingTypes(prev => new Set([...prev, frameType]));
    try {
      await generateFrame({
        styleId,
        frameType,
        colors: style.colors,
        illustrationStyle: style.illustrationStyle,
        promptSuffix: framePromptSuffix,
      });
    } catch (error) {
      console.error(`Failed to generate ${frameType}:`, error);
    } finally {
      setGeneratingTypes(prev => {
        const next = new Set(prev);
        next.delete(frameType);
        return next;
      });
    }
  };

  const handleGenerateAll = async () => {
    const allTypes = FRAME_TYPES.map(c => c.type);
    setGeneratingTypes(new Set(allTypes));

    await Promise.allSettled(
      allTypes.map(frameType =>
        generateFrame({
          styleId,
          frameType,
          colors: style.colors,
          illustrationStyle: style.illustrationStyle,
          promptSuffix: framePromptSuffix,
        }).catch(error => {
          console.error(`Failed to generate ${frameType}:`, error);
        }),
      ),
    );

    setGeneratingTypes(new Set());
  };

  const handleDelete = async (frameType: FrameType) => {
    setDeletingType(frameType);
    try {
      await deleteFrameMutation({
        styleId,
        frameType,
      });
    } catch (error) {
      console.error(`Failed to delete ${frameType}:`, error);
    } finally {
      setDeletingType(null);
    }
  };

  const hasAnyFrames = frames && Object.keys(frames).length > 0;
  const isGeneratingAny = generatingTypes.size > 0;
  const isAnyOperationInProgress = isGeneratingAny || deletingType !== null;

  return (
    <div className="space-y-4">
      {/* Generate All button - compact */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Generate decorative frames for your cards
        </p>
        <Button
          onClick={handleGenerateAll}
          disabled={isAnyOperationInProgress}
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
        >
          {isGeneratingAny ? (
            <>
              <Loader2
                className="size-3.5 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {hasAnyFrames ? "Regenerate All" : "Generate All"}
            </>
          )}
        </Button>
      </div>

      {/* Compact frame cards */}
      <div className="grid grid-cols-3 gap-3">
        {FRAME_TYPES.map(config => {
          const hasFrame = frames?.[config.type];
          const frameUrl = frameUrls?.[config.type];
          const isGenerating = generatingTypes.has(config.type);
          const isDeleting = deletingType === config.type;
          const isDisabled = isAnyOperationInProgress;

          return (
            <div
              key={config.type}
              className="group relative flex flex-col rounded-lg border border-border/50 overflow-hidden bg-background justify-between"
            >
              {/* Preview - compact */}
              <div className="relative">
                <FramePreview
                  url={frameUrl ?? null}
                  alt={`${config.label} preview`}
                  aspectRatio={config.aspectRatio}
                  size="sm"
                />

                {/* Loading overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2
                      className="size-5 animate-spin text-coral"
                      aria-hidden="true"
                    />
                  </div>
                )}

                {/* Action buttons - visible on hover or when frame exists */}
                {hasFrame && !isGenerating && (
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleGenerate(config.type)}
                      disabled={isDisabled}
                      className="h-6 w-6 bg-white/90 hover:bg-white shadow-sm"
                    >
                      <RefreshCw className="size-3" aria-hidden="true" />
                      <span className="sr-only">Regenerate</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          disabled={isDisabled}
                          className="h-6 w-6 bg-white/90 hover:bg-white text-muted-foreground hover:text-destructive shadow-sm"
                        >
                          {isDeleting ? (
                            <Loader2
                              className="size-3 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Trash2 className="size-3" aria-hidden="true" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete {config.label}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this frame. You can
                            generate a new one at any time.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(config.type)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              {/* Label and action */}
              <div className="p-2.5">
                <h3 className="text-xs font-medium text-foreground">
                  {config.label}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {config.shortDesc}
                </p>

                {!hasFrame && (
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(config.type)}
                    disabled={isDisabled}
                    className="btn-coral mt-2 w-full h-7 text-xs"
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
