"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmotionChip } from "../EmotionChip";
import {
  PRIMARY_EMOTIONS,
  SECONDARY_EMOTIONS,
  NUANCED_EMOTIONS,
} from "@/types";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTip } from "@/components/onboarding/HelpTip";
import type { WizardState } from "../EmotionCardsWizard";

interface EmotionSelectionStepProps {
  selectedEmotions: string[];
  onUpdate: (updates: Partial<WizardState>) => void;
  isFirstTimeUser?: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  emotions: readonly string[];
  selectedEmotions: string[];
  defaultOpen?: boolean;
  onToggleEmotion: (emotion: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

function CollapsibleSection({
  title,
  emotions,
  selectedEmotions,
  defaultOpen = false,
  onToggleEmotion,
  onSelectAll,
  onDeselectAll,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const selectedCount = emotions.filter((e) => selectedEmotions.includes(e)).length;
  const allSelected = emotions.every((e) => selectedEmotions.includes(e));

  return (
    <section className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">
            ({emotions.length} emotions)
          </span>
        </div>
        {selectedCount > 0 && (
          <span className="text-sm font-medium text-coral tabular-nums">
            {selectedCount} selected
          </span>
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t bg-muted/20">
          <div className="flex items-center justify-end mb-3">
            <button
              type="button"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-xs text-coral cursor-pointer hover:underline underline-offset-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {emotions.map((emotion) => (
              <EmotionChip
                key={emotion}
                emotion={emotion}
                isSelected={selectedEmotions.includes(emotion)}
                onToggle={() => onToggleEmotion(emotion)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function EmotionSelectionStep({
  selectedEmotions,
  onUpdate,
  isFirstTimeUser = true,
}: EmotionSelectionStepProps) {
  const [customEmotion, setCustomEmotion] = useState("");
  const [customEmotions, setCustomEmotions] = useState<string[]>([]);
  const [showCustom, setShowCustom] = useState(false);

  const toggleEmotion = (emotion: string) => {
    const updated = selectedEmotions.includes(emotion)
      ? selectedEmotions.filter((e) => e !== emotion)
      : [...selectedEmotions, emotion];
    onUpdate({ selectedEmotions: updated });
  };

  const addCustomEmotion = () => {
    const trimmed = customEmotion.trim();
    if (trimmed && !selectedEmotions.includes(trimmed) && !customEmotions.includes(trimmed)) {
      setCustomEmotions((prev) => [...prev, trimmed]);
      onUpdate({ selectedEmotions: [...selectedEmotions, trimmed] });
      setCustomEmotion("");
    }
  };

  const removeCustomEmotion = (emotion: string) => {
    setCustomEmotions((prev) => prev.filter((e) => e !== emotion));
    onUpdate({ selectedEmotions: selectedEmotions.filter((e) => e !== emotion) });
  };

  const selectAll = (emotions: readonly string[]) => {
    const newEmotions = emotions.filter((e) => !selectedEmotions.includes(e));
    onUpdate({ selectedEmotions: [...selectedEmotions, ...newEmotions] });
  };

  const deselectAll = (emotions: readonly string[]) => {
    onUpdate({
      selectedEmotions: selectedEmotions.filter((e) => !emotions.includes(e)),
    });
  };

  return (
    <div className="space-y-4">
      {/* First-time help tip - only show for new users */}
      {isFirstTimeUser && (
        <HelpTip>
          Starting with 4–6 emotions keeps your first deck focused. You can
          always create more decks with different combinations.
        </HelpTip>
      )}

      {/* Header with count and quick actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Select emotions for your deck
          </p>
          <p
            className={cn(
              "text-sm font-medium tabular-nums mt-1",
              selectedEmotions.length > 0 ? "text-coral" : "text-muted-foreground"
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {selectedEmotions.length} emotion{selectedEmotions.length !== 1 ? "s" : ""} selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => selectAll([...PRIMARY_EMOTIONS, ...SECONDARY_EMOTIONS, ...NUANCED_EMOTIONS])}
          >
            All ({PRIMARY_EMOTIONS.length + SECONDARY_EMOTIONS.length + NUANCED_EMOTIONS.length})
          </Button>
          {selectedEmotions.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onUpdate({ selectedEmotions: [] })}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible emotion sections */}
      <div className="space-y-3">
        <CollapsibleSection
          title="Primary Emotions"
          emotions={PRIMARY_EMOTIONS}
          selectedEmotions={selectedEmotions}
          defaultOpen={true}
          onToggleEmotion={toggleEmotion}
          onSelectAll={() => selectAll(PRIMARY_EMOTIONS)}
          onDeselectAll={() => deselectAll(PRIMARY_EMOTIONS)}
        />

        <CollapsibleSection
          title="Secondary Emotions"
          emotions={SECONDARY_EMOTIONS}
          selectedEmotions={selectedEmotions}
          defaultOpen={false}
          onToggleEmotion={toggleEmotion}
          onSelectAll={() => selectAll(SECONDARY_EMOTIONS)}
          onDeselectAll={() => deselectAll(SECONDARY_EMOTIONS)}
        />

        <CollapsibleSection
          title="Nuanced Emotions"
          emotions={NUANCED_EMOTIONS}
          selectedEmotions={selectedEmotions}
          defaultOpen={false}
          onToggleEmotion={toggleEmotion}
          onSelectAll={() => selectAll(NUANCED_EMOTIONS)}
          onDeselectAll={() => deselectAll(NUANCED_EMOTIONS)}
        />
      </div>

      {/* Custom emotions - collapsed by default */}
      <div className="border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          aria-expanded={showCustom}
          className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral"
        >
          <div className="flex items-center gap-3">
            {showCustom ? (
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
            <span className="font-medium">Custom Emotions</span>
            <span className="text-sm text-muted-foreground">
              (add your own)
            </span>
          </div>
          {customEmotions.length > 0 && (
            <span className="text-sm font-medium text-coral tabular-nums">
              {customEmotions.length} added
            </span>
          )}
        </button>

        {showCustom && (
          <div className="px-4 pb-4 pt-2 border-t bg-muted/20">
            <div className="flex gap-2 max-w-md">
              <Input
                type="text"
                placeholder="Type an emotion..."
                value={customEmotion}
                onChange={(e) => setCustomEmotion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomEmotion();
                  }
                }}
                autoComplete="off"
                name="custom-emotion"
                aria-label="Custom emotion name"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomEmotion}
                disabled={!customEmotion.trim()}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add
              </Button>
            </div>
            {customEmotions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {customEmotions.map((emotion) => (
                  <EmotionChip
                    key={emotion}
                    emotion={emotion}
                    isSelected={selectedEmotions.includes(emotion)}
                    onToggle={() => toggleEmotion(emotion)}
                    isCustom
                    onRemove={() => removeCustomEmotion(emotion)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
