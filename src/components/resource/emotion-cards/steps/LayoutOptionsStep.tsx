"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Grid2x2, Grid3x3, LayoutGrid, Type, FileText, ImageIcon, Frame, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTip } from "@/components/onboarding/HelpTip";
import { useGoogleFonts } from "@/lib/fonts";
import type { EmotionCardLayout, StyleFrames } from "@/types";
import type { WizardState } from "../EmotionCardsWizard";
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
  const hasAnyFrames = frames && (frames.border || frames.textBacking || frames.fullCard);

  // Load fonts for preview
  const fontsToLoad = style
    ? [style.typography.headingFont, style.typography.bodyFont]
    : [];
  useGoogleFonts(fontsToLoad);

  // Style values for preview (with defaults)
  const previewColors = {
    primary: style?.colors.primary ?? "#FF6B6B",
    secondary: style?.colors.secondary ?? "#4ECDC4",
    background: style?.colors.background ?? "#FAFAFA",
    text: style?.colors.text ?? "#1A1A1A",
  };
  const previewTypography = {
    headingFont: style?.typography.headingFont ?? "system-ui",
  };

  const updateLayout = (updates: Partial<EmotionCardLayout>) => {
    onUpdate({
      layout: { ...layout, ...updates },
    });
  };

  const updateFrameUsage = (frameType: keyof NonNullable<EmotionCardLayout["useFrames"]>, enabled: boolean) => {
    updateLayout({
      useFrames: {
        ...layout.useFrames,
        [frameType]: enabled,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* First-time help tip - only show for new users */}
      {isFirstTimeUser && (
        <HelpTip>
          Most therapists like 6 cards per page. Go with 4 for younger kids who
          need larger cards, or 9 for a compact travel deck.
        </HelpTip>
      )}

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

      {/* Image generation options */}
      <section>
        <Label className="text-base font-medium mb-4 block">
          Image Style
        </Label>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={includeTextInImage}
              onCheckedChange={(checked) =>
                onUpdate({ includeTextInImage: checked === true })
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">Include emotion text in image</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Add the emotion word directly into the generated illustration. Leave unchecked for text-free images.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Frame options - only show if style has frames */}
      {hasAnyFrames && (
        <section>
          <Label className="text-base font-medium mb-4 block">
            Decorative Frames
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Add decorative elements from your style to enhance the cards.
          </p>
          <div className="space-y-4">
            {frames?.border && (
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={layout.useFrames?.border ?? false}
                  onCheckedChange={(checked) =>
                    updateFrameUsage("border", checked === true)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Frame className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium">Border frame</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wrap each card with a decorative border.
                  </p>
                </div>
              </label>
            )}

            {frames?.textBacking && (
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={layout.useFrames?.textBacking ?? false}
                  onCheckedChange={(checked) =>
                    updateFrameUsage("textBacking", checked === true)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Type className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium">Text backing</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Place a decorative shape behind the label text.
                  </p>
                </div>
              </label>
            )}

            {frames?.fullCard && (
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={layout.useFrames?.fullCard ?? false}
                  onCheckedChange={(checked) =>
                    updateFrameUsage("fullCard", checked === true)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium">Full card template</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use a complete trading card frame with built-in text area.
                  </p>
                </div>
              </label>
            )}
          </div>
        </section>
      )}

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
            {Array.from({ length: layout.cardsPerPage }).map((_, i) => {
              const hasContent = layout.showLabels || layout.showDescriptions;
              return (
              <div
                key={i}
                className="rounded-md overflow-hidden flex flex-col relative"
                style={{
                  backgroundColor: previewColors.background,
                  border: `1px solid ${previewColors.text}20`,
                }}
              >
                {/* Image placeholder - 75% height when content shown, 100% otherwise */}
                <div
                  className="w-full relative"
                  style={{
                    backgroundColor: previewColors.primary + "25",
                    height: hasContent ? "75%" : "100%",
                  }}
                />
                {/* Content area - 25% height */}
                {hasContent && (
                  <div
                    className="flex flex-col items-center justify-center p-1 relative"
                    style={{
                      borderTop: `1px solid ${previewColors.text}10`,
                      height: "25%",
                    }}
                  >
                    {/* Text backing indicator */}
                    {layout.useFrames?.textBacking && frames?.textBacking && (
                      <div
                        className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[60%] rounded-sm"
                        style={{ backgroundColor: previewColors.secondary + "40" }}
                      />
                    )}
                    {layout.showLabels && (
                      <div
                        className="text-[6px] sm:text-[7px] font-medium text-center truncate w-full px-0.5 relative z-10"
                        style={{
                          color: previewColors.text,
                          fontFamily: `"${previewTypography.headingFont}", system-ui`,
                        }}
                      >
                        Emotion
                      </div>
                    )}
                    {layout.showDescriptions && (
                      <div
                        className="w-2/3 h-1 rounded mt-0.5 relative z-10"
                        style={{ backgroundColor: previewColors.text + "30" }}
                      />
                    )}
                  </div>
                )}
                {/* Border frame indicator */}
                {layout.useFrames?.border && frames?.border && !layout.useFrames?.fullCard && (
                  <div
                    className="absolute inset-0 rounded-md pointer-events-none"
                    style={{
                      border: `2px solid ${previewColors.primary}`,
                      boxShadow: `inset 0 0 0 1px ${previewColors.background}`,
                    }}
                  />
                )}
                {/* Full card frame indicator (takes precedence) */}
                {layout.useFrames?.fullCard && frames?.fullCard && (
                  <div
                    className="absolute inset-0 rounded-md pointer-events-none"
                    style={{
                      border: `3px solid ${previewColors.primary}`,
                      background: `linear-gradient(to bottom, transparent 75%, ${previewColors.secondary}40 75%)`,
                    }}
                  />
                )}
              </div>
            );
            })}
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-3">
          A4 page layout preview
        </p>
      </section>
    </div>
  );
}
