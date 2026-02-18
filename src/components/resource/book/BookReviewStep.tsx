"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BookPageEditor } from "./BookPageEditor";
import type { BookWizardState } from "./use-book-wizard";
import type { BookPage, BookCover } from "@/types";

interface BookReviewStepProps {
  state: BookWizardState;
  onUpdate: (updates: Partial<BookWizardState>) => void;
  addPage: () => void;
  removePage: (pageId: string) => void;
  movePage: (pageId: string, direction: "up" | "down") => void;
  updatePage: (pageId: string, updates: Partial<BookPage>) => void;
}

export function BookReviewStep({
  state,
  onUpdate,
  addPage,
  removePage,
  movePage,
  updatePage,
}: BookReviewStepProps) {
  const updateCover = (updates: Partial<BookCover>) => {
    onUpdate({
      cover: state.cover
        ? { ...state.cover, ...updates }
        : { title: "", ...updates },
    });
  };

  return (
    <div className="space-y-8">
      {/* Cover */}
      {state.hasCover && (
        <div className="space-y-4">
          <h3 className="text-base font-medium">Cover</h3>
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Title
              </Label>
              <Input
                value={state.cover?.title || ""}
                onChange={(e) => updateCover({ title: e.target.value })}
                placeholder="Book title"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Subtitle
              </Label>
              <Input
                value={state.cover?.subtitle || ""}
                onChange={(e) => updateCover({ subtitle: e.target.value })}
                placeholder="Optional subtitle"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Cover image prompt
              </Label>
              <Textarea
                value={state.cover?.imagePrompt || ""}
                onChange={(e) => updateCover({ imagePrompt: e.target.value })}
                placeholder="Describe the cover illustration..."
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">
            Pages ({state.pages.length})
          </h3>
          <Button onClick={addPage} variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            Add page
          </Button>
        </div>

        {state.pages.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-dashed border-border/60">
            <p className="text-sm text-muted-foreground">
              No pages yet. Add your first page.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.pages.map((page, i) => (
              <BookPageEditor
                key={page.id}
                page={page}
                index={i}
                totalPages={state.pages.length}
                layout={state.layout}
                onUpdate={updatePage}
                onMove={movePage}
                onRemove={removePage}
                canRemove={state.pages.length > 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
