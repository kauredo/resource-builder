"use client";

import { useState, useCallback, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "../../../../../../convex/_generated/api";
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
  FileText,
  Loader2,
  Check,
  Calendar,
  Layers,
} from "lucide-react";
import { generateEmotionCardsPDF, PDFLayoutOptions } from "@/lib/pdf";
import type { EmotionCardContent } from "@/types";

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
  const resource = useQuery(api.resources.getResourceWithImages, { resourceId });
  const style = useQuery(
    api.styles.getStyle,
    resource?.styleId ? { styleId: resource.styleId } : "skip"
  );
  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);

  const handleDownloadPDF = useCallback(async () => {
    if (!resource) return;

    setIsGeneratingPDF(true);
    setPdfReady(false);

    try {
      const content = resource.content as EmotionCardContent;
      const cards = content.cards.map((card) => {
        const image = resource.images.find((img) => img.description === card.emotion);
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
      };

      const blob = await generateEmotionCardsPDF(cards, options);
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
  }, [resource, updateResource]);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label="Loading resource">
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
        <div className="h-4 w-40 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4" aria-hidden="true" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5" aria-hidden="true">
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
          <h1 className="font-serif text-2xl font-medium mb-2">Resource not found</h1>
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
                <span className="tabular-nums">{cardCount}</span> card{cardCount !== 1 ? "s" : ""}
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
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
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
                <Button variant="outline" size="icon" className="text-muted-foreground hover:text-destructive hover:border-destructive/40">
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete resource</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &ldquo;{resource.name}&rdquo; and all its generated images.
                    This action cannot be undone.
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
                      <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
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
                {cardCount} cards · {content.layout.cardsPerPage} per page · {content.layout.showLabels ? "Labels shown" : "No labels"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Emotion Cards
          </h2>
          {/* Style info inline */}
          {style && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1" role="img" aria-label={`${style.name} style`}>
                <div
                  className="size-4 rounded"
                  style={{ backgroundColor: style.colors.primary }}
                />
                <div
                  className="size-4 rounded"
                  style={{ backgroundColor: style.colors.secondary }}
                />
                <div
                  className="size-4 rounded"
                  style={{ backgroundColor: style.colors.accent }}
                />
              </div>
              <span>{style.name}</span>
            </div>
          )}
        </div>

        {generatedCount === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-12 text-center">
            <FileText className="size-8 text-muted-foreground/50 mx-auto mb-3" aria-hidden="true" />
            <p className="text-muted-foreground mb-4">
              No cards generated yet
            </p>
            <Button asChild variant="outline">
              <Link href={`/dashboard/resources/${resource._id}/edit`}>
                Generate Cards
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {content.cards.map((card) => {
              const image = resource.images.find((img) => img.description === card.emotion);
              return (
                <div
                  key={card.emotion}
                  className="group rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 motion-reduce:transition-none"
                >
                  <div className="aspect-square relative bg-muted/50">
                    {image?.url ? (
                      <Image
                        src={image.url}
                        alt={`${card.emotion} emotion card`}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-200 motion-reduce:group-hover:scale-100 motion-reduce:transition-none"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                        <FileText className="size-10" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2.5 text-center border-t border-border/50">
                    <p className="font-medium text-sm">{card.emotion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get emotion descriptions
function getEmotionDescription(emotion: string): string {
  const descriptions: Record<string, string> = {
    Happy: "Feeling joyful and content",
    Sad: "Feeling down or unhappy",
    Angry: "Feeling frustrated or mad",
    Scared: "Feeling afraid or worried",
    Surprised: "Feeling amazed or startled",
    Disgusted: "Feeling repulsed or dislike",
    Excited: "Feeling enthusiastic and eager",
    Calm: "Feeling peaceful and relaxed",
    Worried: "Feeling anxious about something",
    Frustrated: "Feeling stuck or annoyed",
    Proud: "Feeling good about an achievement",
    Embarrassed: "Feeling self-conscious",
    Disappointed: "Feeling let down",
    Overwhelmed: "Feeling too much at once",
    Lonely: "Feeling alone or isolated",
    Confused: "Feeling uncertain or puzzled",
    Jealous: "Wanting what others have",
    Hopeful: "Feeling optimistic about the future",
    Grateful: "Feeling thankful and appreciative",
    Nervous: "Feeling uneasy or anxious",
  };

  return descriptions[emotion] || `Experiencing ${emotion.toLowerCase()}`;
}
