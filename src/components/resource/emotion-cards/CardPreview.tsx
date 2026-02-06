"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGoogleFonts } from "@/lib/fonts";
import { getCardAspectRatio } from "@/lib/pdf";
import { calculateCardLayout } from "@/lib/card-layout";
import type { CardLayoutSettings } from "@/types";

interface CardPreviewProps {
  emotion: string;
  imageUrl: string | null;
  isGenerating: boolean;
  hasError: boolean;
  variant?: "standard" | "compact";
  showLabel?: boolean;
  showDescription?: boolean;
  description?: string;
  onRegenerate?: () => void;
  // Layout for correct proportions
  cardsPerPage?: 4 | 6 | 9;
  // Style integration
  style?: {
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
  };
  // Card layout settings from style
  cardLayout?: CardLayoutSettings;
  frameUrls?: {
    border?: string | null;
    fullCard?: string | null;
  };
  useFrames?: {
    border?: boolean;
    fullCard?: boolean;
  };
}

export function CardPreview({
  emotion,
  imageUrl,
  isGenerating,
  hasError,
  variant = "standard",
  showLabel = true,
  showDescription = false,
  description,
  onRegenerate,
  cardsPerPage = 6,
  style,
  cardLayout,
  frameUrls,
  useFrames,
}: CardPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Load fonts if style is provided
  const fontsToLoad = style
    ? [style.typography.headingFont, style.typography.bodyFont]
    : [];
  useGoogleFonts(fontsToLoad);

  // Use shared layout calculation for consistency
  const cardDimensions = useMemo(
    () => calculateCardLayout(cardLayout, showLabel, showDescription),
    [cardLayout, showLabel, showDescription],
  );

  // Determine which frames to show
  const showFullCard = useFrames?.fullCard && frameUrls?.fullCard;
  // Border is disabled when fullCard is active (fullCard takes precedence)
  const showBorder = useFrames?.border && frameUrls?.border && !showFullCard;

  // Style values with defaults
  const bgColor = style?.colors.background ?? "#FAFAFA";
  const textColor = style?.colors.text ?? "#1A1A1A";
  const headingFont = style?.typography.headingFont ?? "system-ui";
  const bodyFont = style?.typography.bodyFont ?? "system-ui";
  const accentColor = style?.colors.secondary ?? "#E8E8E8";

  // Calculate aspect ratio based on layout (matches PDF output)
  const cardAspectRatio = useMemo(
    () => getCardAspectRatio(cardsPerPage),
    [cardsPerPage],
  );

  // Match PDF font sizing for consistency
  const baseLabelSize =
    cardsPerPage === 9 ? 10 : cardsPerPage === 6 ? 12 : 14;
  const baseDescriptionSize =
    cardsPerPage === 9 ? 8 : cardsPerPage === 6 ? 9 : 10;
  const fontScale = variant === "compact" ? 0.75 : 1;
  const labelFontSize = Math.max(8, Math.round(baseLabelSize * fontScale));
  const descriptionFontSize = Math.max(
    7,
    Math.round(baseDescriptionSize * fontScale),
  );
  const textPaddingX = variant === "compact" ? 6 : 32;

  // CSS border from card layout settings
  const cssBorderWidth = cardDimensions.borderWidth || 2;
  const cssBorderColor = isGenerating
    ? "rgba(255, 107, 107, 0.4)" // coral/40
    : hasError
      ? "rgba(239, 68, 68, 0.4)" // destructive/40
      : cardDimensions.borderWidth
        ? cardDimensions.borderColor || textColor
        : "hsl(var(--border))";

  return (
    <div
      className="relative flex flex-col rounded-xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: bgColor,
        aspectRatio: cardAspectRatio,
        borderWidth: cssBorderWidth,
        borderStyle: "solid",
        borderColor: cssBorderColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div
        className="relative"
        style={{
          backgroundColor: accentColor + "30",
          height: `${cardDimensions.imageHeightPercent}%`,
        }}
      >
        {isGenerating ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            role="status"
            aria-label={`Generating ${emotion}`}
          >
            <Loader2
              className="size-8 text-coral animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">Generating...</span>
          </div>
        ) : hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <AlertCircle
              className="size-8 text-destructive"
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground text-center">
              Failed to generate
            </span>
          </div>
        ) : imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={`Illustration for ${emotion}`}
              fill
              className="object-cover"
            />
            {/* Regenerate overlay */}
            {onRegenerate && (
              <div
                className={cn(
                  "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200",
                  isHovered ? "opacity-100" : "opacity-0",
                )}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onRegenerate}
                  className="gap-1.5"
                  tabIndex={isHovered ? 0 : -1}
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Regenerate
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-sm"
              style={{ color: textColor, opacity: 0.5 }}
            >
              No image
            </span>
          </div>
        )}
      </div>

      {/* Content area (label/description) - z-20 to be above frames */}
      {cardDimensions.hasContent && (
        <div
          className="absolute inset-x-0 flex flex-col justify-center items-center z-20"
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
                background: `linear-gradient(to top, ${bgColor} 60%, transparent)`,
              }}
            />
          )}

          {/* Text content */}
          <div
            className="relative z-10 text-center"
            style={{ paddingLeft: textPaddingX, paddingRight: textPaddingX }}
          >
            {showLabel && (
              <span
                className="block leading-tight"
                style={{
                  color: textColor,
                  fontFamily: `"${headingFont}", system-ui, sans-serif`,
                  fontWeight: 700,
                  fontSize: labelFontSize,
                }}
              >
                {emotion}
              </span>
            )}
            {showDescription && description && (
              <span
                className="mt-0.5 block leading-tight"
                style={{
                  color: textColor,
                  opacity: 0.7,
                  fontFamily: `"${bodyFont}", system-ui, sans-serif`,
                  fontWeight: 400,
                  fontSize: descriptionFontSize,
                }}
              >
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Border frame overlay - z-10, stretch to fill card */}
      {showBorder && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <img src={frameUrls!.border!} alt="" className="w-full h-full" />
        </div>
      )}

      {/* Full card template overlay - z-10, stretch to fill card */}
      {showFullCard && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <img src={frameUrls!.fullCard!} alt="" className="w-full h-full" />
        </div>
      )}

      {/* Error retry button */}
      {hasError && onRegenerate && (
        <div className="p-3 border-t" style={{ borderColor: textColor + "15" }}>
          <Button
            size="sm"
            variant="outline"
            onClick={onRegenerate}
            className="w-full gap-1.5"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
