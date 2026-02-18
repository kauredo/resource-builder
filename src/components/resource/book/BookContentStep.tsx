"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Plus } from "lucide-react";
import { BookPageEditor } from "./BookPageEditor";
import { DetectedCharactersReview } from "@/components/resource/wizard/DetectedCharactersReview";
import type { BookWizardState } from "./use-book-wizard";
import type { BookPage, BookCover } from "@/types";

interface BookContentStepProps {
  state: BookWizardState;
  onUpdate: (updates: Partial<BookWizardState>) => void;
  onGenerateContent: () => Promise<void>;
  onUpdateCharacterPrompt: (characterId: string, promptFragment: string) => void;
  onRemoveDetectedCharacter: (characterId: string) => void;
  addPage: () => void;
  removePage: (pageId: string) => void;
  movePage: (pageId: string, direction: "up" | "down") => void;
  updatePage: (pageId: string, updates: Partial<BookPage>) => void;
}

export function BookContentStep({
  state,
  onUpdate,
  onGenerateContent,
  onUpdateCharacterPrompt,
  onRemoveDetectedCharacter,
  addPage,
  removePage,
  movePage,
  updatePage,
}: BookContentStepProps) {
  const isGenerating = state.contentStatus === "generating";
  const hasContent = state.contentStatus === "ready" && state.pages.length > 0;

  const updateCover = (updates: Partial<BookCover>) => {
    onUpdate({
      cover: state.cover
        ? { ...state.cover, ...updates }
        : { title: "", ...updates },
    });
  };

  return (
    <div className="space-y-8">
      {/* AI generation section */}
      {state.creationMode === "ai" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-description" className="text-base font-medium">
              Describe your book
            </Label>
            <p className="text-sm text-muted-foreground">
              Tell the AI what this book is about and it will generate all the
              pages, text, and image prompts.
            </p>
            <Textarea
              id="book-description"
              value={state.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="A social story about a shy cat who learns to make friends at school. Each page shows a new step in building friendships..."
              rows={hasContent ? 3 : 5}
              className="text-base"
            />
          </div>

          {state.contentStatus === "error" && state.contentError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {state.contentError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={onGenerateContent}
              disabled={!state.description.trim() || isGenerating}
              className={hasContent ? "gap-2" : "btn-coral gap-2"}
              variant={hasContent ? "outline" : "default"}
            >
              <Wand2 className="size-4" aria-hidden="true" />
              {hasContent ? "Regenerate Content" : "Generate Book Content"}
            </Button>
            {isGenerating && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Writing your book...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Manual mode intro (before any pages exist) */}
      {state.creationMode === "manual" && state.pages.length === 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium">Write your pages</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add pages and write the text for each one. Include image prompts
              for pages you want illustrated.
            </p>
          </div>
          <div className="text-center py-8 rounded-xl border border-dashed border-border/60">
            <p className="text-sm text-muted-foreground mb-4">
              No pages yet. Add your first page to get started.
            </p>
            <Button onClick={addPage} variant="outline" className="gap-2">
              <Plus className="size-4" aria-hidden="true" />
              Add first page
            </Button>
          </div>
        </div>
      )}

      {/* Detected characters review */}
      {hasContent && (
        <DetectedCharactersReview
          characters={state.detectedCharacters}
          status={state.detectedCharactersStatus}
          onUpdatePromptFragment={onUpdateCharacterPrompt}
          onRemoveCharacter={onRemoveDetectedCharacter}
        />
      )}

      {/* Cover editor */}
      {state.hasCover && hasContent && (
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

      {/* Page editors */}
      {(hasContent || (state.creationMode === "manual" && state.pages.length > 0)) && (
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
        </div>
      )}
    </div>
  );
}
