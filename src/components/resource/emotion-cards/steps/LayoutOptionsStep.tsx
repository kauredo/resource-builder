"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Grid2x2, Grid3x3, LayoutGrid, Scissors, Type, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmotionCardLayout } from "@/types";
import type { WizardState } from "../EmotionCardsWizard";

interface LayoutOptionsStepProps {
  layout: EmotionCardLayout;
  onUpdate: (updates: Partial<WizardState>) => void;
}

const CARDS_PER_PAGE_OPTIONS = [
  {
    value: 4 as const,
    label: "4 cards",
    description: "Large cards, 2×2 grid",
    icon: Grid2x2,
  },
  {
    value: 6 as const,
    label: "6 cards",
    description: "Medium cards, 2×3 grid",
    icon: LayoutGrid,
  },
  {
    value: 9 as const,
    label: "9 cards",
    description: "Small cards, 3×3 grid",
    icon: Grid3x3,
  },
];

export function LayoutOptionsStep({ layout, onUpdate }: LayoutOptionsStepProps) {
  const updateLayout = (updates: Partial<EmotionCardLayout>) => {
    onUpdate({
      layout: { ...layout, ...updates },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground">
          Configure how your emotion cards will be laid out when printed.
        </p>
      </div>

      {/* Cards per page */}
      <section>
        <Label className="text-base font-medium mb-4 block">
          Cards Per Page
        </Label>
        <RadioGroup
          value={String(layout.cardsPerPage)}
          onValueChange={(value) =>
            updateLayout({ cardsPerPage: Number(value) as 4 | 6 | 9 })
          }
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {CARDS_PER_PAGE_OPTIONS.map((option) => {
            const isSelected = layout.cardsPerPage === option.value;
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                  "hover:border-coral/40 hover:bg-coral/5",
                  "focus-within:ring-2 focus-within:ring-coral focus-within:ring-offset-2",
                  isSelected
                    ? "border-coral bg-coral/5"
                    : "border-border bg-card"
                )}
              >
                <RadioGroupItem
                  value={String(option.value)}
                  className="sr-only"
                />
                <Icon
                  className={cn(
                    "size-8 mb-2",
                    isSelected ? "text-coral" : "text-muted-foreground"
                  )}
                  aria-hidden="true"
                />
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </label>
            );
          })}
        </RadioGroup>
      </section>

      {/* Display options */}
      <section>
        <Label className="text-base font-medium mb-4 block">
          Card Content
        </Label>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={layout.showLabels}
              onCheckedChange={(checked) =>
                updateLayout({ showLabels: checked === true })
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Type className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">Show emotion labels</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Display the emotion name on each card.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={layout.showDescriptions}
              onCheckedChange={(checked) =>
                updateLayout({ showDescriptions: checked === true })
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">Show descriptions</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Include a brief description of each emotion.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Preview */}
      <section className="pt-4 border-t">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Preview
        </h3>
        <div className="bg-muted/50 rounded-xl p-8 flex items-center justify-center">
          <div
            className="bg-white rounded-lg shadow-md border aspect-[210/297] w-64 sm:w-72"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${layout.cardsPerPage === 9 ? 3 : 2}, 1fr)`,
              gridTemplateRows: `repeat(${layout.cardsPerPage === 4 ? 2 : 3}, 1fr)`,
              gap: "6px",
              padding: "12px",
            }}
          >
            {Array.from({ length: layout.cardsPerPage }).map((_, i) => (
              <div
                key={i}
                className="rounded-md border border-dashed border-border/60 bg-muted/30 flex flex-col items-center justify-center p-1.5"
              >
                <div className="w-full aspect-square bg-coral/15 rounded mb-1.5" />
                {layout.showLabels && (
                  <div className="w-3/4 h-2 bg-muted rounded" />
                )}
                {layout.showDescriptions && (
                  <div className="w-2/3 h-1.5 bg-muted/70 rounded mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-3">
          A4 page layout preview
        </p>
      </section>
    </div>
  );
}
