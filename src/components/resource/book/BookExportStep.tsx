"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2, Newspaper } from "lucide-react";
import { generateBookPDF } from "@/lib/pdf-book";
import { PDFPreview } from "@/components/resource/PDFPreview";
import type { BookWizardState } from "./use-book-wizard";
import type { BookContent } from "@/types";

interface BookExportStepProps {
  state: BookWizardState;
}

export function BookExportStep({ state }: BookExportStepProps) {
  const [isExporting, setIsExporting] = useState<"book" | "booklet" | null>(null);
  const [exported, setExported] = useState(false);
  const updateResource = useMutation(api.resources.updateResource);

  const assets = useQuery(
    api.assets.getByOwner,
    state.resourceId
      ? { ownerType: "resource", ownerId: state.resourceId }
      : "skip",
  );

  const buildPdfBlob = useCallback(async (booklet?: boolean) => {
    if (!assets) throw new Error("Assets not loaded");

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

    return generateBookPDF({
      content,
      assetMap,
      booklet,
      style: state.stylePreset
        ? {
            colors: state.stylePreset.colors,
            typography: state.stylePreset.typography,
          }
        : undefined,
    });
  }, [assets, state.bookType, state.layout, state.hasCover, state.cover, state.pages, state.stylePreset]);

  const handleExport = useCallback(async (booklet?: boolean) => {
    if (!assets || !state.resourceId) return;
    setIsExporting(booklet ? "booklet" : "book");

    try {
      const blob = await buildPdfBlob(booklet);

      const suffix = booklet ? "-booklet" : "";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.name || "book"}${suffix}.pdf`;
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
      setIsExporting(null);
    }
  }, [assets, state.resourceId, state.name, buildPdfBlob, updateResource]);

  const completedImages = state.imageItems.filter(
    (i) => i.status === "complete",
  ).length;

  const canPreview = assets && completedImages > 0;

  // Preview uses the standard (non-booklet) version
  const buildPreviewBlob = useCallback(async () => buildPdfBlob(false), [buildPdfBlob]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* PDF Preview */}
      <div className="flex-1 min-w-0">
        <PDFPreview generatePdf={canPreview ? buildPreviewBlob : null} />
      </div>

      {/* Export controls */}
      <div className="lg:w-72 shrink-0 space-y-6">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          {exported ? (
            <div className="text-center py-2">
              <div className="size-12 rounded-2xl bg-teal/20 flex items-center justify-center mx-auto mb-3">
                <Check className="size-6 text-teal" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium mb-1">PDF downloaded</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your book is ready for printing.
              </p>
              <div className="space-y-2">
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setExported(false);
                    handleExport(true);
                  }}
                  className="gap-2 cursor-pointer w-full"
                >
                  <Newspaper className="size-4" aria-hidden="true" />
                  Download as Booklet
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-foreground">Ready to export</h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                {state.pages.length} page{state.pages.length !== 1 ? "s" : ""}
                {state.hasCover ? " + cover" : ""}, {completedImages}{" "}
                illustration{completedImages !== 1 ? "s" : ""}
              </p>
              <div className="space-y-2 mt-3">
                <Button
                  onClick={() => handleExport()}
                  className="btn-coral gap-2 w-full cursor-pointer"
                  disabled={!!isExporting || completedImages === 0}
                >
                  {isExporting === "book" ? (
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
                      Download Book
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport(true)}
                  disabled={!!isExporting || completedImages === 0}
                  className="gap-2 w-full cursor-pointer"
                >
                  {isExporting === "booklet" ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Newspaper className="size-4" aria-hidden="true" />
                      Download as Booklet
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Booklet: print double-sided (flip on short edge), fold, and staple.
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Summary
          </h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Book type</dt>
              <dd className="font-medium capitalize">{state.bookType || "Book"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Layout</dt>
              <dd className="font-medium capitalize">
                {state.layout === "picture_book"
                  ? "Picture Book"
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
    </div>
  );
}
