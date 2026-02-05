"use client";

import { Frame } from "lucide-react";
import { useGoogleFonts } from "@/lib/fonts";
import type { StylePreset } from "@/types";

interface StyleContextBarProps {
  style: StylePreset;
  frameCount?: number;
  className?: string;
}

/**
 * Displays current style context throughout the wizard.
 * Shows color swatches, style name, fonts, and frame count.
 */
export function StyleContextBar({
  style,
  frameCount = 0,
  className = "",
}: StyleContextBarProps) {
  // Load fonts for the typography display
  useGoogleFonts([style.typography.headingFont, style.typography.bodyFont]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/30 border border-border/50 ${className}`}
    >
      {/* Color swatches */}
      <div className="flex gap-1" role="img" aria-label="Style colors">
        {[style.colors.primary, style.colors.secondary, style.colors.accent].map(
          (color, i) => (
            <div
              key={i}
              className="size-4 rounded shadow-sm ring-1 ring-black/5"
              style={{ backgroundColor: color }}
            />
          )
        )}
      </div>

      {/* Style name + fonts */}
      <div className="text-sm flex-1 min-w-0">
        <span className="font-medium truncate">{style.name}</span>
        <span className="text-muted-foreground ml-1.5 hidden sm:inline">
          · {style.typography.headingFont} / {style.typography.bodyFont}
        </span>
      </div>

      {/* Frame count badge */}
      {frameCount > 0 && (
        <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
          <Frame className="size-3" aria-hidden="true" />
          {frameCount}
        </span>
      )}
    </div>
  );
}
