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
import { generateBehaviorChartPDF } from "@/lib/pdf-behavior-chart";
import { Loader2, Gift } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import { ExportModal } from "@/components/resource/ExportModal";
import type { AssetType, BehaviorChartContent } from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";
import { toast } from "sonner";

const FORMAT_LABELS: Record<string, string> = {
  sticker_chart: "Sticker Chart",
  token_board: "Token Board",
  progress_tracker: "Progress Tracker",
};

interface BehaviorChartDetailProps {
  resourceId: Id<"resources">;
}

export function BehaviorChartDetail({ resourceId }: BehaviorChartDetailProps) {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const [exportOpen, setExportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [improvingKey, setImprovingKey] = useState<string | null>(null);
  const [regeneratingKeys, setRegeneratingKeys] = useState<Set<string>>(
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
      const c = resource.content as BehaviorChartContent;
      await updateResource({
        resourceId: resource._id,
        content: { ...c, headerImagePrompt: newPrompt },
      });
    },
    [resource, updateResource],
  );

  const handleBehaviorPromptChange = useCallback(
    async (behaviorId: string, newPrompt: string) => {
      if (!resource) return;
      const c = resource.content as BehaviorChartContent;
      const updatedBehaviors = c.behaviors.map((b) =>
        b.id === behaviorId ? { ...b, imagePrompt: newPrompt } : b,
      );
      await updateResource({
        resourceId: resource._id,
        content: { ...c, behaviors: updatedBehaviors },
      });
    },
    [resource, updateResource],
  );

  const handleRewardPromptChange = useCallback(
    async (newPrompt: string) => {
      if (!resource) return;
      const c = resource.content as BehaviorChartContent;
      await updateResource({
        resourceId: resource._id,
        content: { ...c, reward: { ...c.reward, imagePrompt: newPrompt } },
      });
    },
    [resource, updateResource],
  );

  const handleTokenPromptChange = useCallback(
    async (newPrompt: string) => {
      if (!resource) return;
      const c = resource.content as BehaviorChartContent;
      await updateResource({
        resourceId: resource._id,
        content: { ...c, tokenImagePrompt: newPrompt },
      });
    },
    [resource, updateResource],
  );

  const buildPdfBlob = useCallback(async () => {
    if (!resource) throw new Error("No resource");
    const content = resource.content as BehaviorChartContent;

    return generateBehaviorChartPDF({
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
  const content = resource.content as BehaviorChartContent;

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
            Behavior Chart · {FORMAT_LABELS[content.chartFormat] || content.chartFormat} ·{" "}
            {content.behaviors.length} behaviors
          </>
        }
        onExport={() => setExportOpen(true)}
        deleteTitle="Delete this behavior chart?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
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

      {/* ------------------------------------------------------------------ */}
      {/* Header image — prominent, with chart title overlay                  */}
      {/* ------------------------------------------------------------------ */}
      {content.headerImageAssetKey && (
        <div className="mb-8">
          <HeaderImage
            assetKey={content.headerImageAssetKey}
            url={headerUrl}
            isRegenerating={headerIsRegenerating}
            resourceId={resourceId}
            title={content.title}
            formatLabel={FORMAT_LABELS[content.chartFormat] || content.chartFormat}
            onEdit={setEditingKey}
            onImprove={setImprovingKey}
          />
          <PromptEditor
            prompt={content.headerImagePrompt || content.title}
            onPromptChange={handleHeaderPromptChange}
            onRegenerate={() =>
              handleRegenerate(
                content.headerImageAssetKey!,
                "chart_header_image",
                content.headerImagePrompt || content.title,
                "4:3",
              )
            }
            isGenerating={headerIsRegenerating}
          />
        </div>
      )}

      {/* Instructions — simple inline text, not a card */}
      {content.instructions && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {content.instructions}
        </p>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Format-specific preview (sticker columns / token board / levels)    */}
      {/* ------------------------------------------------------------------ */}
      {content.chartFormat === "sticker_chart" && content.columnLabels && content.columnLabels.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Tracking columns
          </p>
          <p className="text-sm text-muted-foreground">
            {content.columnLabels.join(" · ")}
          </p>
        </div>
      )}

      {content.chartFormat === "token_board" && (
        <TokenBoardSection
          content={content}
          assetMap={assetMap}
          regeneratingKeys={regeneratingKeys}
          resourceId={resourceId}
          onEdit={setEditingKey}
          onImprove={setImprovingKey}
          onPromptChange={handleTokenPromptChange}
          onRegenerate={handleRegenerate}
        />
      )}

      {content.chartFormat === "progress_tracker" && content.levels && content.levels.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Levels ({content.levels.length})
          </h3>
          <div className="relative">
            {content.levels.map((level, i) => {
              const isLast = i === content.levels!.length - 1;
              return (
                <div key={level.id || i} className="flex gap-4">
                  {/* Vertical track */}
                  <div className="flex flex-col items-center">
                    <span
                      className="size-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                      style={{
                        backgroundColor: `color-mix(in oklch, var(--coral), transparent ${Math.max(0, 60 - i * 15)}%)`,
                      }}
                    >
                      {i + 1}
                    </span>
                    {!isLast && (
                      <div
                        className="w-0.5 flex-1 min-h-6"
                        style={{
                          backgroundColor: "color-mix(in oklch, var(--coral), transparent 70%)",
                        }}
                      />
                    )}
                  </div>
                  {/* Level content */}
                  <div className={isLast ? "pb-0" : "pb-4"}>
                    <p className="text-sm font-medium">{level.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {level.milestone}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Behaviors — compact rows, not full cards                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Behaviors ({content.behaviors.length})
        </h3>
        {content.behaviors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No behaviors defined. Edit this resource to add behaviors.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {content.behaviors.map((behavior, bIdx) => {
              const key =
                behavior.imageAssetKey ||
                `chart_behavior_icon:behavior_${bIdx}`;
              return (
                <div
                  key={behavior.id || bIdx}
                  className="flex items-start gap-3 rounded-lg border border-border/40 p-3"
                >
                  <div className="shrink-0 w-10">
                    <ImageSlot
                      assetKey={key}
                      assetType="chart_behavior_icon"
                      aspectClass="aspect-square"
                      aspectRatio="1/1"
                      alt={behavior.name || `Behavior ${bIdx + 1}`}
                      url={assetMap.get(key)}
                      isRegenerating={regeneratingKeys.has(key)}
                      resourceId={resourceId}
                      onEdit={setEditingKey}
                      onImprove={setImprovingKey}
                      small
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {behavior.name}
                    </p>
                    {behavior.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {behavior.description}
                      </p>
                    )}
                    <PromptEditor
                      prompt={behavior.imagePrompt || behavior.name}
                      onPromptChange={(newPrompt) =>
                        handleBehaviorPromptChange(behavior.id, newPrompt)
                      }
                      onRegenerate={() =>
                        handleRegenerate(
                          key,
                          "chart_behavior_icon",
                          behavior.imagePrompt || behavior.name,
                          "1:1",
                        )
                      }
                      isGenerating={regeneratingKeys.has(key)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Reward — with optional token inline (for token boards)              */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Reward
        </h3>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-start gap-4">
            {content.reward.imageAssetKey && (
              <div className="shrink-0 w-14">
                <ImageSlot
                  assetKey={content.reward.imageAssetKey}
                  assetType="chart_reward_image"
                  aspectClass="aspect-square"
                  aspectRatio="1/1"
                  alt={content.reward.name || "Reward"}
                  url={assetMap.get(content.reward.imageAssetKey)}
                  isRegenerating={regeneratingKeys.has(
                    content.reward.imageAssetKey,
                  )}
                  resourceId={resourceId}
                  onEdit={setEditingKey}
                  onImprove={setImprovingKey}
                  small
                />
              </div>
            )}
            {!content.reward.imageAssetKey && (
              <div className="shrink-0 size-14 rounded-xl bg-muted/30 flex items-center justify-center">
                <Gift className="size-5 text-muted-foreground/50" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">
                {content.reward.name}
              </p>
              {content.reward.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {content.reward.description}
                </p>
              )}
              {content.reward.imageAssetKey && (
                <PromptEditor
                  prompt={content.reward.imagePrompt || content.reward.name}
                  onPromptChange={handleRewardPromptChange}
                  onRegenerate={() =>
                    handleRegenerate(
                      content.reward.imageAssetKey!,
                      "chart_reward_image",
                      content.reward.imagePrompt || content.reward.name,
                      "1:1",
                    )
                  }
                  isGenerating={regeneratingKeys.has(content.reward.imageAssetKey!)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* No settings panel — behavior charts are always portrait */}
      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "behavior-chart"}
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
            assetType: (editingAsset?.assetType ?? "chart_behavior_icon") as AssetType,
            assetKey: editingKey,
          }}
          imageUrl={editingUrl}
          aspectRatio={editingAsset?.assetType === "chart_header_image" ? 4 / 3 : 1}
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
          aspect={improvingAsset.assetType === "chart_header_image" ? "4:3" : "1:1"}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header image — prominent with title overlay (like book cover)
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
            alt="Chart header illustration"
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
              assetType: "chart_header_image" as AssetType,
              assetKey,
            }}
            aspectRatio="5/2"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <p className="font-serif text-lg font-semibold text-muted-foreground/40">
            {title}
          </p>
          <span className="text-xs text-muted-foreground/30">No header image</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Token board section — token info + image inline with reward context
// ---------------------------------------------------------------------------

interface TokenBoardSectionProps {
  content: BehaviorChartContent;
  assetMap: Map<string, string>;
  regeneratingKeys: Set<string>;
  resourceId: Id<"resources">;
  onEdit: (key: string) => void;
  onImprove: (key: string) => void;
  onPromptChange: (newPrompt: string) => void;
  onRegenerate: (key: string, type: string, prompt: string, aspect: "1:1" | "4:3" | "3:4") => Promise<void>;
}

function TokenBoardSection({
  content,
  assetMap,
  regeneratingKeys,
  resourceId,
  onEdit,
  onImprove,
  onPromptChange,
  onRegenerate,
}: TokenBoardSectionProps) {
  const tokenKey = content.tokenImageAssetKey;
  const tokenUrl = tokenKey ? assetMap.get(tokenKey) : undefined;
  const tokenName = content.tokenName || "star";

  return (
    <div className="mb-6 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-4">
        {/* Token image */}
        {tokenKey && (
          <div className="shrink-0 w-12">
            <ImageSlot
              assetKey={tokenKey}
              assetType="chart_token_image"
              aspectClass="aspect-square"
              aspectRatio="1/1"
              alt={`${tokenName} token`}
              url={tokenUrl}
              isRegenerating={regeneratingKeys.has(tokenKey)}
              resourceId={resourceId}
              onEdit={onEdit}
              onImprove={onImprove}
              small
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Collect {content.totalSlots ?? 8} {tokenName}s
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Token board · {content.totalSlots ?? 8} slots to fill
          </p>
        </div>
      </div>
      {tokenKey && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <PromptEditor
            prompt={content.tokenImagePrompt || `${tokenName} token`}
            onPromptChange={onPromptChange}
            onRegenerate={() =>
              onRegenerate(
                tokenKey,
                "chart_token_image",
                content.tokenImagePrompt || `${tokenName} token`,
                "1:1",
              )
            }
            isGenerating={regeneratingKeys.has(tokenKey)}
          />
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
