"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { StylePreset } from "@/types";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StylePickerProps {
  selectedStyleId: Id<"styles"> | null;
  selectedPreset: StylePreset | null;
  onSelect: (styleId: Id<"styles"> | null, preset: StylePreset | null) => void;
  userId: Id<"users">;
}

/**
 * Reusable style option card - matches the design of StyleCard component
 * Shows color bar, typography preview, and selection state
 */
function StyleOption({
  style,
  isSelected,
  onSelect,
  accentColor = "coral",
  displayName,
  badge,
}: {
  style: {
    _id: Id<"styles">;
    name: string;
    isPreset: boolean;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
    };
    illustrationStyle: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  accentColor?: "coral" | "teal";
  displayName?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        "group block text-left rounded-lg cursor-pointer border border-transparent",
        "transition-colors duration-150 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        accentColor === "coral" ? "focus-visible:ring-coral" : "focus-visible:ring-teal",
        isSelected
          ? accentColor === "coral"
            ? "ring-2 ring-coral ring-offset-2"
            : "ring-2 ring-teal ring-offset-2"
          : "hover:border-foreground/15 hover:bg-muted/20"
      )}
    >
      {/* Color bar - the palette at a glance */}
      <div className="flex h-3 rounded-t-lg overflow-hidden">
        <div className="flex-1" style={{ backgroundColor: style.colors.primary }} />
        <div className="flex-1" style={{ backgroundColor: style.colors.secondary }} />
        <div className="flex-1" style={{ backgroundColor: style.colors.accent }} />
        <div className="flex-1" style={{ backgroundColor: style.colors.text }} />
        <div className="flex-1" style={{ backgroundColor: style.colors.background }} />
      </div>

      {/* Card body */}
      <div
        className="relative px-4 py-4 rounded-b-lg border border-t-0 border-border/50"
        style={{ backgroundColor: style.colors.background }}
      >
        {/* Typography preview */}
        <p
          className="text-base font-medium leading-snug"
          style={{
            fontFamily: `"${style.typography.headingFont}", system-ui, sans-serif`,
            color: style.colors.text,
          }}
        >
          Feelings can be
        </p>
        <p
          className="text-sm mt-0.5"
          style={{
            fontFamily: `"${style.typography.bodyFont}", system-ui, sans-serif`,
            color: style.colors.text,
            opacity: 0.7,
          }}
        >
          expressed in many ways
        </p>

        {/* Style name and badges */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
          <span
            className="text-sm font-medium"
            style={{ color: style.colors.text }}
          >
            {displayName ?? style.name}
          </span>
          <div className="flex items-center gap-2">
            {badge && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `color-mix(in oklch, ${style.colors.text} 8%, transparent)`,
                  color: style.colors.text,
                }}
              >
                {badge}
              </span>
            )}
            {style.isPreset && (
              <Lock
                className="size-3.5 opacity-50"
                style={{ color: style.colors.text }}
                aria-label="Preset style"
              />
            )}
            {isSelected && (
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  accentColor === "coral" ? "bg-coral" : "bg-teal"
                )}
              >
                <Check className="size-3 text-white" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function StylePicker({
  selectedStyleId,
  selectedPreset,
  onSelect,
  userId,
}: StylePickerProps) {
  // Use the same database styles as the /dashboard/styles page
  const userStyles = useQuery(api.styles.getUserStyles, { userId });

  // Split into presets and custom styles
  const presetStyles = userStyles?.filter((s) => s.isPreset) ?? [];
  const customStyles = userStyles?.filter((s) => !s.isPreset) ?? [];
  const sortedPresets = [...presetStyles].sort((a, b) => {
    const aIsNeutral = a.name.toLowerCase().includes("neutral");
    const bIsNeutral = b.name.toLowerCase().includes("neutral");
    if (aIsNeutral && !bIsNeutral) return -1;
    if (!aIsNeutral && bIsNeutral) return 1;
    return a.name.localeCompare(b.name);
  });

  // Loading state
  if (userStyles === undefined) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <div className="h-3 bg-muted animate-pulse motion-reduce:animate-none" />
                <div className="h-28 bg-muted/50 animate-pulse motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Preset Styles - from database, same as /dashboard/styles */}
      {presetStyles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Preset Styles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPresets.map((style) => (
              <StyleOption
                key={style._id}
                style={style}
                isSelected={selectedStyleId === style._id}
                displayName={
                  style.name.toLowerCase().includes("neutral")
                    ? "No style"
                    : undefined
                }
                badge={
                  style.name.toLowerCase().includes("neutral")
                    ? "Neutral"
                    : undefined
                }
                onSelect={() =>
                  onSelect(style._id, {
                    name: style.name,
                    colors: style.colors,
                    typography: style.typography,
                    illustrationStyle: style.illustrationStyle,
                  })
                }
                accentColor="coral"
              />
            ))}
          </div>
        </div>
      )}

      {/* User's Custom Styles */}
      {customStyles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Your Custom Styles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customStyles.map((style) => (
              <StyleOption
                key={style._id}
                style={style}
                isSelected={selectedStyleId === style._id}
                onSelect={() =>
                  onSelect(style._id, {
                    name: style.name,
                    colors: style.colors,
                    typography: style.typography,
                    illustrationStyle: style.illustrationStyle,
                  })
                }
                accentColor="teal"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state - no styles at all */}
      {presetStyles.length === 0 && customStyles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No styles available. Visit the Styles page to create one.</p>
        </div>
      )}
    </div>
  );
}
