"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StylePicker } from "@/components/resource/emotion-cards/StylePicker";
import { CharacterPicker } from "@/components/resource/wizard/CharacterPicker";
import { Wand2, Loader2 } from "lucide-react";
import type { AIWizardState } from "./use-ai-wizard";
import type { StylePreset, CharacterSelection } from "@/types";

interface WizardDescribeStepProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
  onStyleChange: (styleId: Id<"styles"> | null, preset: StylePreset | null) => void;
  onGenerateContent: () => Promise<void>;
  userId: Id<"users">;
}

const PLACEHOLDER_MAP: Record<string, string> = {
  poster:
    "A calming poster for a therapy room that reminds kids to take deep breaths when feeling overwhelmed...",
  flashcards:
    "A set of coping skills flashcards for anxious children, with simple breathing and grounding techniques...",
  card_game:
    "A fun feelings card game where kids match emotions and practice naming what they feel...",
  board_game:
    "A feelings adventure board game where kids move through spaces and practice coping skills...",
  worksheet:
    "A CBT thought record worksheet for teens, with sections for situation, thoughts, feelings, and coping responses...",
  emotion_cards:
    "A set of emotion cards showing different feelings like happy, sad, angry, and scared, for young children to identify and name...",
  behavior_chart:
    "A sticker chart for a 6-year-old with ADHD to track morning routine behaviors like brushing teeth, getting dressed, and eating breakfast...",
  visual_schedule:
    "A morning routine visual schedule for a 6-year-old with ASD, showing wake up, brush teeth, get dressed, eat breakfast, and pack bag...",
};

export function WizardDescribeStep({
  state,
  onUpdate,
  onStyleChange,
  onGenerateContent,
  userId,
}: WizardDescribeStepProps) {
  const placeholder = PLACEHOLDER_MAP[state.resourceType] || "Describe what you want to create...";

  const handleStyleSelect = (
    styleId: Id<"styles"> | null,
    preset: StylePreset | null,
  ) => {
    onStyleChange(styleId, preset);
  };

  const handleCharacterChange = (selection: CharacterSelection | null) => {
    onUpdate({ characterSelection: selection });
  };

  const isGenerating = state.contentStatus === "generating";

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="wizard-description" className="text-base font-medium">
          What do you want to create?
        </Label>
        <p className="text-sm text-muted-foreground">
          Describe your resource and AI will generate the content, layout, and
          image prompts for you.
        </p>
        <Textarea
          id="wizard-description"
          value={state.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder={placeholder}
          rows={4}
          maxLength={2000}
          className="text-base"
        />
      </div>

      {/* Style */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Visual Style <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <p className="text-sm text-muted-foreground mb-4">
          Pick a style to keep colors, fonts, and illustrations consistent. Skip to let the AI choose freely.
        </p>
        {state.isEditMode && state.imageItems.length > 0 && (
          <p className="text-sm text-muted-foreground/80 italic mb-4">
            Changing the style won't update existing images — regenerate them in the Generate step.
          </p>
        )}
        <StylePicker
          selectedStyleId={state.styleId}
          selectedPreset={state.stylePreset}
          onSelect={handleStyleSelect}
          userId={userId}
        />
      </div>

      {/* Character (optional) */}
      <CharacterPicker
        selection={state.characterSelection}
        onChange={handleCharacterChange}
        userId={userId}
      />

      {/* Generate button */}
      {state.contentStatus === "error" && state.contentError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive" role="alert">
          {state.contentError}
        </div>
      )}

      {state.contentStatus === "ready" && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onGenerateContent}
            disabled={!state.description.trim() || isGenerating}
            className="gap-2"
          >
            <Wand2 className="size-4" aria-hidden="true" />
            Regenerate Content
          </Button>
          <span className="text-sm text-muted-foreground">
            Content generated — edit it in the next step.
          </span>
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Generating content...
        </div>
      )}
    </div>
  );
}
