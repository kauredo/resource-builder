"use client";

import { useCallback, useRef, useState } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { buildPdfForResource } from "@/lib/pdf-batch";
import JSZip from "jszip";
import { toast } from "sonner";

let _convex: ConvexHttpClient | null = null;
function getConvex() {
  if (!_convex) _convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  return _convex;
}

export interface ExportProgress {
  current: number;
  total: number;
  currentName: string;
}

export function useBatchExport() {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const enterSelectMode = useCallback(() => {
    setIsSelectMode(true);
    setSelectedIds(new Set());
  }, []);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
    setIsExporting(false);
    setExportProgress(null);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const cancelExport = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startExport = useCallback(
    async (watermark: boolean, overrideIds?: Id<"resources">[]) => {
      const ids = overrideIds ?? [...selectedIds] as Id<"resources">[];
      if (ids.length === 0) return;

      const controller = new AbortController();
      abortRef.current = controller;
      setIsExporting(true);

      const resourceIds = ids;

      try {
        // Fetch all data in one query
        const data = await getConvex().query(api.resources.getResourcesForBatchExport, {
          resourceIds,
        });

        const zip = new JSZip();
        const nameCount = new Map<string, number>();
        let successCount = 0;
        const skipped: string[] = [];

        for (let i = 0; i < data.length; i++) {
          if (controller.signal.aborted) {
            toast.info("Export cancelled");
            setIsExporting(false);
            setExportProgress(null);
            return;
          }

          const { resource, assets, style } = data[i];
          setExportProgress({
            current: i + 1,
            total: data.length,
            currentName: resource.name,
          });

          try {
            const blob = await buildPdfForResource({
              resource,
              assets,
              style,
              watermark,
            });

            // Handle filename collisions
            let fileName = resource.name.replace(/[/\\:*?"<>|]/g, "_");
            const count = nameCount.get(fileName) ?? 0;
            nameCount.set(fileName, count + 1);
            if (count > 0) fileName = `${fileName} (${count + 1})`;

            zip.file(`${fileName}.pdf`, blob);
            successCount++;
          } catch {
            skipped.push(resource.name);
          }
        }

        if (controller.signal.aborted) {
          toast.info("Export cancelled");
          setIsExporting(false);
          setExportProgress(null);
          return;
        }

        if (successCount === 0) {
          toast.warning("No resources could be exported. They may be drafts without images.");
          setIsExporting(false);
          setExportProgress(null);
          return;
        }

        // Generate ZIP and download
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resources-${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (skipped.length > 0) {
          toast.warning(
            `Exported ${successCount} resource${successCount !== 1 ? "s" : ""}. Skipped ${skipped.length}: ${skipped.join(", ")}`,
          );
        } else {
          toast.success(`Exported ${successCount} resource${successCount !== 1 ? "s" : ""}`);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error(error instanceof Error ? error.message : "Export failed");
        }
      } finally {
        setIsExporting(false);
        setExportProgress(null);
        abortRef.current = null;
      }
    },
    [selectedIds],
  );

  return {
    isSelectMode,
    selectedIds,
    isExporting,
    exportProgress,
    enterSelectMode,
    exitSelectMode,
    toggleSelection,
    selectAll,
    deselectAll,
    startExport,
    cancelExport,
  };
}
