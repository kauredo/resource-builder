"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { AIWizardState } from "../use-ai-wizard";

interface FlashcardsReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

interface CardData {
  frontText: string;
  backText: string;
  imagePrompt?: string;
}

export function FlashcardsReview({
  state,
  onUpdate,
}: FlashcardsReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const cards = ((content.cards as CardData[]) || []);

  const updateCard = (index: number, field: keyof CardData, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    const newContent = { ...content, cards: updated };

    if (field === "imagePrompt" || field === "frontText") {
      const prompt =
        field === "imagePrompt"
          ? value
          : updated[index].imagePrompt || `Flashcard illustration for: ${value}`;
      onUpdate({
        generatedContent: newContent,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === `flashcard_front_${index}`
            ? { ...item, prompt }
            : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: newContent });
    }
  };

  const addCard = () => {
    const newCard: CardData = { frontText: "", backText: "", imagePrompt: "" };
    const newCards = [...cards, newCard];
    const newContent = { ...content, cards: newCards };
    const newIndex = newCards.length - 1;

    onUpdate({
      generatedContent: newContent,
      imageItems: [
        ...state.imageItems,
        {
          assetKey: `flashcard_front_${newIndex}`,
          assetType: "flashcard_front_image",
          prompt: "Flashcard illustration",
          includeText: true,
          aspect: "1:1" as const,
          status: "pending" as const,
        },
      ],
    });
  };

  const removeCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    const newContent = { ...content, cards: newCards };

    // Rebuild imageItems with corrected indices
    const newImageItems = newCards.map((card, i) => ({
      assetKey: `flashcard_front_${i}`,
      assetType: "flashcard_front_image",
      prompt:
        card.imagePrompt || `Flashcard illustration for: ${card.frontText}`,
      includeText: true,
      aspect: "1:1" as const,
      status: "pending" as const,
    }));

    onUpdate({ generatedContent: newContent, imageItems: newImageItems });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Review and edit the AI-generated flashcards before generating images.
        </p>
      </div>

      <div className="space-y-2 max-w-md">
        <Label htmlFor="review-name" className="font-medium">
          Deck Name
        </Label>
        <Input
          id="review-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Flashcard deck name"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Cards ({cards.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addCard}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Card
          </Button>
        </div>

        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Card {index + 1}
              </span>
              {cards.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCard(index)}
                  className="text-muted-foreground hover:text-red-500 cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                  aria-label={`Remove card ${index + 1}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`flashcard-${index}-front`} className="text-xs">Front Text</Label>
                <Input
                  id={`flashcard-${index}-front`}
                  value={card.frontText}
                  onChange={(e) =>
                    updateCard(index, "frontText", e.target.value)
                  }
                  placeholder="Front side text"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`flashcard-${index}-back`} className="text-xs">Back Text</Label>
                <Input
                  id={`flashcard-${index}-back`}
                  value={card.backText}
                  onChange={(e) =>
                    updateCard(index, "backText", e.target.value)
                  }
                  placeholder="Back side text"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`flashcard-${index}-prompt`} className="text-xs">Image Prompt</Label>
              <Textarea
                id={`flashcard-${index}-prompt`}
                value={card.imagePrompt || ""}
                onChange={(e) =>
                  updateCard(index, "imagePrompt", e.target.value)
                }
                placeholder="Describe the card illustration"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
