"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
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
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { PromptEditor } from "@/components/resource/PromptEditor";
import { generateBookPDF } from "@/lib/pdf-book";
import {
  ArrowLeft,
  Download,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import type { BookContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";

interface BookDetailProps {
  resourceId: Id<"resources">;
}

export function BookDetail({ resourceId }: BookDetailProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);
  const [hoveredCover, setHoveredCover] = useState(false);
  const [regeneratingCover, setRegeneratingCover] = useState(false);
  const [regeneratingPages, setRegeneratingPages] = useState<Set<string>>(
    new Set(),
  );

  const resource = useQuery(api.resources.getResource, { resourceId });
  const assets = useQuery(api.assets.getByOwner, {
    ownerType: "resource",
    ownerId: resourceId,
  });
  const style = useQuery(
    api.styles.getStyleWithFrameUrls,
    resource?.styleId
      ? { styleId: resource.styleId as Id<"styles"> }
      : "skip",
  );

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const assetMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!assets) return map;
    for (const asset of assets) {
      if (asset.currentVersion?.url) {
        map.set(asset.assetKey, asset.currentVersion.url);
      }
    }
    return map;
  }, [assets]);

  const handleDownloadPDF = useCallback(async () => {
    if (!resource) return;
    const content = resource.content as BookContent;
    setIsGeneratingPDF(true);
    try {
      const blob = await generateBookPDF({
        content,
        assetMap,
        style: style
          ? {
              colors: style.colors,
              typography: style.typography,
            }
          : undefined,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.name || "book"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (resource.status === "draft") {
        await updateResource({ resourceId: resource._id, status: "complete" });
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [resource, assetMap, updateResource, style]);

  const handleDelete = async () => {
    if (!resource) return;
    setIsDeleting(true);
    try {
      await deleteResource({ resourceId: resource._id });
      window.location.href = "/dashboard/resources";
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePromptChange = useCallback(
    async (pageId: string, newPrompt: string) => {
      if (!resource) return;
      const content = resource.content as BookContent;
      const updatedPages = content.pages.map((p) =>
        p.id === pageId ? { ...p, imagePrompt: newPrompt } : p,
      );
      await updateResource({
        resourceId: resource._id,
        content: { ...content, pages: updatedPages },
      });
    },
    [resource, updateResource],
  );

  const handleRegenerate = useCallback(
    async (pageId: string) => {
      if (!resource) return;
      const content = resource.content as BookContent;
      const page = content.pages.find((p) => p.id === pageId);
      if (!page?.imageAssetKey) return;

      setRegeneratingPages((prev) => new Set(prev).add(pageId));
      try {
        await generateStyledImage({
          ownerType: "resource",
          ownerId: resource._id,
          assetType: "book_page_image",
          assetKey: page.imageAssetKey,
          prompt: page.imagePrompt ?? page.text,
          styleId: resource.styleId as Id<"styles"> | undefined,
          characterId: page.characterId as Id<"characters"> | undefined,
          aspect: "4:3",
        });
      } finally {
        setRegeneratingPages((prev) => {
          const next = new Set(prev);
          next.delete(pageId);
          return next;
        });
      }
    },
    [resource, generateStyledImage],
  );

  const handleCoverPromptChange = useCallback(
    async (newPrompt: string) => {
      if (!resource) return;
      const content = resource.content as BookContent;
      if (!content.cover) return;
      await updateResource({
        resourceId: resource._id,
        content: { ...content, cover: { ...content.cover, imagePrompt: newPrompt } },
      });
    },
    [resource, updateResource],
  );

  const handleCoverRegenerate = useCallback(async () => {
    if (!resource) return;
    const content = resource.content as BookContent;
    if (!content.cover?.imageAssetKey) return;

    setRegeneratingCover(true);
    try {
      await generateStyledImage({
        ownerType: "resource",
        ownerId: resource._id,
        assetType: "book_cover_image",
        assetKey: content.cover.imageAssetKey,
        prompt: content.cover.imagePrompt ?? content.cover.title,
        styleId: resource.styleId as Id<"styles"> | undefined,
        aspect: "3:4",
      });
    } finally {
      setRegeneratingCover(false);
    }
  }, [resource, generateStyledImage]);

  if (!resource) return null;
  const content = resource.content as BookContent;
  const coverUrl = content.cover?.imageAssetKey
    ? assetMap.get(content.cover.imageAssetKey)
    : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
              {resource.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {content.bookType || "Book"} &middot; {content.pages.length} page
              {content.pages.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="btn-coral gap-1.5"
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Download className="size-4" aria-hidden="true" />
              )}
              Download PDF
            </Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/resources/${resource._id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this book?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this resource and its assets.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting && (
                      <Loader2
                        className="size-4 animate-spin mr-2"
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

      <div className="mb-6">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
      </div>

      {/* Cover */}
      {content.cover && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Cover
          </h2>
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden max-w-sm">
            <div
              className="relative aspect-[3/4] bg-muted/20"
              onMouseEnter={() => setHoveredCover(true)}
              onMouseLeave={() => setHoveredCover(false)}
            >
              {regeneratingCover ? (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                  role="status"
                >
                  <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" />
                  <span className="text-sm text-muted-foreground">
                    Generating...
                  </span>
                </div>
              ) : coverUrl ? (
                <>
                  <Image
                    src={coverUrl}
                    alt={content.cover.title}
                    fill
                    className="object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 motion-reduce:transition-none ${
                      hoveredCover
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setEditingKey(content.cover!.imageAssetKey!)
                        }
                        className="gap-1.5"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Button>
                      <AssetHistoryDialog
                        assetRef={{
                          ownerType: "resource",
                          ownerId: resourceId,
                          assetType: "book_cover_image",
                          assetKey: content.cover!.imageAssetKey!,
                        }}
                        triggerLabel="History"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    No cover image
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="font-medium">{content.cover.title}</p>
              {content.cover.subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {content.cover.subtitle}
                </p>
              )}
              {content.cover.imageAssetKey && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <PromptEditor
                    prompt={content.cover.imagePrompt ?? content.cover.title}
                    onPromptChange={handleCoverPromptChange}
                    onRegenerate={handleCoverRegenerate}
                    isGenerating={regeneratingCover}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pages */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Pages
        </h2>
        <div className="space-y-4">
          {content.pages.map((page, i) => {
            const imageUrl = page.imageAssetKey
              ? assetMap.get(page.imageAssetKey)
              : undefined;
            const isRegenerating = regeneratingPages.has(page.id);
            const isHovered = hoveredPage === page.id;

            return (
              <div
                key={page.id}
                className="rounded-xl border border-border/60 bg-card overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  {page.imageAssetKey && (
                    <div
                      className="relative w-full sm:w-64 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[180px] bg-muted/20"
                      onMouseEnter={() => setHoveredPage(page.id)}
                      onMouseLeave={() => setHoveredPage(null)}
                    >
                      {isRegenerating ? (
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                          role="status"
                        >
                          <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" />
                          <span className="text-sm text-muted-foreground">
                            Generating...
                          </span>
                        </div>
                      ) : imageUrl ? (
                        <>
                          <Image
                            src={imageUrl}
                            alt={`Page ${i + 1} illustration`}
                            fill
                            className="object-cover"
                          />
                          <div
                            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 motion-reduce:transition-none ${
                              isHovered
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                            }`}
                          >
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  setEditingKey(page.imageAssetKey!)
                                }
                                className="gap-1.5"
                              >
                                <Pencil className="size-3.5" aria-hidden="true" />
                                Edit
                              </Button>
                              <AssetHistoryDialog
                                assetRef={{
                                  ownerType: "resource",
                                  ownerId: resourceId,
                                  assetType: "book_page_image",
                                  assetKey: page.imageAssetKey!,
                                }}
                                triggerLabel="History"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text content */}
                  <div className="flex-1 p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Page {i + 1}
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {page.text}
                    </p>

                    {page.imageAssetKey && (
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <PromptEditor
                          prompt={page.imagePrompt ?? page.text}
                          onPromptChange={(newPrompt) =>
                            handlePromptChange(page.id, newPrompt)
                          }
                          onRegenerate={() => handleRegenerate(page.id)}
                          isGenerating={isRegenerating}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingKey && (
        <ImageEditorModal
          open={!!editingKey}
          onOpenChange={(open) => setEditingKey(open ? editingKey : null)}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: editingKey === "book_cover"
              ? "book_cover_image"
              : "book_page_image",
            assetKey: editingKey,
          }}
          imageUrl={assetMap.get(editingKey) as string}
          title="Edit book image"
        />
      )}
    </div>
  );
}
