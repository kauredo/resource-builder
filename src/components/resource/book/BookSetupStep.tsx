"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylePicker } from "@/components/resource/emotion-cards/StylePicker";
import { CharacterPicker } from "@/components/resource/wizard/CharacterPicker";
import { BookOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookWizardState, BookCreationMode } from "./use-book-wizard";
import type { StylePreset, CharacterSelection, BookLayout } from "@/types";

interface BookSetupStepProps {
  state: BookWizardState;
  onUpdate: (updates: Partial<BookWizardState>) => void;
  userId: Id<"users">;
}

const LAYOUT_OPTIONS: {
  value: BookLayout;
  label: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
  {
    value: "picture_book",
    label: "Picture Book",
    description: "Large illustration with short text below each page.",
    icon: BookOpen,
  },
  {
    value: "illustrated_text",
    label: "Illustrated Text",
    description: "Text-heavy pages with a smaller illustration at the top.",
    icon: FileText,
  },
];

const MODE_OPTIONS: {
  value: BookCreationMode;
  label: string;
  description: string;
}[] = [
  {
    value: "ai",
    label: "AI writes the story",
    description: "Describe your book and AI generates all pages and image prompts.",
  },
  {
    value: "manual",
    label: "I'll write the text",
    description: "You write each page's text, AI creates illustrations.",
  },
];

export function BookSetupStep({ state, onUpdate, userId }: BookSetupStepProps) {
  const handleStyleSelect = (
    styleId: Id<"styles"> | null,
    preset: StylePreset | null,
  ) => {
    if (styleId) {
      onUpdate({ styleId, stylePreset: preset });
    } else if (preset) {
      onUpdate({ styleId: null, stylePreset: preset });
    }
  };

  const handleCharacterChange = (selection: CharacterSelection | null) => {
    onUpdate({ characterSelection: selection });
  };

  return (
    <div className="space-y-8">
      {/* Book name */}
      <div className="space-y-2">
        <Label htmlFor="book-name" className="text-base font-medium">
          Book name
        </Label>
        <Input
          id="book-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g., My Feelings Adventure"
          className="text-base"
        />
      </div>

      {/* Book type */}
      <div className="space-y-2">
        <Label htmlFor="book-type" className="text-base font-medium">
          What kind of book?
        </Label>
        <p className="text-sm text-muted-foreground">
          Describe the type of book so the AI understands the goal.
        </p>
        <Input
          id="book-type"
          value={state.bookType}
          onChange={(e) => onUpdate({ bookType: e.target.value })}
          placeholder="e.g., social story, CBT workbook, feelings journal"
          className="text-base"
        />
      </div>

      {/* Layout */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Page layout</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LAYOUT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = state.layout === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ layout: opt.value })}
                aria-pressed={isSelected}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left cursor-pointer",
                  "transition-colors duration-150 motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                  isSelected
                    ? "border-coral/40 bg-[color-mix(in_oklch,var(--coral)_8%,transparent)]"
                    : "border-border/60 hover:border-border",
                )}
              >
                <div
                  className={cn(
                    "size-9 rounded-lg flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-coral/20 text-coral"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4.5" aria-hidden="true" />
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

      {/* Cover toggle */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.hasCover}
            onChange={(e) => onUpdate({ hasCover: e.target.checked })}
            className="size-4 rounded border-border accent-coral"
          />
          <span className="text-sm font-medium">Include a cover page</span>
        </label>
      </div>

      {/* Creation mode */}
      <div className="space-y-3">
        <Label className="text-base font-medium">How do you want to create content?</Label>
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
                    isSelected
                      ? "border-coral bg-coral"
                      : "border-border",
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
        <Label className="text-base font-medium">Visual Style</Label>
        {state.isEditMode ? (
          <p className="text-sm text-muted-foreground">
            Style is locked after creation.
          </p>
        ) : (
          <StylePicker
            selectedStyleId={state.styleId}
            selectedPreset={state.stylePreset}
            onSelect={handleStyleSelect}
            userId={userId}
          />
        )}
      </div>

      {/* Character */}
      <CharacterPicker
        selection={state.characterSelection}
        onChange={handleCharacterChange}
        styleId={state.styleId}
        userId={userId}
        onStyleChange={(id, preset) =>
          onUpdate({ styleId: id, stylePreset: preset })
        }
      />
    </div>
  );
}
