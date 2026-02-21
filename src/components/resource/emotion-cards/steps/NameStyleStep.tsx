"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylePicker } from "../StylePicker";
import { StylePreset } from "@/types";
import { HelpTip } from "@/components/onboarding/HelpTip";
import type { WizardState } from "../use-emotion-cards-wizard";

interface NameStyleStepProps {
  name: string;
  styleId: Id<"styles"> | null;
  stylePreset: StylePreset | null;
  onUpdate: (updates: Partial<WizardState>) => void;
  onStyleChange: (styleId: Id<"styles"> | null, preset: StylePreset | null) => void;
  isFirstTimeUser?: boolean;
  isEditMode?: boolean;
  hasGeneratedImages?: boolean;
}

export function NameStyleStep({
  name,
  styleId,
  stylePreset,
  onUpdate,
  onStyleChange,
  isFirstTimeUser = true,
  isEditMode = false,
  hasGeneratedImages = false,
}: NameStyleStepProps) {
  const user = useQuery(api.users.currentUser);

  const handleStyleSelect = (
    selectedStyleId: Id<"styles"> | null,
    preset: StylePreset | null
  ) => {
    onStyleChange(selectedStyleId, preset);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]" role="status" aria-label="Loading">
        <div className="size-6 border-2 border-coral border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* First-time help tip - only show for new users */}
      {isFirstTimeUser && (
        <HelpTip>
          A style keeps your illustrations consistent — same colors, fonts,
          and art direction across every card. Without one, the AI creates freely.
        </HelpTip>
      )}

      {/* Deck Name */}
      <div className="space-y-2">
        <Label htmlFor="deck-name" className="text-base font-medium">
          Deck Name
        </Label>
        <Input
          id="deck-name"
          type="text"
          placeholder="e.g., Primary Feelings, Coping Emotions..."
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="max-w-md text-base"
          autoFocus
        />
        <p className="text-sm text-muted-foreground">
          Give your emotion card deck a descriptive name.
        </p>
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Visual Style <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Pick a style to keep colors, fonts, and illustrations consistent. Skip to let the AI choose freely.
        </p>
        {isEditMode && hasGeneratedImages && (
          <p className="text-sm text-muted-foreground/80 italic mb-4">
            Changing the style won't update existing images — regenerate them in the Generate step.
          </p>
        )}
        <StylePicker
          selectedStyleId={styleId}
          selectedPreset={stylePreset}
          onSelect={handleStyleSelect}
          userId={user._id}
        />
      </div>

    </div>
  );
}
