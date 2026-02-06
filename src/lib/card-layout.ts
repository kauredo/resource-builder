/**
 * Shared card layout calculations for consistent rendering across
 * WizardPreview, CardPreview, StylePreview, and PDF generation.
 */

import type { CardLayoutSettings } from "@/types";

export interface CardLayoutDimensions {
  /** Image area height as percentage (0-100) */
  imageHeightPercent: number;
  /** Content area height as percentage (0-100) */
  contentHeightPercent: number;
  /** Content area top offset as percentage (negative for overlap) */
  contentTopPercent: number;
  /** Whether content area should be shown */
  hasContent: boolean;
  /** Whether text overlays the image (true) or has its own space (false) */
  isOverlay: boolean;
  /** The text position mode */
  textPosition: "bottom" | "overlay" | "integrated";
  /** CSS border width in pixels (0 = none) */
  borderWidth: number;
  /** CSS border color */
  borderColor: string | null;
}

/**
 * Default card layout values
 */
export const DEFAULT_CARD_LAYOUT = {
  textPosition: "bottom" as const,
  contentHeight: 25,
  imageOverlap: 11,
  borderWidth: 0,
  borderColor: null as string | null,
};

/**
 * Calculate card layout dimensions for rendering.
 * Use this in all card preview components and PDF generation for consistency.
 *
 * @param cardLayout - Optional card layout settings from style
 * @param showLabels - Whether labels are enabled
 * @param showDescriptions - Whether descriptions are enabled
 */
export function calculateCardLayout(
  cardLayout?: CardLayoutSettings,
  showLabels = true,
  showDescriptions = false
): CardLayoutDimensions {
  const textPosition = cardLayout?.textPosition ?? DEFAULT_CARD_LAYOUT.textPosition;
  const contentHeight = cardLayout?.contentHeight ?? DEFAULT_CARD_LAYOUT.contentHeight;
  const imageOverlap = cardLayout?.imageOverlap ?? DEFAULT_CARD_LAYOUT.imageOverlap;
  const borderWidth = cardLayout?.borderWidth ?? DEFAULT_CARD_LAYOUT.borderWidth;
  const borderColor = cardLayout?.borderColor ?? DEFAULT_CARD_LAYOUT.borderColor;

  // For "integrated" position, text is in the image - no separate content area
  const hasContent = textPosition !== "integrated" && (showLabels || showDescriptions);
  const isOverlay = textPosition === "overlay";

  if (!hasContent) {
    return {
      imageHeightPercent: 100,
      contentHeightPercent: 0,
      contentTopPercent: 100,
      hasContent: false,
      isOverlay: false,
      textPosition,
      borderWidth,
      borderColor,
    };
  }

  // For overlay mode: image takes full height, text floats over it
  if (isOverlay) {
    return {
      imageHeightPercent: 100,
      contentHeightPercent: contentHeight,
      contentTopPercent: 100 - contentHeight,
      hasContent: true,
      isOverlay: true,
      textPosition,
      borderWidth,
      borderColor,
    };
  }

  // For bottom mode: image extends down by overlap amount into content area
  // Content starts before image ends by overlap amount (creating overlap effect)
  const imageHeightPercent = 100 - contentHeight + imageOverlap;
  const contentTopPercent = 100 - contentHeight - imageOverlap;

  return {
    imageHeightPercent,
    contentHeightPercent: contentHeight,
    contentTopPercent,
    hasContent: true,
    isOverlay: false,
    textPosition,
    borderWidth,
    borderColor,
  };
}
