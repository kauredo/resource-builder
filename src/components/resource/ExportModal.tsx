"use client";

import { type ReactNode, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDFPreview } from "@/components/resource/PDFPreview";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// ExportModal
// ---------------------------------------------------------------------------

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceName: string;
  buildPdfBlob: () => Promise<Blob>;
  settingsPanel?: ReactNode;
  onDownloaded?: () => void;
  /** Show a notice that the PDF includes a watermark (free plan) */
  showWatermarkNotice?: boolean;
}

export function ExportModal({
  open,
  onOpenChange,
  resourceName,
  buildPdfBlob,
  settingsPanel,
  onDownloaded,
  showWatermarkNotice,
}: ExportModalProps) {
  const [previewKey, setPreviewKey] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleUpdatePreview = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const blob = await buildPdfBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resourceName || "resource"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onDownloaded?.();
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("PDF generation failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [buildPdfBlob, resourceName, onDownloaded]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col ${settingsPanel ? "" : "sm:max-w-3xl"}`}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Export PDF</DialogTitle>
          <DialogDescription>
            Preview and download &ldquo;{resourceName}&rdquo;
          </DialogDescription>
        </DialogHeader>

        {showWatermarkNotice && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Free plan exports include a subtle watermark.{" "}
            <a
              href="/dashboard/settings/billing"
              className="font-medium underline underline-offset-2 hover:text-amber-950 transition-colors duration-150"
            >
              Upgrade to Pro
            </a>{" "}
            for clean exports.
          </div>
        )}

        <div
          className={`flex-1 min-h-0 ${settingsPanel ? "grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-6" : ""}`}
        >
          {/* Settings panel */}
          {settingsPanel && (
            <div className="space-y-4 overflow-y-auto pr-2">
              {settingsPanel}
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={handleUpdatePreview}
              >
                Update Preview
              </Button>
            </div>
          )}

          {/* Preview */}
          <div className="min-h-0 overflow-hidden">
            <PDFPreview
              key={previewKey}
              generatePdf={buildPdfBlob}
              className="h-[800px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close
          </Button>
          <Button
            className="btn-coral gap-1.5 cursor-pointer"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Settings sub-components
// ---------------------------------------------------------------------------

interface SettingsProps<T> {
  settings: T;
  onSettingsChange: (settings: T) => void;
}

// --- Emotion Cards ---

export interface EmotionCardsExportSettings {
  cardsPerPage: 4 | 6 | 9;
  showLabels: boolean;
  showDescriptions: boolean;
  showCutLines: boolean;
}

export function EmotionCardsSettings({
  settings,
  onSettingsChange,
}: SettingsProps<EmotionCardsExportSettings>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ec-cards-per-page">Cards per page</Label>
        <Select
          value={String(settings.cardsPerPage)}
          onValueChange={(v) =>
            onSettingsChange({ ...settings, cardsPerPage: Number(v) as 4 | 6 | 9 })
          }
        >
          <SelectTrigger id="ec-cards-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4 cards</SelectItem>
            <SelectItem value="6">6 cards</SelectItem>
            <SelectItem value="9">9 cards</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="ec-labels"
          checked={settings.showLabels}
          onCheckedChange={(v) =>
            onSettingsChange({ ...settings, showLabels: !!v })
          }
        />
        <Label htmlFor="ec-labels" className="cursor-pointer">Show labels</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="ec-descriptions"
          checked={settings.showDescriptions}
          onCheckedChange={(v) =>
            onSettingsChange({ ...settings, showDescriptions: !!v })
          }
        />
        <Label htmlFor="ec-descriptions" className="cursor-pointer">Show descriptions</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="ec-cutlines"
          checked={settings.showCutLines}
          onCheckedChange={(v) =>
            onSettingsChange({ ...settings, showCutLines: !!v })
          }
        />
        <Label htmlFor="ec-cutlines" className="cursor-pointer">Show cut lines</Label>
      </div>
    </div>
  );
}

// --- Flashcards ---

export interface FlashcardsExportSettings {
  cardsPerPage: 4 | 6 | 9;
}

export function FlashcardsSettings({
  settings,
  onSettingsChange,
}: SettingsProps<FlashcardsExportSettings>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fc-cards-per-page">Cards per page</Label>
        <Select
          value={String(settings.cardsPerPage)}
          onValueChange={(v) =>
            onSettingsChange({ ...settings, cardsPerPage: Number(v) as 4 | 6 | 9 })
          }
        >
          <SelectTrigger id="fc-cards-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4 cards</SelectItem>
            <SelectItem value="6">6 cards</SelectItem>
            <SelectItem value="9">9 cards</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// --- Card Game ---

export interface CardGameExportSettings {
  cardsPerPage: 4 | 6 | 9;
  includeCardBacks: boolean;
}

export function CardGameSettings({
  settings,
  onSettingsChange,
}: SettingsProps<CardGameExportSettings>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cg-cards-per-page">Cards per page</Label>
        <Select
          value={String(settings.cardsPerPage)}
          onValueChange={(v) =>
            onSettingsChange({ ...settings, cardsPerPage: Number(v) as 4 | 6 | 9 })
          }
        >
          <SelectTrigger id="cg-cards-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4 cards</SelectItem>
            <SelectItem value="6">6 cards</SelectItem>
            <SelectItem value="9">9 cards</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="cg-backs"
          checked={settings.includeCardBacks}
          onCheckedChange={(v) =>
            onSettingsChange({ ...settings, includeCardBacks: !!v })
          }
        />
        <Label htmlFor="cg-backs" className="cursor-pointer">Include card backs</Label>
      </div>
    </div>
  );
}

// --- Book ---

export interface BookExportSettings {
  booklet: boolean;
}

export function BookSettings({
  settings,
  onSettingsChange,
}: SettingsProps<BookExportSettings>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="bk-format">Format</Label>
        <Select
          value={settings.booklet ? "booklet" : "book"}
          onValueChange={(v) =>
            onSettingsChange({ ...settings, booklet: v === "booklet" })
          }
        >
          <SelectTrigger id="bk-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="book">Book</SelectItem>
            <SelectItem value="booklet">Booklet</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// --- Worksheet ---

export interface WorksheetExportSettings {
  orientation: "portrait" | "landscape";
}

export function WorksheetSettings({
  settings,
  onSettingsChange,
}: SettingsProps<WorksheetExportSettings>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ws-orientation">Orientation</Label>
        <Select
          value={settings.orientation}
          onValueChange={(v) =>
            onSettingsChange({ ...settings, orientation: v as "portrait" | "landscape" })
          }
        >
          <SelectTrigger id="ws-orientation">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
