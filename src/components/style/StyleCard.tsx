"use client";

import Link from "next/link";
import { Lock, Users, FileStack } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";
import type { StyleFrames } from "@/types";
import { useGoogleFonts } from "@/lib/fonts";

interface StyleCardProps {
  id: Id<"styles">;
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
  frames?: StyleFrames;
  updatedAt?: number;
  characterCount?: number;
  resourceCount?: number;
}

export function StyleCard({
  id,
  name,
  isPreset,
  colors,
  typography,
  frames,
  updatedAt,
  characterCount,
  resourceCount,
}: StyleCardProps) {
  // Load Google Fonts for typography preview
  useGoogleFonts([typography.headingFont, typography.bodyFont]);

  const hasFrames = frames && (frames.border || frames.fullCard);
  const frameCount = [frames?.border, frames?.fullCard].filter(Boolean).length;

  return (
    <Link
      href={`/dashboard/styles/${id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded-lg"
    >
      <article>
        {/* Color bar - the palette at a glance */}
        <div className="flex h-3 rounded-t-lg overflow-hidden">
          <div className="flex-1" style={{ backgroundColor: colors.primary }} />
          <div
            className="flex-1"
            style={{ backgroundColor: colors.secondary }}
          />
          <div className="flex-1" style={{ backgroundColor: colors.accent }} />
          <div className="flex-1" style={{ backgroundColor: colors.text }} />
          <div
            className="flex-1"
            style={{ backgroundColor: colors.background }}
          />
        </div>

        {/* Card body */}
        <div
          className="relative px-4 py-5 rounded-b-lg border border-t-0 border-border/50 transition-colors duration-150 group-hover:border-border motion-reduce:transition-none"
          style={{ backgroundColor: colors.background }}
        >
          {/* Typography preview */}
          <p
            className="text-lg font-medium leading-snug"
            style={{
              fontFamily: `"${typography.headingFont}", system-ui, sans-serif`,
              color: colors.text,
            }}
          >
            {name}
          </p>
          <p
            className="text-sm mt-0.5"
            style={{
              fontFamily: `"${typography.bodyFont}", system-ui, sans-serif`,
              color: `color-mix(in oklch, ${colors.text} 70%, ${colors.background})`,
            }}
          >
            Feelings can be expressed in many ways
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-8">
            {isPreset && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `color-mix(in oklch, ${colors.text} 8%, transparent)`,
                  color: colors.text,
                }}
              >
                <Lock className="size-2.5" aria-hidden="true" />
                Preset
              </span>
            )}
            {hasFrames && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded tabular-nums"
                style={{
                  backgroundColor: `color-mix(in oklch, ${colors.primary} 12%, transparent)`,
                  color: colors.text,
                }}
              >
                {frameCount} frame{frameCount !== 1 ? "s" : ""}
              </span>
            )}
            {(characterCount ?? 0) > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded tabular-nums"
                style={{
                  backgroundColor: `color-mix(in oklch, ${colors.text} 6%, transparent)`,
                  color: `color-mix(in oklch, ${colors.text} 70%, ${colors.background})`,
                }}
              >
                <Users className="size-2.5" aria-hidden="true" />
                {characterCount}
              </span>
            )}
            {(resourceCount ?? 0) > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded tabular-nums"
                style={{
                  backgroundColor: `color-mix(in oklch, ${colors.text} 6%, transparent)`,
                  color: `color-mix(in oklch, ${colors.text} 70%, ${colors.background})`,
                }}
              >
                <FileStack className="size-2.5" aria-hidden="true" />
                {resourceCount}
              </span>
            )}
            {updatedAt && (
              <time
                dateTime={new Date(updatedAt).toISOString()}
                className="text-xs text-muted-foreground tabular-nums"
              >
                {formatRelativeDate(updatedAt)}
              </time>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
