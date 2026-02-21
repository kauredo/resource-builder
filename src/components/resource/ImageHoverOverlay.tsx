import { Button } from "@/components/ui/button";
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { Pencil, Paintbrush } from "lucide-react";
import type { AssetRef } from "@/types";

interface ImageHoverOverlayProps {
  isHovered: boolean;
  onEdit: () => void;
  onImprove: () => void;
  assetRef: AssetRef;
  aspectRatio?: string;
}

export function ImageHoverOverlay({
  isHovered,
  onEdit,
  onImprove,
  assetRef,
  aspectRatio,
}: ImageHoverOverlayProps) {
  return (
    <div
      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 motion-reduce:transition-none ${
        isHovered
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col gap-2 min-w-[140px]">
        <Button
          size="sm"
          variant="secondary"
          onClick={onEdit}
          className="w-full gap-1.5"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onImprove}
          className="w-full gap-1.5"
        >
          <Paintbrush className="size-3.5" aria-hidden="true" />
          Improve
        </Button>
        <AssetHistoryDialog
          assetRef={assetRef}
          triggerLabel="History"
          triggerClassName="w-full"
          aspectRatio={aspectRatio}
        />
      </div>
    </div>
  );
}
