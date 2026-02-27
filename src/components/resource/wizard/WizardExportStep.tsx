"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2 } from "lucide-react";
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { generateCardGamePDF } from "@/lib/pdf-card-game";
import { generateBehaviorChartPDF } from "@/lib/pdf-behavior-chart";
import { generateVisualSchedulePDF } from "@/lib/pdf-visual-schedule";
import { PDFPreview } from "@/components/resource/PDFPreview";
import type { AIWizardState } from "./use-ai-wizard";
import type { CardGameContent, BehaviorChartContent, VisualScheduleContent } from "@/types";

interface WizardExportStepProps {
  state: AIWizardState;
}

/** Map resource type to PDF layout mode */
function getLayoutMode(resourceType: string): "full_page" | "grid" {
  switch (resourceType) {
    case "flashcards":
      return "grid";
    default:
      return "full_page";
  }
}

const LAYOUT_LABELS: Record<string, string> = {
  full_page: "Full page",
  grid: "Card grid",
};

function formatResourceType(type: string): string {
  return type.replaceAll("_", " ");
}

export function WizardExportStep({ state }: WizardExportStepProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const user = useQuery(api.users.currentUser);
  const updateResource = useMutation(api.resources.updateResource);

  // Fetch all assets to get image URLs
  const assets = useQuery(
    api.assets.getByOwner,
    state.resourceId
      ? { ownerType: "resource", ownerId: state.resourceId }
      : "skip",
  );

  const buildPdfBlob = useCallback(async (): Promise<Blob> => {
    if (!assets) throw new Error("Assets not loaded");

    if (state.resourceType === "card_game" && state.generatedContent) {
      const assetMap = new Map<string, string>();
      for (const asset of assets) {
        if (asset.currentVersion?.url) {
          assetMap.set(asset.assetKey, asset.currentVersion.url);
        }
      }

      return generateCardGamePDF({
        content: state.generatedContent as unknown as CardGameContent,
        assetMap,
        cardsPerPage: 9,
        includeCardBacks: !!(state.generatedContent as Record<string, unknown>).cardBack,
        watermark: user?.subscription !== "pro",
      });
    }

    if (state.resourceType === "behavior_chart" && state.generatedContent) {
      const assetMap = new Map<string, string>();
      for (const asset of assets) {
        if (asset.currentVersion?.url) {
          assetMap.set(asset.assetKey, asset.currentVersion.url);
        }
      }

      return generateBehaviorChartPDF({
        content: state.generatedContent as unknown as BehaviorChartContent,
        assetMap,
        watermark: user?.subscription !== "pro",
      });
    }

    if (state.resourceType === "visual_schedule" && state.generatedContent) {
      const assetMap = new Map<string, string>();
      for (const asset of assets) {
        if (asset.currentVersion?.url) {
          assetMap.set(asset.assetKey, asset.currentVersion.url);
        }
      }

      return generateVisualSchedulePDF({
        content: state.generatedContent as unknown as VisualScheduleContent,
        assetMap,
        watermark: user?.subscription !== "pro",
      });
    }

    const imageUrls: string[] = [];
    for (const item of state.imageItems) {
      const asset = assets.find((a) => a.assetKey === item.assetKey);
      if (asset?.currentVersion?.url) {
        imageUrls.push(asset.currentVersion.url);
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("No images available for export");
    }

    const layout = getLayoutMode(state.resourceType);

    return generateImagePagesPDF({
      images: imageUrls,
      layout,
      cardsPerPage: layout === "grid" ? 9 : undefined,
      watermark: user?.subscription !== "pro",
    });
  }, [assets, state.resourceType, state.generatedContent, state.imageItems, user?.subscription]);

  const handleExport = async () => {
    if (!assets || !state.resourceId) return;
    setIsExporting(true);

    try {
      const blob = await buildPdfBlob();

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.name || state.resourceType}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mark resource as complete
      await updateResource({
        resourceId: state.resourceId,
        status: "complete",
      });

      setExported(true);
    } finally {
      setIsExporting(false);
    }
  };

  const completedImages = state.imageItems.filter(
    (i) => i.status === "complete",
  ).length;

  const canPreview = assets && completedImages > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PDF Preview */}
      <div className="flex-1 min-w-0">
        <PDFPreview generatePdf={canPreview ? buildPdfBlob : null} />
      </div>

      {/* Export controls */}
      <div className="lg:w-72 shrink-0 space-y-6">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          {exported ? (
            <div className="text-center py-2">
              <div className="size-12 rounded-2xl bg-teal/20 flex items-center justify-center mx-auto mb-3">
                <Check className="size-6 text-teal" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-lg font-medium mb-1">
                PDF downloaded
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your {formatResourceType(state.resourceType)} is ready for
                printing.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setExported(false);
                  handleExport();
                }}
                className="gap-2 cursor-pointer w-full"
              >
                <Download className="size-4" aria-hidden="true" />
                Download Again
              </Button>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-foreground">Ready to export</h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                {completedImages} image{completedImages !== 1 ? "s" : ""}, {LAYOUT_LABELS[getLayoutMode(state.resourceType)].toLowerCase()} layout
              </p>
              <Button
                onClick={handleExport}
                className="btn-coral mt-3 gap-2 w-full cursor-pointer"
                disabled={isExporting || completedImages === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="size-4" aria-hidden="true" />
                    Download PDF
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Summary
          </h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium capitalize">
                {formatResourceType(state.resourceType)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium truncate ml-2">{state.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Images</dt>
              <dd className="font-medium">{completedImages}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Layout</dt>
              <dd className="font-medium">
                {LAYOUT_LABELS[getLayoutMode(state.resourceType)]}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
