"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AIWizardState } from "../use-ai-wizard";

interface PosterReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

export function PosterReview({ state, onUpdate }: PosterReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const headline = (content.headline as string) || "";
  const subtext = (content.subtext as string) || "";
  const imagePrompt = (content.imagePrompt as string) || "";

  const updateContent = (field: string, value: string) => {
    const updated = { ...content, [field]: value };

    if (field === "imagePrompt" || field === "headline") {
      const prompt =
        field === "imagePrompt"
          ? value
          : (content.imagePrompt as string) || value;
      onUpdate({
        generatedContent: updated,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === "poster_main"
            ? { ...item, prompt: `Poster illustration: ${prompt}` }
            : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: updated });
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Review and edit the AI-generated content before generating images.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-name" className="font-medium">
          Resource Name
        </Label>
        <Input
          id="review-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          maxLength={100}
          placeholder="Poster name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-headline" className="font-medium">
          Headline
        </Label>
        <Input
          id="review-headline"
          value={headline}
          onChange={(e) => updateContent("headline", e.target.value)}
          placeholder="Main poster text"
        />
        <p className="text-xs text-muted-foreground">
          This text will be baked into the generated image.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-subtext" className="font-medium">
          Subtext (optional)
        </Label>
        <Textarea
          id="review-subtext"
          value={subtext}
          onChange={(e) => updateContent("subtext", e.target.value)}
          placeholder="Supportive reminder or grounding phrase"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-prompt" className="font-medium">
          Image Prompt
        </Label>
        <Textarea
          id="review-prompt"
          value={imagePrompt}
          onChange={(e) => updateContent("imagePrompt", e.target.value)}
          placeholder="Describe the illustration"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          AI will generate the poster illustration based on this description.
        </p>
      </div>
    </div>
  );
}
