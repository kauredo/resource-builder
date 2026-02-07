"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { AIWizardState } from "../use-ai-wizard";

interface CardGameReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

interface GameCardData {
  title: string;
  text: string;
  count: number;
  imagePrompt?: string;
}

export function CardGameReview({
  state,
  onUpdate,
}: CardGameReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const rules = (content.rules as string) || "";
  const deckName = (content.deckName as string) || "";
  const cards = (content.cards as GameCardData[]) || [];

  const updateField = (field: string, value: string) => {
    onUpdate({ generatedContent: { ...content, [field]: value } });
  };

  const updateCard = (
    index: number,
    field: keyof GameCardData,
    value: string | number,
  ) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    const newContent = { ...content, cards: updated };

    if (field === "imagePrompt" || field === "title") {
      const prompt =
        field === "imagePrompt"
          ? (value as string)
          : updated[index].imagePrompt || `Card game card: ${value as string}`;
      onUpdate({
        generatedContent: newContent,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === `card_${index}` ? { ...item, prompt } : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: newContent });
    }
  };

  const addCard = () => {
    const newCard: GameCardData = {
      title: "",
      text: "",
      count: 1,
      imagePrompt: "",
    };
    const newCards = [...cards, newCard];
    const newContent = { ...content, cards: newCards };
    const newIndex = newCards.length - 1;

    onUpdate({
      generatedContent: newContent,
      imageItems: [
        ...state.imageItems,
        {
          assetKey: `card_${newIndex}`,
          assetType: "card_image",
          prompt: "Card game card illustration",
          includeText: true,
          aspect: "3:4" as const,
          status: "pending" as const,
        },
      ],
    });
  };

  const removeCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    const newContent = { ...content, cards: newCards };

    const newImageItems = newCards.map((card, i) => ({
      assetKey: `card_${i}`,
      assetType: "card_image",
      prompt: card.imagePrompt || `Card game card: ${card.title}`,
      includeText: true,
      aspect: "3:4" as const,
      status: "pending" as const,
    }));

    onUpdate({ generatedContent: newContent, imageItems: newImageItems });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review and edit the AI-generated card game before generating images.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="review-name" className="font-medium">
            Game Name
          </Label>
          <Input
            id="review-name"
            value={state.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Game name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-deck" className="font-medium">
            Deck Name
          </Label>
          <Input
            id="review-deck"
            value={deckName}
            onChange={(e) => updateField("deckName", e.target.value)}
            placeholder="Deck name"
          />
        </div>
      </div>

      <div className="space-y-2 max-w-xl">
        <Label htmlFor="review-rules" className="font-medium">
          Rules
        </Label>
        <Textarea
          id="review-rules"
          value={rules}
          onChange={(e) => updateField("rules", e.target.value)}
          placeholder="Game rules"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Card Types ({cards.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addCard}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Card Type
          </Button>
        </div>

        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Card Type {index + 1}
              </span>
              {cards.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCard(index)}
                  className="text-muted-foreground hover:text-red-500 cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                  aria-label={`Remove card type ${index + 1}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`card-${index}-title`} className="text-xs">Title</Label>
                <Input
                  id={`card-${index}-title`}
                  value={card.title}
                  onChange={(e) =>
                    updateCard(index, "title", e.target.value)
                  }
                  placeholder="Card title"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`card-${index}-text`} className="text-xs">Instructions</Label>
                <Input
                  id={`card-${index}-text`}
                  value={card.text}
                  onChange={(e) =>
                    updateCard(index, "text", e.target.value)
                  }
                  placeholder="Card text"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`card-${index}-count`} className="text-xs">Count</Label>
                <Input
                  id={`card-${index}-count`}
                  type="number"
                  min={1}
                  max={20}
                  value={card.count}
                  onChange={(e) =>
                    updateCard(index, "count", parseInt(e.target.value) || 1)
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`card-${index}-prompt`} className="text-xs">Image Prompt</Label>
              <Textarea
                id={`card-${index}-prompt`}
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
