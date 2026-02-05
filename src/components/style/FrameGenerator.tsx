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
import {
  Loader2,
  RefreshCw,
  Trash2,
  Frame,
  Type,
  Layers,
} from "lucide-react";
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
    textBacking?: string | null;
    fullCard?: string | null;
  };
}

interface FrameTypeConfig {
  type: FrameType;
  label: string;
  description: string;
  dimensions: string;
  icon: React.ReactNode;
  aspectRatio: string;
}

const FRAME_TYPES: FrameTypeConfig[] = [
  {
    type: "border",
    label: "Border Frame",
    description: "Decorative border that wraps around the entire card",
    dimensions: "768×1024px, transparent center",
    icon: <Frame className="size-5" aria-hidden="true" />,
    aspectRatio: "aspect-[3/4]",
  },
  {
    type: "textBacking",
    label: "Text Backing",
    description: "Semi-transparent shape behind card labels",
    dimensions: "1024×256px, 40-60% opacity",
    icon: <Type className="size-5" aria-hidden="true" />,
    aspectRatio: "aspect-[2/1]",
  },
  {
    type: "fullCard",
    label: "Full Card Template",
    description: "Complete trading card frame with image and text areas",
    dimensions: "768×1024px, transparent image area",
    icon: <Layers className="size-5" aria-hidden="true" />,
    aspectRatio: "aspect-[3/4]",
  },
];

export function FrameGenerator({
  styleId,
  style,
  frames,
  frameUrls,
}: FrameGeneratorProps) {
  const [generatingTypes, setGeneratingTypes] = useState<Set<FrameType>>(new Set());
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
        }).catch(error => {
          console.error(`Failed to generate ${frameType}:`, error);
        })
      )
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

  // Check if any frames exist
  const hasAnyFrames = frames && Object.keys(frames).length > 0;
  const isGeneratingAny = generatingTypes.size > 0;
  const isAnyOperationInProgress = isGeneratingAny || deletingType !== null;

  return (
    <div className="space-y-4">
      {/* Generate All button */}
      <div className="flex justify-end">
        <Button
          onClick={handleGenerateAll}
          disabled={isAnyOperationInProgress}
          variant="outline"
          className="gap-2"
        >
          {isGeneratingAny ? (
            <>
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Generating {generatingTypes.size} frames...
            </>
          ) : (
            <>
              <RefreshCw className="size-4" aria-hidden="true" />
              {hasAnyFrames ? "Regenerate All" : "Generate All"}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FRAME_TYPES.map(config => {
          const hasFrame = frames?.[config.type];
          const frameUrl = frameUrls?.[config.type];
          const isGenerating = generatingTypes.has(config.type);
          const isDeleting = deletingType === config.type;
          const isDisabled = isAnyOperationInProgress;

          return (
            <div key={config.type} className="group relative flex flex-col">
              {/* Preview area - prominent */}
              <div className="relative mb-3">
                <FramePreview
                  url={frameUrl ?? null}
                  alt={`${config.label} preview`}
                  aspectRatio={config.aspectRatio}
                  size="lg"
                />

                {/* Actions - always visible for mobile/touch accessibility */}
                {hasFrame && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleGenerate(config.type)}
                      disabled={isDisabled}
                      className="h-7 px-2 gap-1 bg-white/90 hover:bg-white text-foreground shadow-sm transition-colors duration-150"
                    >
                      {isGenerating ? (
                        <Loader2
                          className="size-3 animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <RefreshCw className="size-3" aria-hidden="true" />
                      )}
                      <span className="text-xs">
                        {isGenerating ? "..." : "Redo"}
                      </span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          disabled={isDisabled}
                          className="h-7 w-7 bg-white/90 hover:bg-white text-muted-foreground hover:text-destructive shadow-sm transition-colors duration-150"
                        >
                          {isDeleting ? (
                            <Loader2
                              className="size-3 animate-spin motion-reduce:animate-none"
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
                            This will permanently delete this frame asset. You
                            can generate a new one at any time.
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

              {/* Info */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-muted-foreground">{config.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-foreground leading-tight">
                    {config.label}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {config.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono">
                    {config.dimensions}
                  </p>
                </div>
              </div>

              {/* Generate button or timestamp */}
              {hasFrame ? (
                <time
                  dateTime={new Date(
                    frames[config.type]!.generatedAt,
                  ).toISOString()}
                  className="text-[11px] text-muted-foreground/70 mt-auto tabular-nums"
                >
                  Generated{" "}
                  {new Date(
                    frames[config.type]!.generatedAt,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleGenerate(config.type)}
                  disabled={isDisabled}
                  className="btn-coral mt-auto w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2
                        className="size-3.5 animate-spin motion-reduce:animate-none mr-1.5"
                        aria-hidden="true"
                      />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground pt-2">
        These frames appear in layout options when creating cards with this
        style.
      </p>
    </div>
  );
}
