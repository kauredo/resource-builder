"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  Type,
  FileText,
  ImageIcon,
  Frame,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTip } from "@/components/onboarding/HelpTip";
import type { EmotionCardLayout, StyleFrames } from "@/types";
import type { WizardState } from "../use-emotion-cards-wizard";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface LayoutOptionsStepProps {
  layout: EmotionCardLayout;
  includeTextInImage: boolean;
  onUpdate: (updates: Partial<WizardState>) => void;
  isFirstTimeUser?: boolean;
  styleId?: Id<"styles"> | null;
}

const CARDS_PER_PAGE_OPTIONS = [
  {
    value: 4 as const,
    label: "4 cards",
    description: "Large, 2×2",
    icon: Grid2x2,
  },
  {
    value: 6 as const,
    label: "6 cards",
    description: "Medium, 2×3",
    icon: LayoutGrid,
  },
  {
    value: 9 as const,
    label: "9 cards",
    description: "Small, 3×3",
    icon: Grid3x3,
  },
];

export function LayoutOptionsStep({
  layout,
  includeTextInImage,
  onUpdate,
  isFirstTimeUser = true,
  styleId,
}: LayoutOptionsStepProps) {
  // Query style with frames if styleId is provided
  const style = useQuery(
    api.styles.getStyleWithFrameUrls,
    styleId ? { styleId } : "skip"
  );

  const frames = style?.frames as StyleFrames | undefined;
  const hasAnyFrames = frames && (frames.border || frames.fullCard);

  const updateLayout = (updates: Partial<EmotionCardLayout>) => {
    onUpdate({
      layout: { ...layout, ...updates },
    });
  };

  const updateFrameUsage = (
    frameType: keyof NonNullable<EmotionCardLayout["useFrames"]>,
    enabled: boolean
  ) => {
    updateLayout({
      useFrames: {
        ...layout.useFrames,
        [frameType]: enabled,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* First-time help tip */}
      {isFirstTimeUser && (
        <HelpTip>
          Most therapists like 6 cards per page. Go with 4 for younger kids who
          need larger cards, or 9 for a compact travel deck.
        </HelpTip>
      )}

      {/* Cards per page - compact inline options */}
      <section>
        <Label className="text-base font-medium mb-3 block">
          Cards Per Page
        </Label>
        <RadioGroup
          value={String(layout.cardsPerPage)}
          onValueChange={(value) =>
            updateLayout({ cardsPerPage: Number(value) as 4 | 6 | 9 })
          }
          className="flex flex-wrap gap-2"
        >
          {CARDS_PER_PAGE_OPTIONS.map((option) => {
            const isSelected = layout.cardsPerPage === option.value;
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all",
                  "hover:border-coral/40",
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
                    "size-5",
                    isSelected ? "text-coral" : "text-muted-foreground"
                  )}
                  aria-hidden="true"
                />
                <div>
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({option.description})
                  </span>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </section>

      {/* Display options */}
      <section>
        <Label className="text-base font-medium mb-3 block">Card Content</Label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={layout.showLabels}
              onCheckedChange={(checked) =>
                updateLayout({ showLabels: checked === true })
              }
            />
            <div className="flex items-center gap-2">
              <Type
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm">Show emotion labels</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={layout.showDescriptions}
              onCheckedChange={(checked) =>
                updateLayout({ showDescriptions: checked === true })
              }
            />
            <div className="flex items-center gap-2">
              <FileText
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm">Show descriptions</span>
            </div>
          </label>
        </div>
      </section>

      {/* Image generation options */}
      <section>
        <Label className="text-base font-medium mb-3 block">Image Style</Label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={includeTextInImage}
            onCheckedChange={(checked) =>
              onUpdate({ includeTextInImage: checked === true })
            }
          />
          <div className="flex items-center gap-2">
            <ImageIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm">Include emotion text in image</span>
          </div>
        </label>
        <p className="text-xs text-muted-foreground mt-1.5 ml-7">
          Adds the emotion word directly into the generated illustration.
        </p>
      </section>

      {/* Frame options - only show if style has frames */}
      {hasAnyFrames && (
        <section>
          <Label className="text-base font-medium mb-3 block">
            Decorative Frames
          </Label>
          <div className="space-y-3">
            {frames?.border && (
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={layout.useFrames?.border ?? false}
                  onCheckedChange={(checked) =>
                    updateFrameUsage("border", checked === true)
                  }
                />
                <div className="flex items-center gap-2">
                  <Frame
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-sm">Border frame</span>
                </div>
              </label>
            )}

            {frames?.fullCard && (
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={layout.useFrames?.fullCard ?? false}
                  onCheckedChange={(checked) =>
                    updateFrameUsage("fullCard", checked === true)
                  }
                />
                <div className="flex items-center gap-2">
                  <Layers
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-sm">Full card template</span>
                </div>
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Preview updates in the sidebar as you toggle options.
          </p>
        </section>
      )}

      {/* Compact page layout preview */}
      <section className="pt-4 border-t">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Page Layout
        </h3>
        <div className="flex justify-center">
          <div
            className="bg-white rounded border shadow-sm w-32 aspect-[210/297]"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${layout.cardsPerPage === 9 ? 3 : 2}, 1fr)`,
              gridTemplateRows: `repeat(${layout.cardsPerPage === 4 ? 2 : 3}, 1fr)`,
              gap: "3px",
              padding: "6px",
            }}
          >
            {Array.from({ length: layout.cardsPerPage }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm bg-muted/50 border border-border/50"
              />
            ))}
          </div>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          {layout.cardsPerPage} cards per A4 page
        </p>
      </section>
    </div>
  );
}
