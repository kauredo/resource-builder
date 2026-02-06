"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useGoogleFonts } from "@/lib/fonts";
import { getCardAspectRatio } from "@/lib/pdf";
import { calculateCardLayout } from "@/lib/card-layout";
import type { EmotionCardLayout, CardLayoutSettings } from "@/types";

interface WizardPreviewProps {
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography?: {
    headingFont: string;
    bodyFont: string;
  };
  frameUrls?: {
    border?: string | null;
    fullCard?: string | null;
  };
  layout?: EmotionCardLayout;
  cardLayout?: CardLayoutSettings;
  generatedImageUrl?: string | null;
  emotion?: string;
}

// Fixed width, aspect ratio changes based on cards per page
const CARD_WIDTH = 160;

export function WizardPreview({
  colors,
  typography,
  frameUrls,
  layout,
  cardLayout,
  generatedImageUrl,
  emotion = "Happy",
}: WizardPreviewProps) {
  const fontsToLoad =
    typography?.headingFont && typography?.bodyFont
      ? [typography.headingFont, typography.bodyFont]
      : [];
  useGoogleFonts(fontsToLoad);

  const previewColors = {
    primary: colors?.primary ?? "#FF6B6B",
    secondary: colors?.secondary ?? "#4ECDC4",
    accent: colors?.accent ?? "#FFE66D",
    background: colors?.background ?? "#FAFAFA",
    text: colors?.text ?? "#2D3436",
  };

  const previewTypography = {
    headingFont: typography?.headingFont ?? "system-ui",
    bodyFont: typography?.bodyFont ?? "system-ui",
  };

  // Card aspect ratio based on cards per page (matches actual PDF output)
  const cardsPerPage = layout?.cardsPerPage ?? 6;
  const cardAspectRatio = useMemo(
    () => getCardAspectRatio(cardsPerPage),
    [cardsPerPage],
  );

  const showLabels = layout?.showLabels ?? true;
  const showDescriptions = layout?.showDescriptions ?? false;

  // Use shared layout calculation for consistency
  const cardDimensions = useMemo(
    () => calculateCardLayout(cardLayout, showLabels, showDescriptions),
    [cardLayout, showLabels, showDescriptions],
  );

  const useFullCard = layout?.useFrames?.fullCard && frameUrls?.fullCard;
  const useBorder =
    layout?.useFrames?.border && frameUrls?.border && !useFullCard;

  return (
    <div className="flex flex-col items-center">
      {/* Subtle label */}
      <span className="text-[11px] font-medium text-muted-foreground/70 mb-3">
        Your card
      </span>

      {/* Card with paper-like presence */}
      <div className="relative group">
        {/* Soft ambient shadow - creates depth without harsh edges */}
        <div
          className="absolute -inset-2 rounded-2xl opacity-[0.08] blur-xl transition-opacity duration-500 group-hover:opacity-[0.12]"
          style={{ backgroundColor: previewColors.primary }}
        />

        {/* The card itself */}
        <div
          className="relative rounded-lg overflow-hidden transition-all duration-300 ease-out group-hover:scale-[1.02]"
          style={{
            width: CARD_WIDTH,
            backgroundColor: previewColors.background,
            aspectRatio: cardAspectRatio,
            // CSS border from card layout settings
            borderWidth: cardDimensions.borderWidth || 1,
            borderStyle: "solid",
            borderColor: cardDimensions.borderWidth
              ? cardDimensions.borderColor || previewColors.text
              : `color-mix(in oklch, ${previewColors.text} 8%, transparent)`,
            boxShadow: `
              0 1px 2px rgba(0,0,0,0.04),
              0 4px 8px rgba(0,0,0,0.04)
            `,
          }}
        >
          {/* Image area */}
          <div
            className="absolute inset-x-0 top-0 overflow-hidden"
            style={{
              backgroundColor: `color-mix(in oklch, ${previewColors.secondary} 25%, ${previewColors.background})`,
              height: `${cardDimensions.imageHeightPercent}%`,
            }}
          >
            {generatedImageUrl ? (
              <Image
                src={generatedImageUrl}
                alt={emotion}
                fill
                className="object-cover"
              />
            ) : (
              /* Abstract placeholder - more sophisticated than smiley */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-14 h-14">
                  {/* Organic blob shape */}
                  <div
                    className="absolute inset-0 rounded-[40%_60%_55%_45%/55%_45%_60%_40%]"
                    style={{ backgroundColor: previewColors.primary }}
                  />
                  {/* Accent detail */}
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: previewColors.accent,
                      opacity: 0.9,
                    }}
                  />
                  {/* Secondary detail */}
                  <div
                    className="absolute bottom-0 left-0 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: previewColors.secondary,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Border frame overlay */}
          {useBorder && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <img src={frameUrls!.border!} alt="" className="w-full h-full" />
            </div>
          )}

          {/* Full card template overlay */}
          {useFullCard && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <img
                src={frameUrls!.fullCard!}
                alt=""
                className="w-full h-full"
              />
            </div>
          )}

          {/* Content area */}
          {cardDimensions.hasContent && (
            <div
              className="absolute inset-x-0 flex flex-col items-center justify-center z-20"
              style={{
                height: `${cardDimensions.contentHeightPercent}%`,
                bottom: 0,
                top: `${cardDimensions.contentTopPercent}%`,
              }}
            >
              {/* Overlay mode: semi-transparent backdrop */}
              {cardDimensions.isOverlay && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, ${previewColors.background} 60%, transparent)`,
                  }}
                />
              )}

              <div className="relative z-10 text-center px-3">
                {showLabels && (
                  <span
                    className="font-semibold text-sm block leading-tight"
                    style={{
                      color: previewColors.text,
                      fontFamily: `"${previewTypography.headingFont}", system-ui, sans-serif`,
                    }}
                  >
                    {emotion}
                  </span>
                )}
                {showDescriptions && (
                  <span
                    className="text-[10px] mt-0.5 block leading-tight"
                    style={{
                      color: previewColors.text,
                      opacity: 0.7,
                      fontFamily: `"${previewTypography.bodyFont}", system-ui, sans-serif`,
                    }}
                  >
                    A warm feeling
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color swatches - shows style at a glance */}
      <div className="flex items-center gap-1 mt-4">
        {[
          previewColors.primary,
          previewColors.secondary,
          previewColors.accent,
        ].map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full ring-1 ring-black/5"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
