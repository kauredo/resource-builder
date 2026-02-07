"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Pin, RotateCcw, Trash2, History } from "lucide-react";
import type { AssetRef } from "@/types";

interface AssetHistoryDialogProps {
  assetRef: AssetRef;
  title?: string;
  description?: string;
  triggerLabel?: string;
}

export function AssetHistoryDialog({
  assetRef,
  title = "Asset history",
  description = "Review previous versions and revert when needed.",
  triggerLabel = "History",
}: AssetHistoryDialogProps) {
  const asset = useQuery(api.assets.getAsset, {
    ownerType: assetRef.ownerType,
    ownerId: assetRef.ownerId as any,
    assetType: assetRef.assetType,
    assetKey: assetRef.assetKey,
  });
  const setCurrent = useMutation(api.assets.setCurrentVersion);
  const pinVersion = useMutation(api.assets.pinVersion);
  const deleteVersion = useMutation(api.assets.deleteVersion);

  const hasVersions = asset?.versions?.length ?? 0;
  const currentId = asset?.currentVersionId;

  const versionRows = asset?.versions
    ? asset.versions.map((version) => {
        const isCurrent = version._id === currentId;
        return {
          ...version,
          isCurrent,
          promptSnippet: version.prompt
            ? version.prompt.slice(0, 120)
            : "No prompt recorded",
        };
      })
    : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="gap-1.5">
          <History className="size-3.5" aria-hidden="true" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="fixed right-0 top-0 left-auto h-screen w-full max-w-md translate-x-0 translate-y-0 rounded-none border-l p-6"
      >
        <DialogHeader className="text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!hasVersions && (
          <div className="mt-6 rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
            No versions yet. Generate or edit this asset to start a history.
          </div>
        )}

        {hasVersions > 0 && (
          <div className="mt-4 space-y-4 max-h-[calc(100vh-200px)] overflow-auto pr-1">
            {versionRows.map((version) => (
              <div
                key={version._id}
                className={cn(
                  "rounded-lg border p-3 space-y-3",
                  version.isCurrent
                    ? "border-teal/40 bg-teal/5"
                    : "border-border/60 bg-card",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="size-16 shrink-0 rounded-md bg-muted overflow-hidden">
                    {version.url ? (
                      <img
                        src={version.url}
                        alt="Version preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(version.createdAt)}
                      </p>
                      {version.isCurrent && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal/10 text-teal">
                          Current
                        </span>
                      )}
                      {version.pinned && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground line-clamp-2 mt-1">
                      {version.promptSnippet}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!version.isCurrent && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrent({
                          assetId: asset?._id as any,
                          versionId: version._id,
                        })
                      }
                      className="gap-1.5"
                    >
                      <RotateCcw className="size-3.5" aria-hidden="true" />
                      Set current
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      pinVersion({
                        versionId: version._id,
                        pinned: !version.pinned,
                      })
                    }
                    className="gap-1.5"
                  >
                    <Pin className="size-3.5" aria-hidden="true" />
                    {version.pinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteVersion({ versionId: version._id })}
                    disabled={version.pinned}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>

                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2">
                    Details
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-[11px] leading-relaxed">
                    {JSON.stringify(version.params, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
