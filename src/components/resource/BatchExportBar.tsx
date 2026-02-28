"use client";

import { Button } from "@/components/ui/button";
import { Download, FolderPlus, X, Loader2 } from "lucide-react";
import type { ExportProgress } from "@/hooks/use-batch-export";

interface BatchExportBarProps {
  selectedCount: number;
  totalCount: number;
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExport: () => void;
  onCancelExport: () => void;
  onExit: () => void;
  onAddToCollection?: () => void;
}

export function BatchExportBar({
  selectedCount,
  totalCount,
  isExporting,
  exportProgress,
  onSelectAll,
  onDeselectAll,
  onExport,
  onCancelExport,
  onExit,
  onAddToCollection,
}: BatchExportBarProps) {
  const progressPercent = exportProgress
    ? Math.round(((exportProgress.current - 1) / exportProgress.total) * 100)
    : 0;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 pointer-events-auto">
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
          {/* Progress bar (behind content) */}
          {isExporting && exportProgress && (
            <div
              className="absolute inset-0 bg-[color-mix(in_oklch,var(--coral)_8%,transparent)] transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          )}

          <div className="relative flex items-center gap-3 px-4 py-3">
            {isExporting ? (
              <>
                <Loader2
                  className="size-4 text-coral animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <span className="text-sm text-foreground">
                  Generating {exportProgress?.current} of {exportProgress?.total}
                  {exportProgress?.currentName && (
                    <span className="text-muted-foreground">
                      {" \u2014 "}{exportProgress.currentName}
                    </span>
                  )}
                </span>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancelExport}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {selectedCount === 0
                    ? "Select resources to export"
                    : `${selectedCount} selected`}
                </span>

                {selectedCount > 0 && (
                  <>
                    <div className="h-4 w-px bg-border/60" aria-hidden="true" />

                    <div className="flex items-center gap-1">
                      {selectedCount < totalCount && (
                        <button
                          type="button"
                          onClick={onSelectAll}
                          className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                        >
                          Select all
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onDeselectAll}
                        className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                      >
                        Deselect all
                      </button>
                    </div>
                  </>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExit}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  {onAddToCollection && selectedCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddToCollection}
                      className="gap-1.5"
                    >
                      <FolderPlus className="size-3.5" aria-hidden="true" />
                      Add to Collection
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={onExport}
                    disabled={selectedCount === 0}
                    className="btn-coral gap-1.5"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    Export ZIP
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
