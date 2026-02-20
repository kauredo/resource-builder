"use client";

import { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { StylePreset } from "@/types";
import { extractCharacterIds } from "@/lib/utils";
import { StylePicker } from "@/components/resource/emotion-cards/StylePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Paintbrush } from "lucide-react";
import { toast } from "sonner";

interface ResourceStyleChangerProps {
  resourceId: Id<"resources">;
  currentStyleId?: Id<"styles">;
  userId: Id<"users">;
  content: Record<string, unknown>;
}

export function ResourceStyleChanger({
  resourceId,
  currentStyleId,
  userId,
  content,
}: ResourceStyleChangerProps) {
  const [open, setOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const style = useQuery(
    api.styles.getStyle,
    currentStyleId ? { styleId: currentStyleId } : "skip",
  );
  const updateResource = useMutation(api.resources.updateResource);
  const ensureCharacterRef = useAction(
    api.characterActions.ensureCharacterReference,
  );

  const handleSelect = async (
    styleId: Id<"styles"> | null,
    _preset: StylePreset | null,
  ) => {
    if (!styleId || styleId === currentStyleId) return;

    setIsChanging(true);
    try {
      await updateResource({ resourceId, styleId });

      // Ensure character references exist for the new style
      const characterIds = extractCharacterIds(content);
      if (characterIds.length > 0) {
        await Promise.allSettled(
          characterIds.map((id) =>
            ensureCharacterRef({
              characterId: id as Id<"characters">,
              styleId,
            }),
          ),
        );
      }

      toast.success("Style updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update style");
    } finally {
      setIsChanging(false);
    }
  };

  const colorEntries = style
    ? [
        style.colors.primary,
        style.colors.secondary,
        style.colors.accent,
        style.colors.text,
        style.colors.background,
      ]
    : [];

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Paintbrush className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">Style</span>

          {style ? (
            <>
              <div
                className="flex h-5 w-20 rounded overflow-hidden ring-1 ring-border/50"
                role="img"
                aria-label={`${style.name} color palette`}
              >
                {colorEntries.map((color, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{style.name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">None selected</span>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer"
              aria-label="Change style"
            >
              Change
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Change Style</DialogTitle>
            </DialogHeader>

            {isChanging ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                <span className="text-sm">Updating style...</span>
              </div>
            ) : (
              <StylePicker
                selectedStyleId={currentStyleId ?? null}
                selectedPreset={null}
                onSelect={handleSelect}
                userId={userId}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
