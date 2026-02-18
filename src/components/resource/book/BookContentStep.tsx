"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Plus } from "lucide-react";
import type { BookWizardState } from "./use-book-wizard";

interface BookContentStepProps {
  state: BookWizardState;
  onUpdate: (updates: Partial<BookWizardState>) => void;
  onGenerateContent: () => Promise<void>;
  addPage: () => void;
}

export function BookContentStep({
  state,
  onUpdate,
  onGenerateContent,
  addPage,
}: BookContentStepProps) {
  const isGenerating = state.contentStatus === "generating";

  if (state.creationMode === "ai") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="book-description" className="text-base font-medium">
            Describe your book
          </Label>
          <p className="text-sm text-muted-foreground">
            Tell the AI what this book is about and it will generate all the
            pages, text, and image prompts for you.
          </p>
          <Textarea
            id="book-description"
            value={state.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="A social story about a shy cat who learns to make friends at school. Each page shows a new step in building friendships..."
            rows={5}
            className="text-base"
          />
        </div>

        {state.contentStatus === "error" && state.contentError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {state.contentError}
          </div>
        )}

        {state.contentStatus === "ready" && (
          <div className="rounded-lg border border-teal/30 bg-teal/5 p-4">
            <p className="text-sm font-medium text-foreground">
              Content generated — {state.pages.length} pages
              {state.cover ? " + cover" : ""}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Review and edit in the next step, or regenerate below.
            </p>
            <Button
              variant="outline"
              onClick={onGenerateContent}
              disabled={!state.description.trim() || isGenerating}
              className="gap-2 mt-3"
            >
              <Wand2 className="size-4" aria-hidden="true" />
              Regenerate Content
            </Button>
          </div>
        )}

        {state.contentStatus === "idle" && (
          <Button
            onClick={onGenerateContent}
            disabled={!state.description.trim() || isGenerating}
            className="btn-coral gap-2"
          >
            <Wand2 className="size-4" aria-hidden="true" />
            Generate Book Content
          </Button>
        )}

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Writing your book...
          </div>
        )}
      </div>
    );
  }

  // Manual mode
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Write your pages</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add pages and write the text for each one. You can add image prompts
          in the review step.
        </p>
      </div>

      {state.pages.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-border/60">
          <p className="text-sm text-muted-foreground mb-4">
            No pages yet. Add your first page to get started.
          </p>
          <Button onClick={addPage} variant="outline" className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            Add first page
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {state.pages.map((page, i) => (
            <div key={page.id} className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Page {i + 1}
              </Label>
              <Textarea
                value={page.text}
                onChange={(e) => {
                  const updatedPages = state.pages.map((p) =>
                    p.id === page.id ? { ...p, text: e.target.value } : p,
                  );
                  onUpdate({ pages: updatedPages, contentStatus: "ready" });
                }}
                placeholder={`Write the text for page ${i + 1}...`}
                rows={3}
              />
            </div>
          ))}

          <Button onClick={addPage} variant="outline" className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            Add page
          </Button>
        </div>
      )}
    </div>
  );
}
