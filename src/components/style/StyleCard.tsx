"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
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
}

function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function StyleCard({
  id,
  name,
  isPreset,
  colors,
  typography,
  frames,
  updatedAt,
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
              color: colors.text,
              opacity: 0.7,
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
                  backgroundColor: colors.text + "12",
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
                  backgroundColor: colors.primary + "20",
                  color: colors.text,
                }}
              >
                {frameCount} frame{frameCount !== 1 ? "s" : ""}
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
