"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { DetailPageHeader, DetailPageSkeleton } from "@/components/resource/DetailPageHeader";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { PromptEditor } from "@/components/resource/PromptEditor";
import { generateCertificatePDF } from "@/lib/pdf-certificate";
import { Paintbrush } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import {
  ExportModal,
  CertificateSettings,
  type CertificateExportSettings,
} from "@/components/resource/ExportModal";
import type { CertificateContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";
import { AddToCollectionDialog } from "@/components/resource/AddToCollectionDialog";
import { toast } from "sonner";

interface CertificateDetailProps {
  resourceId: Id<"resources">;
}

export function CertificateDetail({ resourceId }: CertificateDetailProps) {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const [exportOpen, setExportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isImproveOpen, setIsImproveOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState<CertificateExportSettings>({
    recipientName: "",
    date: "",
  });
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const style = useQuery(
    api.styles.getStyle,
    resource?.styleId ? { styleId: resource.styleId } : "skip",
  );
  const asset = useQuery(api.assets.getAsset, {
    ownerType: "resource",
    ownerId: resourceId,
    assetType: "certificate_image",
    assetKey: "certificate_main",
  });
  const resourceCollections = useQuery(
    api.collections.getCollectionsForResource,
    user?._id ? { userId: user._id, resourceId } : "skip",
  );

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);
  const generateStyledImage = useAction(api.images.generateStyledImage);

  const handleRegenerate = useCallback(async () => {
    if (!resource) return;
    const content = resource.content as CertificateContent;
    setIsRegenerating(true);
    try {
      await generateStyledImage({
        ownerType: "resource",
        ownerId: resource._id,
        assetType: "certificate_image",
        assetKey: content.imageAssetKey ?? "certificate_main",
        prompt: `Decorative certificate background (NO TEXT): ${content.imagePrompt}`,
        styleId: resource.styleId as Id<"styles"> | undefined,
        aspect: "4:3",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image generation failed. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  }, [resource, generateStyledImage]);

  const handlePromptChange = useCallback(
    async (newPrompt: string) => {
      if (!resource) return;
      const content = resource.content as CertificateContent;
      await updateResource({
        resourceId: resource._id,
        content: { ...content, imagePrompt: newPrompt },
      });
    },
    [resource, updateResource],
  );

  const buildPdfBlob = useCallback(async () => {
    if (!asset?.currentVersion?.url) throw new Error("No image");
    const content = resource?.content as CertificateContent;
    return generateCertificatePDF({
      imageUrl: asset.currentVersion.url,
      headline: content.headline,
      subtext: content.subtext,
      achievement: content.achievement,
      recipientName: exportSettings.recipientName,
      recipientPlaceholder: content.recipientPlaceholder,
      date: exportSettings.date,
      datePlaceholder: content.datePlaceholder,
      signatoryLabel: content.signatoryLabel,
      headingFont: style?.typography?.headingFont,
      bodyFont: style?.typography?.bodyFont,
      watermark: user?.subscription !== "pro",
    });
  }, [asset, resource, style, exportSettings, user?.subscription]);

  const handleDownloaded = useCallback(async () => {
    if (resource?.status === "draft") {
      await updateResource({ resourceId: resource._id, status: "complete" });
    }
  }, [resource, updateResource]);

  const handleDelete = async () => {
    if (!resource) return;
    setIsDeleting(true);
    try {
      await deleteResource({ resourceId: resource._id });
      router.push("/dashboard/resources");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!resource) return <DetailPageSkeleton />;

  const content = resource.content as CertificateContent;
  const imageUrl = asset?.currentVersion?.url ?? null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle="Certificate"
        onExport={() => setExportOpen(true)}
        exportDisabled={!imageUrl}
        deleteTitle="Delete this certificate?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        collections={resourceCollections}
        onAddToCollection={() => setShowCollectionDialog(true)}
      />

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor resourceId={resourceId} tags={resource.tags ?? []} />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      {/* Landscape image — full width */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 mb-6">
        <div className="aspect-[4/3] rounded-xl border border-border/60 bg-muted/20 overflow-hidden mb-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Decorative background for ${content.headline}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              No image generated yet
            </div>
          )}
        </div>

        {/* Background image prompt */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Background image
          </p>
          <PromptEditor
            prompt={content.imagePrompt || ""}
            onPromptChange={handlePromptChange}
            onRegenerate={handleRegenerate}
            isGenerating={isRegenerating}
          />
        </div>
      </div>

      {/* Content + controls side-by-side below the image */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        {/* Certificate text fields */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            {content.headline}
          </h2>
          {content.subtext && (
            <p className="text-muted-foreground">{content.subtext}</p>
          )}
          {content.achievement && (
            <p className="text-muted-foreground text-sm italic">{content.achievement}</p>
          )}
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 pt-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Recipient label</dt>
              <dd className="font-medium">{content.recipientPlaceholder || "Child's Name"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Date label</dt>
              <dd className="font-medium">{content.datePlaceholder || "Date"}</dd>
            </div>
            {content.signatoryLabel && (
              <div>
                <dt className="text-xs text-muted-foreground">Signatory</dt>
                <dd className="font-medium">{content.signatoryLabel}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Asset controls */}
        <div className="lg:w-56 shrink-0">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-sm font-medium mb-3">Image controls</p>
            <div className="flex flex-wrap gap-2">
              {imageUrl && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditorOpen(true)}
                  className="cursor-pointer"
                >
                  Edit image
                </Button>
              )}
              {asset?.currentVersion && imageUrl && (
                <Button
                  variant="outline"
                  onClick={() => setIsImproveOpen(true)}
                  className="gap-1.5 cursor-pointer"
                >
                  <Paintbrush className="size-4" aria-hidden="true" />
                  Improve
                </Button>
              )}
              <AssetHistoryDialog
                assetRef={{
                  ownerType: "resource",
                  ownerId: resourceId,
                  assetType: "certificate_image",
                  assetKey: "certificate_main",
                }}
                triggerLabel="History"
                aspectRatio="4/3"
              />
            </div>
          </div>
        </div>
      </div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "certificate"}
        buildPdfBlob={buildPdfBlob}
        settingsPanel={
          <CertificateSettings
            settings={exportSettings}
            onSettingsChange={setExportSettings}
          />
        }
        onDownloaded={handleDownloaded}
        showWatermarkNotice={user?.subscription !== "pro"}
      />

      {imageUrl && (
        <>
          <ImageEditorModal
            open={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: "certificate_image",
              assetKey: "certificate_main",
            }}
            imageUrl={imageUrl}
            aspectRatio={4 / 3}
            title="Edit certificate background"
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
                assetType: "certificate_image",
                assetKey: "certificate_main",
              }}
              currentStorageId={asset.currentVersion.storageId}
              currentVersionId={asset.currentVersion._id}
              styleId={resource?.styleId as Id<"styles"> | undefined}
              aspect="4:3"
            />
          )}
        </>
      )}

      {user && (
        <AddToCollectionDialog
          open={showCollectionDialog}
          onOpenChange={setShowCollectionDialog}
          resourceIds={[resourceId]}
          userId={user._id}
        />
      )}
    </div>
  );
}
