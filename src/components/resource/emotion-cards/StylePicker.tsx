"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { STYLE_PRESETS } from "@/lib/style-presets";
import { StylePreset } from "@/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StylePickerProps {
  selectedStyleId: Id<"styles"> | null;
  selectedPreset: StylePreset | null;
  onSelect: (styleId: Id<"styles"> | null, preset: StylePreset | null) => void;
  userId: Id<"users">;
}

// Visual treatments for each preset to make them feel distinct
const PRESET_VISUALS: Record<string, {
  pattern: string;
  vibe: string;
}> = {
  "Warm & Playful": {
    pattern: "radial-gradient(circle at 20% 80%, var(--accent) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--secondary) 0%, transparent 40%)",
    vibe: "Friendly & inviting",
  },
  "Calm & Minimal": {
    pattern: "linear-gradient(135deg, var(--bg) 0%, var(--accent) 100%)",
    vibe: "Peaceful & serene",
  },
  "Bold & Colorful": {
    pattern: "linear-gradient(45deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)",
    vibe: "Energetic & vibrant",
  },
  "Nature & Earthy": {
    pattern: "radial-gradient(ellipse at bottom, var(--accent) 0%, var(--bg) 60%)",
    vibe: "Grounded & organic",
  },
  "Whimsical Fantasy": {
    pattern: "radial-gradient(circle at 30% 70%, var(--accent) 0%, transparent 30%), radial-gradient(circle at 70% 30%, var(--secondary) 0%, transparent 25%), radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 50%)",
    vibe: "Magical & dreamy",
  },
};

export function StylePicker({
  selectedStyleId,
  selectedPreset,
  onSelect,
  userId,
}: StylePickerProps) {
  const userStyles = useQuery(api.styles.getUserStyles, { userId });

  return (
    <div className="space-y-8">
      {/* Preset Styles - Visual Cards */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Choose a Style
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedPreset?.name === preset.name && !selectedStyleId;
            const visuals = PRESET_VISUALS[preset.name];

            return (
              <button
                key={preset.name}
                onClick={() => onSelect(null, preset)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl transition-all text-left h-44",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                  isSelected
                    ? "ring-2 ring-coral ring-offset-2 scale-[1.02]"
                    : "hover:scale-[1.02] hover:shadow-lg"
                )}
                style={{
                  ["--primary" as string]: preset.colors.primary,
                  ["--secondary" as string]: preset.colors.secondary,
                  ["--accent" as string]: preset.colors.accent,
                  ["--bg" as string]: preset.colors.background,
                }}
              >
                {/* Background with style-specific pattern */}
                <div
                  className="absolute inset-0 opacity-90"
                  style={{
                    backgroundColor: preset.colors.background,
                    backgroundImage: visuals?.pattern,
                  }}
                />

                {/* Decorative shapes that reflect the style */}
                <div className="absolute inset-0 overflow-hidden">
                  {preset.name === "Warm & Playful" && (
                    <>
                      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-40" style={{ backgroundColor: preset.colors.primary }} />
                      <div className="absolute bottom-8 -left-6 w-16 h-16 rounded-full opacity-30" style={{ backgroundColor: preset.colors.secondary }} />
                    </>
                  )}
                  {preset.name === "Calm & Minimal" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 opacity-60" style={{ backgroundColor: preset.colors.primary }} />
                  )}
                  {preset.name === "Bold & Colorful" && (
                    <>
                      <div className="absolute top-4 right-4 w-8 h-8 rotate-45 opacity-50" style={{ backgroundColor: preset.colors.accent }} />
                      <div className="absolute bottom-4 left-8 w-6 h-6 opacity-40" style={{ backgroundColor: preset.colors.secondary }} />
                    </>
                  )}
                  {preset.name === "Nature & Earthy" && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <svg viewBox="0 0 100 20" className="w-full h-8 opacity-30" preserveAspectRatio="none">
                        <path d="M0 20 Q25 5 50 15 T100 10 L100 20 Z" fill={preset.colors.primary} />
                      </svg>
                    </div>
                  )}
                  {preset.name === "Whimsical Fantasy" && (
                    <>
                      <div className="absolute top-6 right-8 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: preset.colors.accent }} />
                      <div className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: preset.colors.secondary }} />
                      <div className="absolute bottom-12 left-12 w-2.5 h-2.5 rounded-full opacity-50" style={{ backgroundColor: preset.colors.primary }} />
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-4">
                  {/* Color swatches */}
                  <div className="flex gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg shadow-md border border-white/20"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded-lg shadow-md border border-white/20"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div
                      className="w-8 h-8 rounded-lg shadow-md border border-white/20"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>

                  <h4
                    className="font-semibold text-base"
                    style={{ color: preset.colors.text }}
                  >
                    {preset.name}
                  </h4>
                  <p
                    className="text-sm opacity-80"
                    style={{ color: preset.colors.text }}
                  >
                    {visuals?.vibe}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-coral rounded-full flex items-center justify-center shadow-lg">
                    <Check className="size-4 text-white" aria-hidden="true" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* User's Custom Styles */}
      {userStyles && userStyles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Your Custom Styles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStyles.map((style) => {
              const isSelected = selectedStyleId === style._id;
              return (
                <button
                  key={style._id}
                  onClick={() => onSelect(style._id, {
                    name: style.name,
                    colors: style.colors,
                    typography: style.typography,
                    illustrationStyle: style.illustrationStyle,
                  })}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl transition-all text-left h-36",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
                    isSelected
                      ? "ring-2 ring-teal ring-offset-2 scale-[1.02]"
                      : "hover:scale-[1.02] hover:shadow-lg"
                  )}
                  style={{ backgroundColor: style.colors.background }}
                >
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(135deg, ${style.colors.primary} 0%, ${style.colors.secondary} 100%)`
                    }}
                  />

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-4">
                    <div className="flex gap-1.5 mb-2">
                      <div
                        className="w-6 h-6 rounded-md shadow-sm border border-white/20"
                        style={{ backgroundColor: style.colors.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-md shadow-sm border border-white/20"
                        style={{ backgroundColor: style.colors.secondary }}
                      />
                      <div
                        className="w-6 h-6 rounded-md shadow-sm border border-white/20"
                        style={{ backgroundColor: style.colors.accent }}
                      />
                    </div>

                    <h4
                      className="font-medium text-sm"
                      style={{ color: style.colors.text }}
                    >
                      {style.name}
                    </h4>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-teal rounded-full flex items-center justify-center shadow-lg">
                      <Check className="size-3.5 text-white" aria-hidden="true" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
