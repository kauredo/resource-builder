"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { useRouter } from "next/navigation";
import { DetailPageHeader, DetailPageSkeleton } from "@/components/resource/DetailPageHeader";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { generateCardGamePDF } from "@/lib/pdf-card-game";
import { Paintbrush } from "lucide-react";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import {
  ExportModal,
  CardGameSettings,
  type CardGameExportSettings,
} from "@/components/resource/ExportModal";
import type {
  AssetType,
  CardGameContent,
} from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";

interface CardGameDetailProps {
  resourceId: Id<"resources">;
}

export function CardGameDetail({ resourceId }: CardGameDetailProps) {
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState<CardGameExportSettings | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [improvingKey, setImprovingKey] = useState<string | null>(null);

  const resource = useQuery(api.resources.getResource, { resourceId });
  const style = useQuery(
    api.styles.getStyle,
    resource?.styleId ? { styleId: resource.styleId } : "skip",
  );
  const assets = useQuery(api.assets.getByOwner, {
    ownerType: "resource",
    ownerId: resourceId,
  });

  const deleteResource = useMutation(api.resources.deleteResource);
  const updateResource = useMutation(api.resources.updateResource);

  const assetMap = useMemo(() => {
    const map = new Map<string, string>();
    if (assets) {
      for (const asset of assets) {
        if (asset.currentVersion?.url) {
          map.set(asset.assetKey, asset.currentVersion.url);
        }
      }
    }
    return map;
  }, [assets]);

  const buildPdfBlob = useCallback(async () => {
    if (!resource) throw new Error("Resource not loaded");
    const content = resource.content as unknown as CardGameContent;
    return generateCardGamePDF({
      content,
      assetMap,
      cardsPerPage: exportSettings?.cardsPerPage ?? 9,
      includeCardBacks: exportSettings?.includeCardBacks ?? !!content.cardBack,
    });
  }, [resource, assetMap, exportSettings]);

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

  const editingAssetType: AssetType = editingKey
    ? editingKey.startsWith("card_bg:")
      ? "card_bg"
      : editingKey.startsWith("card_icon:")
        ? "card_icon"
        : editingKey === "card_back"
          ? "card_back"
          : "card_image"
    : "card_image";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailPageHeader
        resourceId={resourceId}
        resourceName={resource.name}
        subtitle="Card Game"
        onExport={() => {
          const content = resource.content as unknown as CardGameContent;
          setExportSettings({
            cardsPerPage: 9,
            includeCardBacks: !!content.cardBack,
          });
          setExportOpen(true);
        }}
        deleteTitle="Delete this game?"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor
          resourceId={resourceId}
          tags={resource.tags ?? []}
        />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      <TemplateCardDetail
        content={resource.content as unknown as CardGameContent}
        assetMap={assetMap}
        resourceId={resourceId}
        onEditKey={setEditingKey}
        onImproveKey={setImprovingKey}
      />

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        resourceName={resource.name || "card-game"}
        buildPdfBlob={buildPdfBlob}
        onDownloaded={handleDownloaded}
        settingsPanel={
          exportSettings && (
            <CardGameSettings
              settings={exportSettings}
              onSettingsChange={setExportSettings}
            />
          )
        }
      />

      {editingKey && (
        <ImageEditorModal
          open={!!editingKey}
          onOpenChange={(open) => setEditingKey(open ? editingKey : null)}
          assetRef={{
            ownerType: "resource",
            ownerId: resourceId,
            assetType: editingAssetType,
            assetKey: editingKey,
          }}
          imageUrl={assetMap.get(editingKey) as string}
          aspectRatio={3 / 4}
          title="Edit card image"
        />
      )}

      {improvingKey && (() => {
        const asset = assets?.find((a) => a.assetKey === improvingKey);
        const cv = asset?.currentVersion;
        const url = cv?.url;
        if (!cv || !url) return null;
        const improveAssetType: AssetType = improvingKey.startsWith("card_bg:")
          ? "card_bg"
          : improvingKey.startsWith("card_icon:")
            ? "card_icon"
            : improvingKey === "card_back"
              ? "card_back"
              : "card_image";
        return (
          <ImproveImageModal
            open={true}
            onOpenChange={(open) => { if (!open) setImprovingKey(null); }}
            imageUrl={url}
            originalPrompt={cv.prompt}
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType: improveAssetType,
              assetKey: improvingKey,
            }}
            currentStorageId={cv.storageId}
            currentVersionId={cv._id}
            styleId={resource?.styleId as Id<"styles"> | undefined}
            aspect="3:4"
          />
        );
      })()}
    </div>
  );
}

