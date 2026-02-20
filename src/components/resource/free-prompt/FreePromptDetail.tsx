"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
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
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { ArrowLeft, Download, Pencil, Trash2, Loader2, Paintbrush, Eye, EyeOff } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import { PDFPreview } from "@/components/resource/PDFPreview";
import type { FreePromptContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";

interface FreePromptDetailProps {
  resourceId: Id<"resources">;
}

export function FreePromptDetail({ resourceId }: FreePromptDetailProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isImproveOpen, setIsImproveOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const style = useQuery(
    api.styles.getStyle,
    resource?.styleId ? { styleId: resource.styleId } : "skip",
  );
  const asset = useQuery(api.assets.getAsset, {
    ownerType: "resource",
    ownerId: resourceId,
    assetType: "free_prompt_image",
    assetKey: "prompt_main",
  });

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const buildPdfBlob = useCallback(async () => {
    if (!asset?.currentVersion?.url) throw new Error("No image");
    return generateImagePagesPDF({
      images: [asset.currentVersion.url],
      layout: "full_page",
    });
  }, [asset]);

  const handleDownloadPDF = useCallback(async () => {
    if (!resource || !asset?.currentVersion?.url) return;
    setIsGeneratingPDF(true);
    try {
      const blob = await buildPdfBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.name || "free-prompt"}.pdf`;
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
  }, [resource, asset, buildPdfBlob, updateResource]);

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

  if (!resource) return null;
  const content = resource.content as FreePromptContent;
  const imageUrl = asset?.currentVersion?.url ?? null;

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
            <p className="text-sm text-muted-foreground mt-1">Free Prompt</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="btn-coral gap-1.5"
              disabled={isGeneratingPDF || !imageUrl}
            >
              {isGeneratingPDF ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="size-4" aria-hidden="true" />
              )}
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview((v) => !v)}
              className="gap-1.5 cursor-pointer"
            >
              {showPreview ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/resources/${resource._id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
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
                      <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                    )}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: showPreview ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-6">
            <PDFPreview generatePdf={imageUrl ? buildPdfBlob : null} visible={showPreview} />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <div
          className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden"
          style={{ aspectRatio: content.output.aspect === "1:1" ? "1/1" : content.output.aspect === "4:3" ? "4/3" : "3/4" }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              No image generated yet
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Prompt</p>
          <PromptEditor
            prompt={content.prompt}
            onPromptChange={async (newPrompt) => {
              await updateResource({
                resourceId: resource._id,
                content: { ...content, prompt: newPrompt },
              });
            }}
            onRegenerate={async () => {
              setIsRegenerating(true);
              try {
                await generateStyledImage({
                  ownerType: "resource",
                  ownerId: resource._id,
                  assetType: "free_prompt_image",
                  assetKey: content.imageAssetKey ?? "prompt_main",
                  prompt: content.prompt,
                  styleId: resource.styleId as Id<"styles"> | undefined,
                  aspect: content.output.aspect,
                });
              } finally {
                setIsRegenerating(false);
              }
            }}
            isGenerating={isRegenerating}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <AssetHistoryDialog
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "free_prompt_image",
            assetKey: "prompt_main",
          }}
          triggerLabel="History"
          aspectRatio={content.output.aspect === "1:1" ? "1/1" : content.output.aspect === "4:3" ? "4/3" : "3/4"}
        />
        {imageUrl && (
          <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
            Edit image
          </Button>
        )}
        {asset?.currentVersion && imageUrl && (
          <Button variant="outline" onClick={() => setIsImproveOpen(true)} className="gap-1.5">
            <Paintbrush className="size-4" aria-hidden="true" />
            Improve
          </Button>
        )}
      </div>

      {imageUrl && (
        <>
          <ImageEditorModal
            open={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: "free_prompt_image",
              assetKey: "prompt_main",
            }}
            imageUrl={imageUrl}
            aspectRatio={content.output.aspect === "3:4" ? 3/4 : content.output.aspect === "4:3" ? 4/3 : 1}
            title="Edit image"
          />
          {asset?.currentVersion && (
            <ImproveImageModal
              open={isImproveOpen}
              onOpenChange={setIsImproveOpen}
              imageUrl={imageUrl}
              originalPrompt={asset.currentVersion.prompt}
              assetRef={{
                ownerType: "resource",
                ownerId: resourceId,
                assetType: "free_prompt_image",
                assetKey: "prompt_main",
              }}
              currentStorageId={asset.currentVersion.storageId}
              currentVersionId={asset.currentVersion._id}
              styleId={resource?.styleId as Id<"styles"> | undefined}
              aspect={content.output.aspect}
            />
          )}
        </>
      )}
    </div>
  );
}
