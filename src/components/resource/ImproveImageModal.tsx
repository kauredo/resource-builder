"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paintbrush, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export interface ImproveImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  originalPrompt?: string;
  assetRef: {
    ownerType: "resource" | "style";
    ownerId: Id<"resources"> | Id<"styles">;
    assetType: string;
    assetKey: string;
  };
  currentStorageId: Id<"_storage">;
  currentVersionId?: Id<"assetVersions">;
  styleId?: Id<"styles">;
  aspect?: "1:1" | "3:4" | "4:3";
}

export function ImproveImageModal({
  open,
  onOpenChange,
  imageUrl,
  originalPrompt,
  assetRef,
  currentStorageId,
  currentVersionId,
  styleId,
  aspect,
}: ImproveImageModalProps) {
  const [instruction, setInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const improveImage = useAction(api.images.improveImage);

  const handleSubmit = async () => {
    if (!instruction.trim()) return;
    setIsImproving(true);
    try {
      await improveImage({
        ownerType: assetRef.ownerType,
        ownerId: assetRef.ownerId,
        assetType: assetRef.assetType,
        assetKey: assetRef.assetKey,
        currentStorageId,
        currentVersionId,
        originalPrompt: originalPrompt ?? "",
        instruction: instruction.trim(),
        styleId,
        aspect,
      });
      toast.success("Image improved");
      setInstruction("");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image improvement failed. Please try again.");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (!next) setInstruction("");
      onOpenChange(next);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paintbrush className="size-5 text-coral" aria-hidden="true" />
            Improve image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current image preview */}
          <div className="rounded-lg border border-border/60 overflow-hidden bg-muted/20 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Current image"
              className="w-full max-h-[260px] object-contain"
            />
          </div>

          {/* Collapsible original prompt */}
          {originalPrompt && (
            <div>
              <button
                type="button"
                onClick={() => setShowPrompt(!showPrompt)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                {showPrompt ? (
                  <ChevronUp className="size-3" aria-hidden="true" />
                ) : (
                  <ChevronDown className="size-3" aria-hidden="true" />
                )}
                Original prompt
              </button>
              {showPrompt && (
                <p className="mt-1.5 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2 leading-relaxed">
                  {originalPrompt}
                </p>
              )}
            </div>
          )}

          {/* Modification instruction */}
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe what to change, e.g. add a hat, make the background blue"
            aria-label="Improvement instructions"
            rows={3}
            disabled={isImproving}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && instruction.trim()) {
                handleSubmit();
              }
            }}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!instruction.trim() || isImproving}
              className="btn-coral gap-1.5"
            >
              {isImproving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Paintbrush className="size-4" aria-hidden="true" />
              )}
              Improve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
