"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2 } from "lucide-react";
import { generateBookPDF } from "@/lib/pdf-book";
import type { BookWizardState } from "./use-book-wizard";
import type { BookContent } from "@/types";

interface BookExportStepProps {
  state: BookWizardState;
}

export function BookExportStep({ state }: BookExportStepProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const updateResource = useMutation(api.resources.updateResource);

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
      const assetMap = new Map<string, string>();
      for (const asset of assets) {
        if (asset.currentVersion?.url) {
          assetMap.set(asset.assetKey, asset.currentVersion.url);
        }
      }

      const content: BookContent = {
        bookType: state.bookType,
        layout: state.layout,
        cover: state.hasCover ? (state.cover ?? undefined) : undefined,
        pages: state.pages,
      };

      const blob = await generateBookPDF({
        content,
        assetMap,
        style: state.stylePreset
          ? {
              colors: state.stylePreset.colors,
              typography: state.stylePreset.typography,
            }
          : undefined,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.name || "book"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

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
            <h3 className="text-xl font-medium mb-2">
              PDF downloaded
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your book is ready for printing.
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
              Generate a print-ready PDF with {state.pages.length} page
              {state.pages.length !== 1 ? "s" : ""}
              {state.hasCover ? " + cover" : ""} and {completedImages}{" "}
              illustration{completedImages !== 1 ? "s" : ""}.
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

      <div className="space-y-3 max-w-xl">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Summary
        </h4>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Book type</dt>
            <dd className="font-medium capitalize">{state.bookType || "Book"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Layout</dt>
            <dd className="font-medium capitalize">
              {state.layout === "picture_book"
                ? "Picture Book"
                : state.layout === "booklet"
                  ? "Booklet"
                  : "Illustrated Text"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Pages</dt>
            <dd className="font-medium">{state.pages.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Illustrations</dt>
            <dd className="font-medium">{completedImages}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
