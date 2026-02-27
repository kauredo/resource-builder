"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylePicker } from "@/components/resource/emotion-cards/StylePicker";
import { CharacterPicker } from "@/components/resource/wizard/CharacterPicker";
import { cn } from "@/lib/utils";
import type {
  WorksheetWizardState,
  WorksheetCreationMode,
} from "./use-worksheet-wizard";
import type { StylePreset, CharacterSelection } from "@/types";

interface WorksheetSetupStepProps {
  state: WorksheetWizardState;
  onUpdate: (updates: Partial<WorksheetWizardState>) => void;
  onStyleChange: (styleId: Id<"styles"> | null, preset: StylePreset | null) => void;
  userId: Id<"users">;
}

const MODE_OPTIONS: {
  value: WorksheetCreationMode;
  label: string;
  description: string;
}[] = [
  {
    value: "ai",
    label: "AI generates the worksheet",
    description:
      "Describe what you need and AI creates all blocks and image prompts.",
  },
  {
    value: "manual",
    label: "I'll build it manually",
    description: "Add and configure each block yourself.",
  },
];

export function WorksheetSetupStep({
  state,
  onUpdate,
  onStyleChange,
  userId,
}: WorksheetSetupStepProps) {
  const handleStyleSelect = (
    styleId: Id<"styles"> | null,
    preset: StylePreset | null,
  ) => {
    onStyleChange(styleId, preset);
  };

  const handleCharacterChange = (selection: CharacterSelection | null) => {
    onUpdate({ characterSelection: selection });
  };

  return (
    <div className="space-y-8">
      {/* Worksheet name */}
      <div className="space-y-2">
        <Label htmlFor="worksheet-name" className="text-base font-medium">
          Worksheet name
        </Label>
        <Input
          id="worksheet-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g., CBT Thought Record"
          className="text-base"
        />
      </div>

      {/* Creation mode */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          How do you want to create content?
        </Label>
        <div className="space-y-2">
          {MODE_OPTIONS.map((opt) => {
            const isSelected = state.creationMode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ creationMode: opt.value })}
                aria-pressed={isSelected}
                className={cn(
                  "w-full flex items-start gap-3 rounded-xl border p-4 text-left cursor-pointer",
                  "transition-colors duration-150 motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                  isSelected
                    ? "border-coral/40 bg-[color-mix(in_oklch,var(--coral)_8%,transparent)]"
                    : "border-border/60 hover:border-border",
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded-full border-2 mt-0.5 shrink-0",
                    isSelected ? "border-coral bg-coral" : "border-border",
                  )}
                >
                  {isSelected && (
                    <div className="size-full rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual style */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Visual Style{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Pick a style to keep colors, fonts, and illustrations consistent.
          Skip to let the AI choose freely.
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

      {/* Character */}
      <CharacterPicker
        selection={state.characterSelection}
        onChange={handleCharacterChange}
        userId={userId}
      />
    </div>
  );
}
