"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGoogleFonts } from "@/lib/fonts";
import { getCardAspectRatio } from "@/lib/pdf";

interface CardPreviewProps {
  emotion: string;
  imageUrl: string | null;
  isGenerating: boolean;
  hasError: boolean;
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
  frameUrls?: {
    border?: string | null;
    textBacking?: string | null;
    fullCard?: string | null;
  };
  useFrames?: {
    border?: boolean;
    textBacking?: boolean;
    fullCard?: boolean;
  };
}

export function CardPreview({
  emotion,
  imageUrl,
  isGenerating,
  hasError,
  showLabel = true,
  showDescription = false,
  description,
  onRegenerate,
  cardsPerPage = 6,
  style,
  frameUrls,
  useFrames,
}: CardPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Load fonts if style is provided
  const fontsToLoad = style
    ? [style.typography.headingFont, style.typography.bodyFont]
    : [];
  useGoogleFonts(fontsToLoad);

  // Determine which frames to show
  const showFullCard = useFrames?.fullCard && frameUrls?.fullCard;
  // Border is disabled when fullCard is active (fullCard takes precedence)
  const showBorder = useFrames?.border && frameUrls?.border && !showFullCard;
  const showTextBacking =
    useFrames?.textBacking &&
    frameUrls?.textBacking &&
    (showLabel || showDescription) &&
    !showFullCard;

  // Style values with defaults
  const bgColor = style?.colors.background ?? "#FAFAFA";
  const textColor = style?.colors.text ?? "#1A1A1A";
  const headingFont = style?.typography.headingFont ?? "system-ui";
  const bodyFont = style?.typography.bodyFont ?? "system-ui";
  const accentColor = style?.colors.secondary ?? "#E8E8E8";

  // Calculate aspect ratio based on layout (matches PDF output)
  const hasContent = showLabel || showDescription;
  const cardAspectRatio = useMemo(
    () => getCardAspectRatio(cardsPerPage),
    [cardsPerPage],
  );
  // Image takes 75% of card height when content is shown, 100% otherwise
  const imageHeightPercent = hasContent ? 75 : 100;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl overflow-hidden transition-all duration-200",
        "border-2",
        isGenerating && "border-coral/40",
        hasError && "border-destructive/40",
        !isGenerating && !hasError && "border-border",
      )}
      style={{
        backgroundColor: bgColor,
        aspectRatio: cardAspectRatio,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div
        className="relative"
        style={{
          backgroundColor: accentColor + "30",
          height: `${imageHeightPercent}%`,
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

      {/* Content area (label/description) */}
      {hasContent && (
        <div
          className="relative flex flex-col justify-center items-center border-t"
          style={{
            backgroundColor: bgColor,
            borderColor: textColor + "15",
            height: "25%",
            top: "-10%",
          }}
        >
          {/* Text backing behind text - 2:1 aspect ratio */}
          {showTextBacking && (
            <div
              className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ aspectRatio: "2 / 1" }}
            >
              <Image
                src={frameUrls!.textBacking!}
                alt=""
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Text content */}
          <div className="relative text-center px-8">
            {showLabel && (
              <span
                className="font-semibold text-sm block leading-tight"
                style={{
                  color: textColor,
                  fontFamily: `"${headingFont}", system-ui, sans-serif`,
                }}
              >
                {emotion}
              </span>
            )}
            {showDescription && description && (
              <span
                className="text-xs mt-0.5 block leading-tight"
                style={{
                  color: textColor,
                  opacity: 0.7,
                  fontFamily: `"${bodyFont}", system-ui, sans-serif`,
                }}
              >
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Border frame overlay (on top of everything) */}
      {showBorder && (
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={frameUrls!.border!}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Full card template overlay (takes precedence over border) */}
      {showFullCard && (
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={frameUrls!.fullCard!}
            alt=""
            fill
            className="object-cover"
          />
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
