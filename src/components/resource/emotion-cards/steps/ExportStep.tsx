"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  FileText,
  Check,
  Loader2,
  Scissors,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  generateEmotionCardsPDF,
  PDFLayoutOptions,
  PDFStyleOptions,
  PDFFrameOptions,
} from "@/lib/pdf";
import { getEmotionDescription } from "@/lib/emotions";
import { StyleContextBar } from "../StyleContextBar";
import type { WizardState } from "../EmotionCardsWizard";
import type { StyleFrames } from "@/types";

interface ExportStepProps {
  state: WizardState;
  onUpdate: (updates: Partial<WizardState>) => void;
}

export function ExportStep({ state, onUpdate }: ExportStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showCutLines, setShowCutLines] = useState(true);
  const [isExported, setIsExported] = useState(false);

  const updateResource = useMutation(api.resources.updateResource);

  // Get resource data
  const resource = useQuery(
    api.resources.getResource,
    state.resourceId ? { resourceId: state.resourceId } : "skip"
  );

  // Query style with frame URLs
  const style = useQuery(
    api.styles.getStyleWithFrameUrls,
    state.styleId ? { styleId: state.styleId } : "skip"
  );

  // Extract frame data
  const frames = style?.frames as StyleFrames | undefined;
  const frameCount = [frames?.border, frames?.fullCard].filter(Boolean).length;

  // Get image URLs
  const storageIds = resource?.images.map((img) => img.storageId) || [];
  const imageUrls = useQuery(
    api.images.getImageUrls,
    storageIds.length > 0 ? { storageIds } : "skip"
  );

  // Build card data for PDF
  const buildCardData = useCallback(() => {
    if (!resource || !imageUrls) return [];

    return state.selectedEmotions.map((emotion) => {
      const image = resource.images.find((img) => img.description === emotion);
      const url = image?.storageId ? imageUrls[image.storageId] : undefined;
      return {
        emotion,
        description: getEmotionDescription(emotion),
        imageUrl: url || undefined,
      };
    });
  }, [resource, imageUrls, state.selectedEmotions]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setPdfError(null);
    try {
      const cards = buildCardData();
      const options: PDFLayoutOptions = {
        cardsPerPage: state.layout.cardsPerPage,
        cardSize: state.layout.cardSize,
        showLabels: state.layout.showLabels,
        showDescriptions: state.layout.showDescriptions,
        showCutLines,
        useFrames: state.layout.useFrames,
        cardLayout: style?.cardLayout ?? undefined,
      };

      // Build style options from queried style or preset
      const styleOptions: PDFStyleOptions | undefined = style
        ? {
            colors: style.colors,
            typography: style.typography,
          }
        : state.stylePreset
          ? {
              colors: state.stylePreset.colors,
              typography: state.stylePreset.typography,
            }
          : undefined;

      // Build frame options from resolved URLs
      const frameOptions: PDFFrameOptions | undefined =
        style?.frameUrls && state.layout.useFrames
          ? {
              borderUrl: style.frameUrls.border ?? undefined,
              fullCardUrl: style.frameUrls.fullCard ?? undefined,
            }
          : undefined;

      const blob = await generateEmotionCardsPDF(cards, options, styleOptions, frameOptions);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setPdfError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your PDF. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;

    // Create download link
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${state.name || "emotion-cards"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mark resource as complete
    if (state.resourceId) {
      await updateResource({
        resourceId: state.resourceId,
        status: "complete",
      });
    }

    setIsExported(true);
  };

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Style values for card thumbnails
  const cardStyle = state.stylePreset
    ? {
        colors: state.stylePreset.colors,
        typography: state.stylePreset.typography,
      }
    : undefined;

  return (
    <div className="space-y-6">
      {/* Success state */}
      {isExported ? (
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-coral/5 via-background to-teal/5 p-8 text-center">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-coral/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-teal/10" />
          </div>

          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-coral/20 flex items-center justify-center mx-auto mb-5">
              <Check className="size-10 text-coral" aria-hidden="true" />
            </div>
            <h3 className="font-serif text-2xl font-medium mb-2">
              Your deck is ready!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              &ldquo;{state.name}&rdquo; has been saved to your library.
              Print them out and start using them in sessions.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/resources">
                  <FileText className="size-4" aria-hidden="true" />
                  View Library
                </Link>
              </Button>
              <Button className="btn-coral" asChild>
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Style context */}
          {state.stylePreset && (
            <StyleContextBar style={state.stylePreset} frameCount={frameCount} />
          )}

          {/* Summary */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-medium mb-4">Deck Summary</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{state.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cards</dt>
                <dd className="font-medium tabular-nums">{state.selectedEmotions.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Layout</dt>
                <dd className="font-medium tabular-nums">{state.layout.cardsPerPage} per page</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pages</dt>
                <dd className="font-medium tabular-nums">
                  {Math.ceil(state.selectedEmotions.length / state.layout.cardsPerPage)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Export options */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h3 className="font-medium">Export Options</h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={showCutLines}
                onCheckedChange={(checked) => {
                  setShowCutLines(checked === true);
                  setPdfUrl(null); // Reset PDF when options change
                  setPdfError(null);
                }}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Scissors className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium">Show cut lines</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add dashed lines around cards for easier cutting.
                </p>
              </div>
            </label>
          </div>

          {/* Error state */}
          {pdfError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Failed to generate PDF</p>
                  <p className="text-sm text-muted-foreground mt-1">{pdfError}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGeneratePDF}
                  className="shrink-0 gap-1.5"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Generate / Download */}
          <div className="flex flex-col items-center gap-4 py-6">
            {!pdfUrl ? (
              <Button
                size="lg"
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="btn-coral gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <FileText className="size-5" aria-hidden="true" />
                    Generate PDF
                  </>
                )}
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-coral mb-2">
                  <Check className="size-5" aria-hidden="true" />
                  <span className="font-medium">PDF ready!</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="btn-coral gap-2"
                  >
                    <Download className="size-5" aria-hidden="true" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open(pdfUrl, "_blank")}
                    className="gap-2"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                    Preview
                  </Button>
                </div>
                <button
                  onClick={() => {
                    setPdfUrl(null);
                    setPdfError(null);
                  }}
                  className="text-sm text-foreground/70 cursor-pointer hover:text-coral underline underline-offset-2 transition-colors duration-150 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                >
                  Regenerate PDF
                </button>
              </div>
            )}
          </div>

          {/* Card thumbnails grid */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Cards in this deck
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {state.selectedEmotions.map((emotion) => {
                const image = resource?.images.find((img) => img.description === emotion);
                const imageUrl = image?.storageId && imageUrls?.[image.storageId];

                return (
                  <div
                    key={emotion}
                    className="rounded-lg overflow-hidden border"
                    style={{
                      backgroundColor: cardStyle?.colors.background ?? "#FAFAFA",
                      borderColor: (cardStyle?.colors.text ?? "#1A1A1A") + "20",
                    }}
                  >
                    {/* Mini image */}
                    <div
                      className="aspect-square relative"
                      style={{
                        backgroundColor: (cardStyle?.colors.secondary ?? "#E8E8E8") + "30",
                      }}
                    >
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={emotion}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </div>
                    {/* Mini label */}
                    {state.layout.showLabels && (
                      <div
                        className="px-1 py-0.5 text-center truncate"
                        style={{
                          borderTop: `1px solid ${(cardStyle?.colors.text ?? "#1A1A1A")}10`,
                        }}
                      >
                        <span
                          className="text-[8px] sm:text-[9px] font-medium leading-tight"
                          style={{
                            color: cardStyle?.colors.text ?? "#1A1A1A",
                            fontFamily: cardStyle
                              ? `"${cardStyle.typography.headingFont}", system-ui, sans-serif`
                              : "system-ui",
                          }}
                        >
                          {emotion}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
