"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DetailPageHeader, DetailPageSkeleton } from "@/components/resource/DetailPageHeader";
import { ImageHoverOverlay } from "@/components/resource/ImageHoverOverlay";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { PromptEditor } from "@/components/resource/PromptEditor";
import { generateVisualSchedulePDF } from "@/lib/pdf-visual-schedule";
import { Loader2 } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import { ExportModal } from "@/components/resource/ExportModal";
import type { AssetType, VisualScheduleContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";
import { AddToCollectionDialog } from "@/components/resource/AddToCollectionDialog";
import { toast } from "sonner";

const FORMAT_LABELS: Record<string, string> = {
  routine_strip: "Routine Strip",
  schedule_board: "Schedule Board",
  first_then: "First-Then",
};

interface VisualScheduleDetailProps {
  resourceId: Id<"resources">;
}

export function VisualScheduleDetail({ resourceId }: VisualScheduleDetailProps) {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const [exportOpen, setExportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [regeneratingKeys, setRegeneratingKeys] = useState<Set<string>>(
    new Set(),
  );
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

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
  const resourceCollections = useQuery(
    api.collections.getCollectionsForResource,
    user?._id ? { userId: user._id, resourceId } : "skip",
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

  const getAssetByKey = useCallback(
    (key: string) => assets?.find((a) => a.assetKey === key),
    [assets],
  );

  const handleRegenerate = useCallback(
    async (assetKey: string, assetType: string, prompt: string, aspect: "1:1" | "4:3" | "3:4") => {
      if (!resource) return;
      setRegeneratingKeys((prev) => new Set([...prev, assetKey]));
      try {
        await generateStyledImage({
          ownerType: "resource",
          ownerId: resource._id,
          assetType,
          assetKey,
          prompt,
          styleId: resource.styleId as Id<"styles"> | undefined,
          aspect,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Image generation failed. Please try again.",
        );
      } finally {
        setRegeneratingKeys((prev) => {
          const next = new Set(prev);
          next.delete(assetKey);
          return next;
        });
      }
    },
    [resource, generateStyledImage],
  );

  const handleHeaderPromptChange = useCallback(
    async (newPrompt: string) => {
      if (!resource) return;
      const c = resource.content as VisualScheduleContent;
      await updateResource({
        resourceId: resource._id,
        content: { ...c, headerImagePrompt: newPrompt },
      });
    },
    [resource, updateResource],
  );

  const handleActivityPromptChange = useCallback(
    async (activityId: string, newPrompt: string) => {
      if (!resource) return;
      const c = resource.content as VisualScheduleContent;
      const updatedActivities = c.activities.map((a) =>
        a.id === activityId ? { ...a, imagePrompt: newPrompt } : a,
      );
      await updateResource({
        resourceId: resource._id,
        content: { ...c, activities: updatedActivities },
      });
    },
    [resource, updateResource],
  );

  const buildPdfBlob = useCallback(async () => {
    if (!resource) throw new Error("No resource");
    const content = resource.content as VisualScheduleContent;

    return generateVisualSchedulePDF({
      content,
      style: style
        ? { colors: style.colors, typography: style.typography }
        : undefined,
      assetMap,
      watermark: user?.subscription !== "pro",
    });
  }, [resource, style, assetMap, user?.subscription]);

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
  const content = resource.content as VisualScheduleContent;

  const editingAsset = editingKey ? getAssetByKey(editingKey) : null;
  const editingUrl = editingKey ? assetMap.get(editingKey) : null;
  const improvingAsset = improvingKey ? getAssetByKey(improvingKey) : null;
  const improvingUrl = improvingKey ? assetMap.get(improvingKey) : null;

  const headerUrl = content.headerImageAssetKey
    ? assetMap.get(content.headerImageAssetKey)
    : undefined;
  const headerIsRegenerating = content.headerImageAssetKey
    ? regeneratingKeys.has(content.headerImageAssetKey)
    : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle={
          <>
            Visual Schedule · {FORMAT_LABELS[content.scheduleFormat] || content.scheduleFormat} ·{" "}
            {content.activities.length} activities
          </>
        }
        onExport={() => setExportOpen(true)}
        deleteTitle="Delete this visual schedule?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        collections={resourceCollections}
        onAddToCollection={() => setShowCollectionDialog(true)}
      />

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor
          resourceId={resourceId}
          tags={resource.tags ?? []}
        />
        {style && (
          <ResourceStyleBadge styleId={style._id} styleName={style.name} />
        )}
      </div>

      {/* Header image */}
      <div className="mb-8">
        {content.headerImageAssetKey ? (
          <>
            <HeaderImage
              assetKey={content.headerImageAssetKey}
              url={headerUrl}
              isRegenerating={headerIsRegenerating}
              resourceId={resourceId}
              title={content.title}
              formatLabel={FORMAT_LABELS[content.scheduleFormat] || content.scheduleFormat}
              onEdit={setEditingKey}
              onImprove={setImprovingKey}
            />
            <PromptEditor
              prompt={content.headerImagePrompt || content.title}
              onPromptChange={handleHeaderPromptChange}
              onRegenerate={() =>
                handleRegenerate(
                  content.headerImageAssetKey!,
                  "schedule_header_image",
                  content.headerImagePrompt || content.title,
                  "4:3",
                )
              }
              isGenerating={headerIsRegenerating}
            />
          </>
        ) : (
          <div className="relative aspect-[5/2] rounded-xl overflow-hidden bg-muted/30 border border-dashed border-border/60 flex flex-col items-center justify-center">
            <p className="font-serif text-lg font-semibold text-foreground">{content.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {FORMAT_LABELS[content.scheduleFormat] || content.scheduleFormat}
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      {content.instructions && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {content.instructions}
        </p>
      )}

      {/* Format-specific config */}
      {content.scheduleFormat === "schedule_board" && (
        <div className="mb-6 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Board Settings</p>
          <div className="flex gap-4 text-sm">
            <span className={content.timeLabels ? "text-foreground" : "text-muted-foreground/50 line-through"}>
              Time column
            </span>
            <span className={content.checkboxes ? "text-foreground" : "text-muted-foreground/50 line-through"}>
              Checkboxes
            </span>
          </div>
        </div>
      )}

      {content.scheduleFormat === "first_then" && (
        <div className="mb-6 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Transition Labels</p>
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="px-2.5 py-1 rounded-md bg-coral/10 text-coral">{content.firstLabel || "First"}</span>
            <span className="text-muted-foreground/40">→</span>
            <span className="px-2.5 py-1 rounded-md bg-teal/10 text-teal">{content.thenLabel || "Then"}</span>
          </div>
        </div>
      )}

      {/* Activities */}
      <div className="mb-8">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Activities ({content.activities.length})
        </h3>
        {content.activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No activities defined. Edit this resource to add activities.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {content.activities.map((activity, aIdx) => {
              const key =
                activity.imageAssetKey ||
                `schedule_activity_icon:activity_${aIdx}`;
              return (
                <div
                  key={activity.id || aIdx}
                  className="flex items-start gap-4 rounded-xl border border-border/40 p-4"
                >
                  <div className="shrink-0 w-16">
                    <ImageSlot
                      assetKey={key}
                      assetType="schedule_activity_icon"
                      aspectClass="aspect-square"
                      aspectRatio="1/1"
                      alt={activity.name || `Activity ${aIdx + 1}`}
                      url={assetMap.get(key)}
                      isRegenerating={regeneratingKeys.has(key)}
                      resourceId={resourceId}
                      onEdit={setEditingKey}
                      onImprove={setImprovingKey}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center size-5 rounded-full bg-coral/10 text-coral text-[10px] font-semibold shrink-0">
                        {aIdx + 1}
                      </span>
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {activity.name}
                      </p>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-snug ml-7">
                        {activity.description}
                      </p>
                    )}
                    {(activity.time || activity.duration) && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5 ml-7">
                        {[activity.time, activity.duration]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    <div className="mt-2">
                      <PromptEditor
                        prompt={activity.imagePrompt || activity.name}
                        onPromptChange={(newPrompt) =>
                          handleActivityPromptChange(activity.id, newPrompt)
                        }
                        onRegenerate={() =>
                          handleRegenerate(
                            key,
                            "schedule_activity_icon",
                            activity.imagePrompt || activity.name,
                            "1:1",
                          )
                        }
                        isGenerating={regeneratingKeys.has(key)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export modal — no settings panel */}
      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "visual-schedule"}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
        showWatermarkNotice={user?.subscription !== "pro"}
      />

      {/* Image editor modal */}
      {editingKey && editingUrl && (
        <ImageEditorModal
          open={!!editingKey}
          onOpenChange={(open) => {
            if (!open) setEditingKey(null);
          }}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: (editingAsset?.assetType ?? "schedule_activity_icon") as AssetType,
            assetKey: editingKey,
          }}
          imageUrl={editingUrl}
          aspectRatio={editingAsset?.assetType === "schedule_header_image" ? 4 / 3 : 1}
          title="Edit image"
        />
      )}

      {/* Improve image modal */}
      {improvingKey && improvingUrl && improvingAsset?.currentVersion && (
        <ImproveImageModal
          open={!!improvingKey}
          onOpenChange={(open) => {
            if (!open) setImprovingKey(null);
          }}
          imageUrl={improvingUrl}
          originalPrompt={improvingAsset.currentVersion.prompt}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: improvingAsset.assetType,
            assetKey: improvingKey,
          }}
          currentStorageId={improvingAsset.currentVersion.storageId}
          currentVersionId={improvingAsset.currentVersion._id}
          styleId={resource?.styleId as Id<"styles"> | undefined}
          aspect={improvingAsset.assetType === "schedule_header_image" ? "4:3" : "1:1"}
        />
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

// ---------------------------------------------------------------------------
// Header image — prominent with title overlay
// ---------------------------------------------------------------------------

interface HeaderImageProps {
  assetKey: string;
  url: string | undefined;
  isRegenerating: boolean;
  resourceId: Id<"resources">;
  title: string;
  formatLabel: string;
  onEdit: (key: string) => void;
  onImprove: (key: string) => void;
}

function HeaderImage({
  assetKey,
  url,
  isRegenerating,
  resourceId,
  title,
  formatLabel,
  onEdit,
  onImprove,
}: HeaderImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative aspect-[5/2] rounded-xl overflow-hidden bg-muted/20 border border-border/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isRegenerating ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            className="size-6 animate-spin motion-reduce:animate-none text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      ) : url ? (
        <>
          <Image
            src={url}
            alt="Schedule header illustration"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
          />
          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-12 pb-4 px-5">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
              {formatLabel}
            </p>
            <p className="font-serif text-lg font-semibold text-white leading-tight">
              {title}
            </p>
          </div>
          <ImageHoverOverlay
            isHovered={isHovered}
            onEdit={() => onEdit(assetKey)}
            onImprove={() => onImprove(assetKey)}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: "schedule_header_image" as AssetType,
              assetKey,
            }}
            aspectRatio="5/2"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <p className="font-serif text-lg font-semibold text-muted-foreground">
            {title}
          </p>
          <span className="text-xs text-muted-foreground">No header image yet</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable image slot with hover overlay
// ---------------------------------------------------------------------------

interface ImageSlotProps {
  assetKey: string;
  assetType: string;
  aspectClass: string;
  aspectRatio?: string;
  alt: string;
  url: string | undefined;
  isRegenerating: boolean;
  resourceId: Id<"resources">;
  onEdit: (key: string) => void;
  onImprove: (key: string) => void;
  small?: boolean;
}

function ImageSlot({
  assetKey,
  assetType,
  aspectClass,
  aspectRatio,
  alt,
  url,
  isRegenerating,
  resourceId,
  onEdit,
  onImprove,
  small,
}: ImageSlotProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative ${aspectClass} rounded-lg border border-border/40 bg-muted/20 overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isRegenerating ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            className="size-4 animate-spin motion-reduce:animate-none text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      ) : url ? (
        <>
          <Image
            src={url}
            alt={alt}
            fill
            className="object-cover"
            sizes={small ? "64px" : "400px"}
          />
          <ImageHoverOverlay
            isHovered={isHovered}
            onEdit={() => onEdit(assetKey)}
            onImprove={() => onImprove(assetKey)}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: assetType as AssetType,
              assetKey,
            }}
            aspectRatio={aspectRatio}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground/50">—</span>
        </div>
      )}
    </div>
  );
}
