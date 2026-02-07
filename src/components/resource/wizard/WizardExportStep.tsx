"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2 } from "lucide-react";
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import type { AIWizardState } from "./use-ai-wizard";

interface WizardExportStepProps {
  state: AIWizardState;
}

/** Map resource type to PDF layout mode */
function getLayoutMode(resourceType: string): "full_page" | "grid" {
  switch (resourceType) {
    case "flashcards":
    case "card_game":
      return "grid";
    default:
      return "full_page";
  }
}

export function WizardExportStep({ state }: WizardExportStepProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const updateResource = useMutation(api.resources.updateResource);

  // Fetch all assets to get image URLs
  const assets = useQuery(
    api.assets.getByOwner,
    state.resourceId
      ? { ownerType: "resource", ownerId: state.resourceId }
      : "skip",
  );

  const handleExport = async () => {
    if (!assets || !state.resourceId) return;
    setIsExporting(true);

    try {
      // Collect image URLs, expanding card_game cards by their count
      const imageUrls: string[] = [];
      if (state.resourceType === "card_game" && state.generatedContent) {
        const cards = (state.generatedContent.cards as Array<{ count?: number }>) ?? [];
        for (const item of state.imageItems) {
          const asset = assets.find((a) => a.assetKey === item.assetKey);
          if (!asset?.currentVersion?.url) continue;
          const cardIndex = parseInt(item.assetKey.replace("card_", ""), 10);
          const count = (!isNaN(cardIndex) && cards[cardIndex]?.count) || 1;
          for (let c = 0; c < count; c++) {
            imageUrls.push(asset.currentVersion.url);
          }
        }
      } else {
        for (const item of state.imageItems) {
          const asset = assets.find((a) => a.assetKey === item.assetKey);
          if (asset?.currentVersion?.url) {
            imageUrls.push(asset.currentVersion.url);
          }
        }
      }

      if (imageUrls.length === 0) {
        throw new Error("No images available for export");
      }

      const layout = getLayoutMode(state.resourceType);

      const blob = await generateImagePagesPDF({
        images: imageUrls,
        layout,
        cardsPerPage: layout === "grid" ? 6 : undefined,
      });

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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-6 max-w-xl">
        {exported ? (
          <div className="text-center py-4">
            <div className="size-14 rounded-2xl bg-teal/20 flex items-center justify-center mx-auto mb-4">
              <Check className="size-7 text-teal" aria-hidden="true" />
            </div>
            <h3 className="font-serif text-xl font-medium mb-2">
              PDF downloaded
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your {state.resourceType.replaceAll("_", " ")} is ready for
              printing.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setExported(false);
                handleExport();
              }}
              className="gap-2"
            >
              <Download className="size-4" aria-hidden="true" />
              Download Again
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-medium text-foreground">Ready to export</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Generate a print-ready PDF with {completedImages} image
              {completedImages !== 1 ? "s" : ""}. Text is baked into each
              image for the best print quality.
            </p>
            <Button
              onClick={handleExport}
              className="btn-coral mt-4 gap-2"
              disabled={isExporting || completedImages === 0}
            >
              {isExporting ? (
                <>
                  <Loader2
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  Generating PDF...
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
      <div className="space-y-3 max-w-xl">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Summary
        </h4>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Resource type</dt>
            <dd className="font-medium capitalize">
              {state.resourceType.replaceAll("_", " ")}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{state.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Images</dt>
            <dd className="font-medium">{completedImages}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Layout</dt>
            <dd className="font-medium capitalize">
              {getLayoutMode(state.resourceType).replaceAll("_", " ")}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
