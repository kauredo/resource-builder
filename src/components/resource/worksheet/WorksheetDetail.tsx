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
import { generateWorksheetPDF } from "@/lib/pdf-worksheet";
import { ArrowLeft, Download, Pencil, Trash2, Loader2 } from "lucide-react";
import type { WorksheetContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";

interface WorksheetDetailProps {
  resourceId: Id<"resources">;
}

export function WorksheetDetail({ resourceId }: WorksheetDetailProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const style = useQuery(
    api.styles.getStyle,
    resource?.styleId ? { styleId: resource.styleId } : "skip",
  );
  const asset = useQuery(api.assets.getAsset, {
    ownerType: "resource",
    ownerId: resourceId,
    assetType: "worksheet_image",
    assetKey: "worksheet_header",
  });

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const handleDownloadPDF = useCallback(async () => {
    if (!resource) return;
    const content = resource.content as WorksheetContent;
    setIsGeneratingPDF(true);
    try {
      const blob = await generateWorksheetPDF({
        content,
        style: style
          ? { colors: style.colors, typography: style.typography }
          : undefined,
        headerImageUrl: asset?.currentVersion?.url ?? undefined,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.name || "worksheet"}.pdf`;
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
  }, [resource, style, asset, updateResource]);

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
  const content = resource.content as WorksheetContent;

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
            <p className="text-sm text-muted-foreground mt-1">Worksheet</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="btn-coral gap-1.5"
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
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
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this worksheet?</AlertDialogTitle>
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

      <div className="mb-6">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        {asset?.currentVersion?.url && (
          <img
            src={asset.currentVersion.url}
            alt="Worksheet header"
            className="w-full rounded-xl border border-border/60"
          />
        )}
        {content.headerImagePrompt && (
          <PromptEditor
            prompt={content.headerImagePrompt}
            onPromptChange={async (newPrompt) => {
              await updateResource({
                resourceId: resource._id,
                content: { ...content, headerImagePrompt: newPrompt },
              });
            }}
            onRegenerate={async () => {
              setIsRegenerating(true);
              try {
                await generateStyledImage({
                  ownerType: "resource",
                  ownerId: resource._id,
                  assetType: "worksheet_image",
                  assetKey: content.headerImageAssetKey ?? "worksheet_header",
                  prompt: content.headerImagePrompt!,
                  styleId: resource.styleId as Id<"styles"> | undefined,
                  aspect: "4:3",
                });
              } finally {
                setIsRegenerating(false);
              }
            }}
            isGenerating={isRegenerating}
          />
        )}
        <h2 className="font-serif text-2xl font-medium text-foreground">
          {content.title}
        </h2>
        <div className="space-y-3">
          {content.blocks.map((block, index) => (
            <div key={index} className="text-sm text-muted-foreground">
              <strong className="text-foreground capitalize">{block.type}:</strong>{" "}
              {block.text || block.items?.join(", ") || block.scaleLabels?.min || ""}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <AssetHistoryDialog
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "worksheet_image",
            assetKey: "worksheet_header",
          }}
          triggerLabel="History"
        />
        {asset?.currentVersion?.url && (
          <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
            Edit header
          </Button>
        )}
      </div>

      {asset?.currentVersion?.url && (
        <ImageEditorModal
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: "worksheet_image",
            assetKey: "worksheet_header",
          }}
          imageUrl={asset.currentVersion.url}
          aspectRatio={4 / 3}
          title="Edit worksheet header"
        />
      )}
    </div>
  );
}