function TemplateCardDetail({
  content,
  assetMap,
  resourceId,
  onEditKey,
  onImproveKey,
}: {
  content: CardGameContent;
  assetMap: Map<string, string>;
  resourceId: Id<"resources">;
  onEditKey: (key: string) => void;
  onImproveKey: (key: string) => void;
}) {
  const totalCards = content.cards.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-8">
      {/* Game info */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Game Info
        </h2>
        <dl className="space-y-1.5 text-sm max-w-md">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Deck</dt>
            <dd className="font-medium">{content.deckName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total Cards</dt>
            <dd className="font-medium tabular-nums">{totalCards}</dd>
          </div>
        </dl>
        {content.rules && (
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            {content.rules}
          </p>
        )}
      </section>

      {/* Backgrounds */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Backgrounds ({content.backgrounds.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {content.backgrounds.map((bg) => {
            const url = assetMap.get(bg.imageAssetKey);
            return (
              <AssetCard
                key={bg.id}
                label={bg.label}
                imageUrl={url}
                assetKey={bg.imageAssetKey}
                assetType="card_bg"
                resourceId={resourceId}
                color={bg.color}
                onEdit={() => url && onEditKey(bg.imageAssetKey)}
                onImprove={() => url && onImproveKey(bg.imageAssetKey)}
              />
            );
          })}
        </div>
      </section>

      {/* Icons */}
      {content.icons.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Icons ({content.icons.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.icons.map((icon) => {
              const url = assetMap.get(icon.imageAssetKey);
              return (
                <AssetCard
                  key={icon.id}
                  label={icon.label}
                  imageUrl={url}
                  assetKey={icon.imageAssetKey}
                  assetType="card_icon"
                  resourceId={resourceId}
                  isTransparent
                  onEdit={() => url && onEditKey(icon.imageAssetKey)}
                  onImprove={() => url && onImproveKey(icon.imageAssetKey)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Card Back */}
      {content.cardBack && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Card Back
          </h2>
          <div className="max-w-[200px]">
            <AssetCard
              label="Card Back"
              imageUrl={assetMap.get(content.cardBack.imageAssetKey)}
              assetKey={content.cardBack.imageAssetKey}
              assetType="card_back"
              resourceId={resourceId}
              onEdit={() => {
                const url = assetMap.get(content.cardBack!.imageAssetKey);
                if (url) onEditKey(content.cardBack!.imageAssetKey);
              }}
              onImprove={() => {
                const url = assetMap.get(content.cardBack!.imageAssetKey);
                if (url) onImproveKey(content.cardBack!.imageAssetKey);
              }}
            />
          </div>
        </section>
      )}

      {/* Card manifest */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Card Types ({content.cards.length})
        </h2>
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Text
                </th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Background
                </th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Icon
                </th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {content.cards.map((card) => {
                const bg = content.backgrounds.find(
                  (b) => b.id === card.backgroundId,
                );
                const icon = card.iconId
                  ? content.icons.find((ic) => ic.id === card.iconId)
                  : null;
                return (
                  <tr
                    key={card.id}
                    className="border-b border-border/20 last:border-b-0"
                  >
                    <td className="px-3 py-2 font-medium">{card.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {card.primaryText.content}
                    </td>
                    <td className="px-3 py-2">
                      {bg && (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="size-3 rounded-sm border border-border/60"
                            style={{ backgroundColor: bg.color }}
                          />
                          {bg.label}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {icon?.label || "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {card.count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AssetCard({
  label,
  imageUrl,
  assetKey,
  assetType,
  resourceId,
  color,
  isTransparent,
  onEdit,
  onImprove,
}: {
  label: string;
  imageUrl?: string;
  assetKey: string;
  assetType: AssetType;
  resourceId: Id<"resources">;
  color?: string;
  isTransparent?: boolean;
  onEdit: () => void;
  onImprove?: () => void;
}) {
  const checkerboardStyle = isTransparent
    ? {
        backgroundImage:
          "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), " +
          "linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), " +
          "linear-gradient(45deg, transparent 75%, #e0e0e0 75%), " +
          "linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
        backgroundSize: "12px 12px",
        backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
      }
    : undefined;

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div
        className="aspect-[3/4] relative bg-muted/20"
        style={checkerboardStyle}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="px-3 py-2 flex items-center gap-2">
        {color && (
          <span
            className="size-3 rounded-sm border border-border/60 shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="text-xs font-medium truncate">{label}</span>
        <div className="ml-auto flex items-center gap-1">
          <AssetHistoryDialog
            assetRef={{
              ownerType: "resource",
              ownerId: resourceId,
              assetType,
              assetKey,
            }}
            triggerLabel="History"
            aspectRatio="3/4"
          />
          {imageUrl && (
            <>
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
              {onImprove && (
                <Button variant="outline" size="sm" onClick={onImprove} className="gap-1">
                  <Paintbrush className="size-3" aria-hidden="true" />
                  Improve
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
