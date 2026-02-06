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
import type { WizardState } from "../use-emotion-cards-wizard";
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

  const totalPages = Math.ceil(state.selectedEmotions.length / state.layout.cardsPerPage);

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

          {/* Primary action area */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              )}

              {/* Cut lines toggle — compact */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={showCutLines}
                  onCheckedChange={(checked) => {
                    setShowCutLines(checked === true);
                    setPdfUrl(null);
                    setPdfError(null);
                  }}
                />
                <div className="flex items-center gap-1.5">
                  <Scissors className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm">Cut lines</span>
                </div>
              </label>
            </div>

            {/* PDF ready status + regenerate */}
            {pdfUrl && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className="inline-flex items-center gap-1.5 text-sm text-teal">
                  <Check className="size-4" aria-hidden="true" />
                  PDF ready
                </span>
                <button
                  onClick={() => {
                    setPdfUrl(null);
                    setPdfError(null);
                  }}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground underline underline-offset-2 transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                >
                  Regenerate
                </button>
              </div>
            )}
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

          {/* Summary — compact inline */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground px-1">
            <span>
              <span className="font-medium text-foreground">{state.selectedEmotions.length}</span> cards
            </span>
            <span>
              <span className="font-medium text-foreground">{state.layout.cardsPerPage}</span> per page
            </span>
            <span>
              <span className="font-medium text-foreground">{totalPages}</span> page{totalPages !== 1 ? "s" : ""}
            </span>
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

                const textColor = cardStyle?.colors.text ?? "#1A1A1A";
                const bgColor = cardStyle?.colors.background ?? "#FAFAFA";
                const secondaryColor = cardStyle?.colors.secondary ?? "#E8E8E8";

                return (
                  <div
                    key={emotion}
                    className="rounded-lg overflow-hidden border"
                    style={{
                      backgroundColor: bgColor,
                      borderColor: `color-mix(in oklch, ${textColor} 12%, transparent)`,
                    }}
                  >
                    {/* Mini image */}
                    <div
                      className="aspect-square relative"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${secondaryColor} 19%, transparent)`,
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
                          borderTop: `1px solid color-mix(in oklch, ${textColor} 6%, transparent)`,
                        }}
                      >
                        <span
                          className="text-[8px] sm:text-[9px] font-medium leading-tight"
                          style={{
                            color: textColor,
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
