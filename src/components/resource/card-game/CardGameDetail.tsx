"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
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
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { generateCardGamePDF } from "@/lib/pdf-card-game";
import { ArrowLeft, Download, Eye, EyeOff, Pencil, Trash2, Loader2, Paintbrush } from "lucide-react";
import { PDFPreview } from "@/components/resource/PDFPreview";
import { ImproveImageModal } from "@/components/resource/ImproveImageModal";
import type {
  AssetType,
  CardGameContent,
  LegacyCardGameContent,
} from "@/types";
import { ResourceTagsEditor } from "@/components/resource/ResourceTagsEditor";
import { ResourceStyleBadge } from "@/components/resource/ResourceStyleBadge";

interface CardGameDetailProps {
  resourceId: Id<"resources">;
}

export function CardGameDetail({ resourceId }: CardGameDetailProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  // Detect whether this is the new template format or legacy
  const isLegacy = useMemo(() => {
    if (!resource) return true;
    const content = resource.content as Record<string, unknown>;
    return !("backgrounds" in content);
  }, [resource]);

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

  const buildPdfBlob = useCallback(async () => {
    if (!resource) throw new Error("Resource not loaded");

    if (!isLegacy) {
      const content = resource.content as unknown as CardGameContent;
      return generateCardGamePDF({
        content,
        assetMap,
        cardsPerPage: 9,
        includeCardBacks: !!content.cardBack,
      });
    } else {
      const content = resource.content as LegacyCardGameContent;
      const imageUrls = content.cards.flatMap((card) => {
        const cardUrl = card.imageAssetKey
          ? assetMap.get(card.imageAssetKey)
          : undefined;
        return cardUrl
          ? Array.from({ length: card.count }, () => cardUrl)
          : [];
      });
      if (imageUrls.length === 0) throw new Error("No card images");

      return generateImagePagesPDF({
        images: imageUrls,
        layout: "grid",
        cardsPerPage: 9,
      });
    }
  }, [resource, assetMap, isLegacy]);

  const handleDownloadPDF = useCallback(async () => {
    if (!resource) return;
    setIsGeneratingPDF(true);

    try {
      const blob = await buildPdfBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.name || "card-game"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (resource.status === "draft") {
        await updateResource({
          resourceId: resource._id,
          status: "complete",
        });
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [resource, buildPdfBlob, updateResource]);

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
            <p className="text-sm text-muted-foreground mt-1">Card Game</p>
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
                  <AlertDialogTitle>Delete this game?</AlertDialogTitle>
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

      <div className="mb-6 flex flex-col gap-4">
        <ResourceTagsEditor
          resourceId={resourceId}
          tags={resource.tags ?? []}
        />
        {style && <ResourceStyleBadge styleId={style._id} styleName={style.name} />}
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: showPreview ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-6">
            <PDFPreview generatePdf={resource ? buildPdfBlob : null} visible={showPreview} />
          </div>
        </div>
      </div>

      {isLegacy ? (
        <LegacyCardList
          content={resource.content as LegacyCardGameContent}
          assetMap={assetMap}
          resourceId={resourceId}
          onEditKey={setEditingKey}
          onImproveKey={setImprovingKey}
        />
      ) : (
        <TemplateCardDetail
          content={resource.content as unknown as CardGameContent}
          assetMap={assetMap}
          resourceId={resourceId}
          onEditKey={setEditingKey}
          onImproveKey={setImprovingKey}
        />
      )}

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

// --- Legacy format ---

function LegacyCardList({
  content,
  assetMap,
  resourceId,
  onEditKey,
  onImproveKey,
}: {
  content: LegacyCardGameContent;
  assetMap: Map<string, string>;
  resourceId: Id<"resources">;
  onEditKey: (key: string) => void;
  onImproveKey: (key: string) => void;
}) {
  return (
    <div className="space-y-4">
      {content.cards.map((card) => {
        const imageUrl = card.imageAssetKey
          ? assetMap.get(card.imageAssetKey)
          : undefined;
        return (
          <div
            key={card.id ?? card.title}
            className="rounded-xl border border-border/60 p-4 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4"
          >
            <div className="aspect-[3/4] w-28 rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Card image"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Count: {card.count}
                  </p>
                </div>
                {card.imageAssetKey && (
                  <div className="flex items-center gap-2">
                    <AssetHistoryDialog
                      assetRef={{
                        ownerType: "resource",
                        ownerId: resourceId,
                        assetType: "card_image",
                        assetKey: card.imageAssetKey,
                      }}
                      triggerLabel="History"
                      aspectRatio="3/4"
                    />
                    {imageUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditKey(card.imageAssetKey!)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onImproveKey(card.imageAssetKey!)}
                          className="gap-1"
                        >
                          <Paintbrush className="size-3.5" aria-hidden="true" />
                          Improve
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{card.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Template format ---

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
