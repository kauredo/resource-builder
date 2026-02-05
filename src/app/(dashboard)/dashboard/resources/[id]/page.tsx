"use client";

import { useState, useCallback, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { CardPreview } from "@/components/resource/emotion-cards/CardPreview";
import { Id } from "../../../../../../convex/_generated/dataModel";
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
import {
  ArrowLeft,
  Download,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Calendar,
  Layers,
  Lock,
  Frame,
  Type,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  generateEmotionCardsPDF,
  PDFLayoutOptions,
  PDFStyleOptions,
  PDFFrameOptions,
} from "@/lib/pdf";
import { getEmotionDescription } from "@/lib/emotions";
import type { EmotionCardContent, StyleFrames } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResourceDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resourceId = resolvedParams.id as Id<"resources">;
  const resource = useQuery(api.resources.getResourceWithImages, {
    resourceId,
  });
  const style = useQuery(
    api.styles.getStyleWithFrameUrls,
    resource?.styleId ? { styleId: resource.styleId } : "skip",
  );
  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);

  const handleDownloadPDF = useCallback(async () => {
    if (!resource) return;

    setIsGeneratingPDF(true);
    setPdfReady(false);

    try {
      const content = resource.content as EmotionCardContent;
      const cards = content.cards.map(card => {
        const image = resource.images.find(
          img => img.description === card.emotion,
        );
        return {
          emotion: card.emotion,
          description: card.description || getEmotionDescription(card.emotion),
          imageUrl: image?.url || undefined,
        };
      });

      const options: PDFLayoutOptions = {
        cardsPerPage: content.layout.cardsPerPage,
        cardSize: content.layout.cardSize,
        showLabels: content.layout.showLabels,
        showDescriptions: content.layout.showDescriptions,
        showCutLines: true,
        useFrames: content.layout.useFrames,
      };

      // Build style options from queried style
      const styleOptions: PDFStyleOptions | undefined = style
        ? {
            colors: style.colors,
            typography: style.typography,
          }
        : undefined;

      // Build frame options from resolved URLs
      const frameOptions: PDFFrameOptions | undefined =
        style?.frameUrls && content.layout.useFrames
          ? {
              borderUrl: style.frameUrls.border ?? undefined,
              textBackingUrl: style.frameUrls.textBacking ?? undefined,
              fullCardUrl: style.frameUrls.fullCard ?? undefined,
            }
          : undefined;

      const blob = await generateEmotionCardsPDF(
        cards,
        options,
        styleOptions,
        frameOptions,
      );
      const url = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.name || "emotion-cards"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mark resource as complete after successful download
      if (resource.status === "draft") {
        await updateResource({
          resourceId: resource._id,
          status: "complete",
        });
      }

      setPdfReady(true);
      setTimeout(() => setPdfReady(false), 3000);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [resource, style, updateResource]);

  const handleDelete = async () => {
    if (!resource) return;
    setIsDeleting(true);
    try {
      await deleteResource({ resourceId: resource._id });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete resource:", error);
      setIsDeleting(false);
    }
  };

  if (resource === undefined) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="status"
        aria-label="Loading resource"
      >
        {/* Skeleton header */}
        <div className="mb-8" aria-hidden="true">
          <div className="h-4 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="h-9 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="size-9 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </div>
        {/* Skeleton grid */}
        <div
          className="h-4 w-40 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4"
          aria-hidden="true"
        />
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
          aria-hidden="true"
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="p-3">
                <div className="h-4 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (resource === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h1 className="font-serif text-2xl font-medium mb-2">
            Resource not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This resource may have been deleted or doesn&apos;t exist.
          </p>
          <Button asChild className="btn-coral">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const content = resource.content as EmotionCardContent;
  const cardCount = content.cards.length;
  const generatedCount = resource.images.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
                {resource.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                  resource.status === "complete"
                    ? "bg-teal/10 text-teal"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {resource.status === "complete" ? (
                  <>
                    <Check className="size-3" aria-hidden="true" />
                    Complete
                  </>
                ) : (
                  <>
                    <Pencil className="size-3" aria-hidden="true" />
                    Draft
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="size-4" aria-hidden="true" />
                <span className="tabular-nums">{cardCount}</span> card
                {cardCount !== 1 ? "s" : ""}
              </span>
              <time
                className="flex items-center gap-1.5"
                dateTime={new Date(resource.updatedAt).toISOString()}
              >
                <Calendar className="size-4" aria-hidden="true" />
                {new Date(resource.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || generatedCount === 0}
              className="gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  Download PDF
                </>
              ) : pdfReady ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Downloaded
                </>
              ) : (
                <>
                  <Download className="size-4" aria-hidden="true" />
                  Download PDF
                </>
              )}
            </Button>

            <Button asChild className="btn-coral gap-2">
              <Link href={`/dashboard/resources/${resource._id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:border-destructive/40"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete resource</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &ldquo;{resource.name}&rdquo;
                    and all its generated images. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                  >
                    {isDeleting && (
                      <Loader2
                        className="size-4 animate-spin motion-reduce:animate-none"
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

      {/* Success banner for complete decks */}
      {resource.status === "complete" && generatedCount > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-teal/5 border border-teal/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
              <Check className="size-5 text-teal" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-foreground">Your deck is ready</p>
              <p className="text-sm text-muted-foreground">
                {cardCount} cards · {content.layout.cardsPerPage} per page ·{" "}
                {content.layout.showLabels ? "Labels shown" : "No labels"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Style Specification */}
      {style && (
        <StyleSpecification
          style={style}
          layout={content.layout}
          resourceStyleId={resource.styleId}
        />
      )}

      {/* Card grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Emotion Cards
          </h2>
        </div>

        {generatedCount === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-12 text-center">
            <FileText
              className="size-8 text-muted-foreground/50 mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="text-muted-foreground mb-4">No cards generated yet</p>
            <Button asChild variant="outline">
              <Link href={`/dashboard/resources/${resource._id}/edit`}>
                Generate Cards
              </Link>
            </Button>
          </div>
        ) : (
          <StyledCardGrid
            cards={content.cards}
            images={resource.images}
            layout={content.layout}
            style={style}
          />
        )}
      </div>
    </div>
  );
}

// Style Specification Component
interface StyleSpecificationProps {
  style: {
    _id: Id<"styles">;
    name: string;
    isPreset: boolean;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
    };
    illustrationStyle: string;
    frames?: StyleFrames;
    frameUrls?: {
      border?: string | null;
      textBacking?: string | null;
      fullCard?: string | null;
    };
  };
  layout: EmotionCardContent["layout"];
  resourceStyleId: Id<"styles">;
}

function StyleSpecification({
  style,
  layout,
  resourceStyleId,
}: StyleSpecificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active frames
  const frameCount = [
    style.frames?.border,
    style.frames?.textBacking,
    style.frames?.fullCard,
  ].filter(Boolean).length;

  // Count frames enabled on this resource
  const enabledFrameCount = layout.useFrames
    ? [
        layout.useFrames.border && style.frames?.border,
        layout.useFrames.textBacking && style.frames?.textBacking,
        layout.useFrames.fullCard && style.frames?.fullCard,
      ].filter(Boolean).length
    : 0;

  const colorEntries = [
    { label: "Primary", value: style.colors.primary },
    { label: "Secondary", value: style.colors.secondary },
    { label: "Accent", value: style.colors.accent },
    { label: "Background", value: style.colors.background },
    { label: "Text", value: style.colors.text },
  ];

  return (
    <div className="mb-8">
      {/* Compact clickable header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded-lg"
        aria-expanded={isExpanded}
        aria-controls="style-details"
      >
        <div className="flex items-center gap-4 py-3">
          {/* Color strip */}
          <div
            className="flex h-8 w-28 rounded-md overflow-hidden shrink-0 ring-1 ring-border/50"
            role="img"
            aria-label={`${style.name} color palette`}
          >
            {colorEntries.map(({ label, value }) => (
              <div
                key={label}
                className="flex-1"
                style={{ backgroundColor: value }}
                title={`${label}: ${value}`}
              />
            ))}
          </div>

          {/* Style info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">
                {style.name}
              </span>
              {style.isPreset && (
                <Lock
                  className="size-3 text-muted-foreground shrink-0"
                  aria-label="Preset style"
                />
              )}
              {enabledFrameCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                  <Frame className="size-3" aria-hidden="true" />
                  {enabledFrameCount}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {style.typography.headingFont} / {style.typography.bodyFont}
            </p>
          </div>

          {/* Expand indicator */}
          <ChevronRight
            className={`size-4 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none ${
              isExpanded ? "rotate-90" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div
          id="style-details"
          className="border rounded-lg p-4 mt-2 space-y-4 animate-in slide-in-from-top-2 duration-150 motion-reduce:animate-none"
          style={{
            backgroundColor: `color-mix(in oklch, ${style.colors.background} 30%, transparent)`,
          }}
        >
          {/* Colors with labels */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Color Palette
            </h3>
            <div className="flex flex-wrap gap-3">
              {colorEntries.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="size-6 rounded ring-1 ring-border/50"
                    style={{ backgroundColor: value }}
                  />
                  <div className="text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="ml-1.5 font-mono text-xs text-foreground/70">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Typography
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Type
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-sm">
                  <span className="font-medium">
                    {style.typography.headingFont}
                  </span>
                  <span className="text-muted-foreground"> headings</span>
                </span>
              </div>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-sm">
                <span className="font-medium">{style.typography.bodyFont}</span>
                <span className="text-muted-foreground"> body</span>
              </span>
            </div>
          </div>

          {/* Frames */}
          {frameCount > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Frame Assets
              </h3>
              <div className="flex flex-wrap gap-2">
                {style.frames?.border && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                      layout.useFrames?.border
                        ? "bg-teal/10 text-teal"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {layout.useFrames?.border && (
                      <Check className="size-3" aria-hidden="true" />
                    )}
                    Border
                  </span>
                )}
                {style.frames?.textBacking && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                      layout.useFrames?.textBacking
                        ? "bg-teal/10 text-teal"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {layout.useFrames?.textBacking && (
                      <Check className="size-3" aria-hidden="true" />
                    )}
                    Text Backing
                  </span>
                )}
                {style.frames?.fullCard && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                      layout.useFrames?.fullCard
                        ? "bg-teal/10 text-teal"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {layout.useFrames?.fullCard && (
                      <Check className="size-3" aria-hidden="true" />
                    )}
                    Full Card
                  </span>
                )}
              </div>
              {enabledFrameCount === 0 && frameCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Frames available but not enabled for this deck
                </p>
              )}
            </div>
          )}

          {/* Illustration style */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Illustration Style
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {style.illustrationStyle}
            </p>
          </div>

          {/* Link to style */}
          <div className="pt-2 border-t border-border/50">
            <Link
              href={`/dashboard/styles/${resourceStyleId}`}
              className="inline-flex items-center gap-1 text-sm text-coral hover:text-coral/80 transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              View full style
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Styled Card Grid Component - uses CardPreview for consistent rendering
interface StyledCardGridProps {
  cards: Array<{ emotion: string; description: string }>;
  images: Array<{ description: string; url?: string | null }>;
  layout: EmotionCardContent["layout"];
  style?: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
    };
    frameUrls?: {
      border?: string | null;
      textBacking?: string | null;
      fullCard?: string | null;
    };
  } | null;
}

function StyledCardGrid({ cards, images, layout, style }: StyledCardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {cards.map(card => {
        const image = images.find(img => img.description === card.emotion);
        return (
          <CardPreview
            key={card.emotion}
            emotion={card.emotion}
            imageUrl={image?.url ?? null}
            isGenerating={false}
            hasError={false}
            showLabel={layout.showLabels}
            showDescription={layout.showDescriptions}
            description={card.description}
            cardsPerPage={layout.cardsPerPage}
            style={style ?? undefined}
            frameUrls={style?.frameUrls}
            useFrames={layout.useFrames}
          />
        );
      })}
    </div>
  );
}
