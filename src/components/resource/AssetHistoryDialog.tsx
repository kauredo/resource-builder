"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeDate, cn } from "@/lib/utils";
import {
  Pin,
  RotateCcw,
  Trash2,
  History,
  MoreHorizontal,
} from "lucide-react";
import type { AssetRef } from "@/types";

const SOURCE_CONFIG = {
  generated: { label: "Generated", dotClass: "bg-coral" },
  edited: { label: "Edited", dotClass: "bg-teal" },
  uploaded: { label: "Uploaded", dotClass: "bg-foreground/40" },
} as const;

interface AssetHistoryDialogProps {
  assetRef: AssetRef;
  title?: string;
  description?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}

function VersionPrompt({ prompt }: { prompt?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!prompt) return null;

  const isLong = prompt.length > 120;

  return (
    <div className="mt-1.5">
      <p
        className={cn(
          "text-xs leading-relaxed text-foreground/60",
          !expanded && "line-clamp-2",
        )}
      >
        {prompt}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-foreground/45 hover:text-foreground/65 mt-0.5 cursor-pointer rounded transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  const config =
    SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG] ??
    SOURCE_CONFIG.generated;

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-foreground/55">
      <span
        className={cn("size-2 rounded-full shrink-0", config.dotClass)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

function VersionCard({
  version,
  isCurrent,
  onSetCurrent,
  onPin,
  onDelete,
}: {
  version: {
    _id: string;
    url?: string | null;
    createdAt: number;
    prompt?: string;
    source?: string;
    pinned?: boolean;
  };
  isCurrent: boolean;
  onSetCurrent: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative",
        isCurrent && "rounded-xl bg-teal/[0.04] ring-1 ring-teal/15 p-2.5 -mx-2.5",
      )}
    >
      {/* Image preview */}
      <div className="relative overflow-hidden rounded-lg bg-muted aspect-[4/3]">
        {version.url ? (
          <img
            src={version.url}
            alt={`Version from ${formatRelativeDate(version.createdAt)}`}
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center text-xs text-muted-foreground">
            No preview
          </div>
        )}

        {/* Badges overlaid on image */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {isCurrent && (
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal text-white shadow-sm">
              Current
            </span>
          )}
          {version.pinned && (
            <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
              <Pin className="size-2.5" aria-hidden="true" />
            </span>
          )}
        </div>

        {/* Hover overlay with revert action */}
        {!isCurrent && version.url && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-[background-color] duration-200 motion-reduce:transition-none flex items-center justify-center">
            <Button
              size="sm"
              variant="secondary"
              onClick={onSetCurrent}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 motion-reduce:transition-none gap-1.5 shadow-md"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Use this version
            </Button>
          </div>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <SourceBadge source={version.source || "generated"} />
          <span className="text-[11px] text-foreground/30" aria-hidden="true">
            &middot;
          </span>
          <span className="text-[11px] text-foreground/45">
            {formatRelativeDate(version.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onPin}
            className={cn(
              "p-1 rounded cursor-pointer transition-colors duration-150 motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
              version.pinned
                ? "text-amber-500 hover:text-amber-600"
                : "text-foreground/25 hover:text-foreground/45",
            )}
            aria-label={version.pinned ? "Unpin version" : "Pin version"}
          >
            <Pin className="size-3.5" aria-hidden="true" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded text-foreground/25 hover:text-foreground/45 cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                aria-label="More actions"
              >
                <MoreHorizontal className="size-3.5" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isCurrent && (
                <DropdownMenuItem onClick={onSetCurrent}>
                  <RotateCcw className="size-3.5 mr-2" aria-hidden="true" />
                  Set as current
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onPin}>
                <Pin className="size-3.5 mr-2" aria-hidden="true" />
                {version.pinned ? "Unpin version" : "Pin version"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                disabled={version.pinned}
                variant="destructive"
              >
                <Trash2 className="size-3.5 mr-2" aria-hidden="true" />
                Delete version
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Prompt */}
      <VersionPrompt prompt={version.prompt} />
    </div>
  );
}

export function AssetHistoryDialog({
  assetRef,
  title = "Version history",
  description,
  triggerLabel = "History",
  triggerClassName,
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

  const versions = asset?.versions ?? [];
  const currentId = asset?.currentVersionId;
  const currentVersion = versions.find((v) => v._id === currentId);
  const previousVersions = versions.filter((v) => v._id !== currentId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className={cn("gap-1.5", triggerClassName)}>
          <History className="size-3.5" aria-hidden="true" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed right-0 top-0 left-auto h-screen w-full max-w-md translate-x-0 translate-y-0 rounded-none border-l p-0 gap-0 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right data-[state=open]:duration-300 data-[state=closed]:duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40">
          <DialogHeader className="text-left">
            <DialogTitle className="font-serif text-lg tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {description ||
                "Browse and manage previous versions of this image."}
            </DialogDescription>
          </DialogHeader>
          {versions.length > 0 && (
            <p className="text-xs text-foreground/45 mt-1">
              {versions.length} version{versions.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <History
                  className="size-5 text-foreground/30"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm text-foreground/55">No versions yet</p>
              <p className="text-xs text-foreground/40 mt-1">
                Generate or edit this image to start tracking history.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Current version */}
              {currentVersion && (
                <VersionCard
                  version={currentVersion}
                  isCurrent={true}
                  onSetCurrent={() => {}}
                  onPin={() =>
                    pinVersion({
                      versionId: currentVersion._id,
                      pinned: !currentVersion.pinned,
                    })
                  }
                  onDelete={() =>
                    deleteVersion({ versionId: currentVersion._id })
                  }
                />
              )}

              {/* Previous versions */}
              {previousVersions.length > 0 && (
                <>
                  <div className="flex items-center gap-3" aria-hidden="true">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/35">
                      Previous
                    </span>
                    <div className="flex-1 h-px bg-border/40" />
                  </div>

                  <div className="space-y-5">
                    {previousVersions.map((version) => (
                      <VersionCard
                        key={version._id}
                        version={version}
                        isCurrent={false}
                        onSetCurrent={() =>
                          setCurrent({
                            assetId: asset?._id as any,
                            versionId: version._id,
                          })
                        }
                        onPin={() =>
                          pinVersion({
                            versionId: version._id,
                            pinned: !version.pinned,
                          })
                        }
                        onDelete={() =>
                          deleteVersion({ versionId: version._id })
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
