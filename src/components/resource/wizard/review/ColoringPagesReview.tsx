"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { AIWizardState } from "../use-ai-wizard";

interface ColoringPagesReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

interface PageData {
  id?: string;
  title: string;
  description?: string;
  imagePrompt: string;
  imageAssetKey?: string;
}

export function ColoringPagesReview({
  state,
  onUpdate,
}: ColoringPagesReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const pages = (content.pages as PageData[]) || [];

  const updatePage = (index: number, field: keyof PageData, value: string) => {
    const updated = [...pages];
    updated[index] = { ...updated[index], [field]: value };
    const newContent = { ...content, pages: updated };

    if (field === "imagePrompt") {
      onUpdate({
        generatedContent: newContent,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === `coloring_page_${index}`
            ? { ...item, prompt: value }
            : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: newContent });
    }
  };

  const addPage = () => {
    const newPage: PageData = {
      title: "",
      description: "",
      imagePrompt: "",
      imageAssetKey: `coloring_page_${pages.length}`,
    };
    const newPages = [...pages, newPage];
    const newContent = { ...content, pages: newPages };
    const newIndex = newPages.length - 1;

    onUpdate({
      generatedContent: newContent,
      imageItems: [
        ...state.imageItems,
        {
          assetKey: `coloring_page_${newIndex}`,
          assetType: "coloring_page_image",
          prompt: "Coloring page illustration",
          includeText: false,
          aspect: "3:4" as const,
          label: `Page ${newIndex + 1}`,
          status: "pending" as const,
        },
      ],
    });
  };

  const removePage = (index: number) => {
    const newPages = pages.filter((_, i) => i !== index);
    const newContent = { ...content, pages: newPages };

    const newImageItems = newPages.map((page, i) => ({
      assetKey: `coloring_page_${i}`,
      assetType: "coloring_page_image",
      prompt: page.imagePrompt || `Coloring page illustration: ${page.title}`,
      includeText: false,
      aspect: "3:4" as const,
      label: page.title || `Page ${i + 1}`,
      status: "pending" as const,
    }));

    onUpdate({ generatedContent: newContent, imageItems: newImageItems });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Review and edit the coloring pages below. All images will be
        rendered as black-and-white line art, regardless of your style.
      </p>

      <div className="space-y-2 max-w-md">
        <Label htmlFor="review-name" className="font-medium">
          Name
        </Label>
        <Input
          id="review-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          maxLength={100}
          placeholder="Coloring pages name"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Pages ({pages.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addPage}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Page
          </Button>
        </div>

        {pages.map((page, index) => (
          <div
            key={page.id ?? index}
            className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Page {index + 1}
              </span>
              {pages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePage(index)}
                  className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                  aria-label={`Remove page ${index + 1}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`cp-${index}-title`} className="text-xs">
                  Title
                </Label>
                <Input
                  id={`cp-${index}-title`}
                  value={page.title}
                  onChange={(e) => updatePage(index, "title", e.target.value)}
                  placeholder="Page title"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`cp-${index}-desc`} className="text-xs">
                  Description (optional)
                </Label>
                <Input
                  id={`cp-${index}-desc`}
                  value={page.description || ""}
                  onChange={(e) =>
                    updatePage(index, "description", e.target.value)
                  }
                  placeholder="Brief scene description"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`cp-${index}-prompt`} className="text-xs">
                Image Prompt
              </Label>
              <Textarea
                id={`cp-${index}-prompt`}
                value={page.imagePrompt || ""}
                onChange={(e) =>
                  updatePage(index, "imagePrompt", e.target.value)
                }
                placeholder="Describe the scene (style is handled automatically)"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
