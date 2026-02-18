"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import type { BookPage, BookLayout } from "@/types";

interface BookPageEditorProps {
  page: BookPage;
  index: number;
  totalPages: number;
  layout: BookLayout;
  onUpdate: (pageId: string, updates: Partial<BookPage>) => void;
  onMove: (pageId: string, direction: "up" | "down") => void;
  onRemove: (pageId: string) => void;
  canRemove: boolean;
}

export function BookPageEditor({
  page,
  index,
  totalPages,
  layout,
  onUpdate,
  onMove,
  onRemove,
  canRemove,
}: BookPageEditorProps) {
  const charCount = page.text.length;
  const isPictureBook = layout === "picture_book";
  const charWarning = isPictureBook && charCount > 200;

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/40">
        <span className="text-sm font-medium text-foreground">
          Page {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMove(page.id, "up")}
            disabled={index === 0}
            aria-label="Move page up"
          >
            <ChevronUp className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMove(page.id, "down")}
            disabled={index === totalPages - 1}
            aria-label="Move page down"
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(page.id)}
              aria-label="Remove page"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Page text */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Text
          </Label>
          <Textarea
            value={page.text}
            onChange={(e) => onUpdate(page.id, { text: e.target.value })}
            placeholder="Write the page text..."
            rows={isPictureBook ? 3 : 5}
          />
          <div className="flex items-center justify-between">
            <p
              className={`text-xs ${charWarning ? "text-amber-600" : "text-muted-foreground/60"}`}
            >
              {charCount} characters
              {isPictureBook && " (recommended: under 200)"}
            </p>
          </div>
        </div>

        {/* Image prompt */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Image prompt
          </Label>
          <Textarea
            value={page.imagePrompt || ""}
            onChange={(e) =>
              onUpdate(page.id, { imagePrompt: e.target.value })
            }
            placeholder="Describe the illustration for this page... (leave blank for text-only page)"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
