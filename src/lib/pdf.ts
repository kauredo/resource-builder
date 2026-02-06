/**
 * PDF generation utilities using @react-pdf/renderer
 *
 * Generates print-ready PDFs for emotion card decks with customizable layouts.
 */

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { createElement } from "react";
import { getPDFFontFamily, registerFonts } from "./pdf-fonts";
import { calculateCardLayout, DEFAULT_CARD_LAYOUT } from "./card-layout";
import type { CardLayoutSettings } from "@/types";

export interface PDFLayoutOptions {
  cardsPerPage: 4 | 6 | 9;
  cardSize: "small" | "medium" | "large";
  showLabels: boolean;
  showDescriptions: boolean;
  showCutLines: boolean;
  useFrames?: {
    border?: boolean;
    fullCard?: boolean;
  };
  cardLayout?: CardLayoutSettings;
}

export interface PDFStyleOptions {
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
}

export interface PDFFrameOptions {
  borderUrl?: string;
  fullCardUrl?: string;
}

export interface EmotionCardData {
  emotion: string;
  description?: string;
  imageUrl?: string;
}

// Default style values for backward compatibility
const DEFAULT_STYLE: PDFStyleOptions = {
  colors: {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFE66D",
    background: "#FAFAFA",
    text: "#1A1A1A",
  },
  typography: {
    headingFont: "Helvetica",
    bodyFont: "Helvetica",
  },
};

/**
 * Calculate card dimensions based on layout options
 */
export function calculateCardDimensions(options: PDFLayoutOptions) {
  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const margin = 36; // 0.5 inch margin

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  let columns: number;
  let rows: number;

  switch (options.cardsPerPage) {
    case 4:
      columns = 2;
      rows = 2;
      break;
    case 6:
      columns = 2;
      rows = 3;
      break;
    case 9:
      columns = 3;
      rows = 3;
      break;
  }

  const gap = 12; // Gap between cards in points
  const cardWidth = (usableWidth - gap * (columns - 1)) / columns;
  const cardHeight = (usableHeight - gap * (rows - 1)) / rows;

  return {
    pageWidth,
    pageHeight,
    margin,
    cardWidth,
    cardHeight,
    columns,
    rows,
    gap,
  };
}

/**
 * Get the card aspect ratio for previews (width/height)
 * Returns the ratio to use in CSS aspect-ratio property
 */
export function getCardAspectRatio(cardsPerPage: 4 | 6 | 9): number {
  const dimensions = calculateCardDimensions({
    cardsPerPage,
    cardSize: "medium",
    showLabels: true,
    showDescriptions: false,
    showCutLines: false,
  });
  return dimensions.cardWidth / dimensions.cardHeight;
}

/**
 * Get the image area aspect ratio for previews (width/height)
 * The image takes up 75% of the card height when labels/descriptions are shown
 */
export function getImageAspectRatio(
  cardsPerPage: 4 | 6 | 9,
  hasContent: boolean,
): number {
  const dimensions = calculateCardDimensions({
    cardsPerPage,
    cardSize: "medium",
    showLabels: true,
    showDescriptions: false,
    showCutLines: false,
  });
  const imageHeight = hasContent
    ? dimensions.cardHeight * 0.75
    : dimensions.cardHeight;
  return dimensions.cardWidth / imageHeight;
}

// Create styles for PDF
const createStyles = (
  options: PDFLayoutOptions,
  style: PDFStyleOptions = DEFAULT_STYLE,
) => {
  const dimensions = calculateCardDimensions(options);
  const headingFontFamily = getPDFFontFamily(style.typography.headingFont);
  const bodyFontFamily = getPDFFontFamily(style.typography.bodyFont);

  // Use shared layout calculation for consistency with web previews
  const cardDimensions = calculateCardLayout(
    options.cardLayout,
    options.showLabels,
    options.showDescriptions,
  );

  // Convert percentages to actual heights for PDF positioning
  const imageHeightPercent = `${cardDimensions.imageHeightPercent}%`;
  const contentHeightPercent = cardDimensions.hasContent
    ? `${cardDimensions.contentHeightPercent}%`
    : "0%";

  // Calculate overlap from card layout settings
  const imageOverlap =
    options.cardLayout?.imageOverlap ?? DEFAULT_CARD_LAYOUT.imageOverlap;
  const contentOverlap = cardDimensions.hasContent
    ? dimensions.cardHeight * (imageOverlap / 100)
    : 0;

  return StyleSheet.create({
    page: {
      padding: dimensions.margin,
      backgroundColor: "#FFFFFF",
    },
    cardGrid: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: dimensions.gap,
    },
    card: {
      width: dimensions.cardWidth,
      height: dimensions.cardHeight,
      backgroundColor: style.colors.background,
      borderRadius: 8,
      overflow: "hidden",
      // CSS border from card layout settings, or default subtle border
      border: options.showCutLines
        ? "1px dashed #CCCCCC"
        : cardDimensions.borderWidth
          ? `${cardDimensions.borderWidth}px solid ${cardDimensions.borderColor || style.colors.text}`
          : `1px solid ${style.colors.text}20`,
      position: "relative",
    },
    cardImageContainer: {
      width: "100%",
      height: imageHeightPercent,
      backgroundColor: style.colors.background,
      position: "relative",
    },
    cardImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    cardContent: {
      padding: 8,
      height: contentHeightPercent,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: style.colors.background,
      position: "relative",
      // Pull content up to overlap with image (matches web CardPreview)
      marginTop: -contentOverlap,
    },
    // Overlay mode: content positioned absolutely over image with semi-transparent backdrop
    cardContentOverlay: {
      padding: 8,
      height: contentHeightPercent,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: style.colors.background + "E6", // 90% opacity
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    cardLabel: {
      fontSize:
        options.cardsPerPage === 9 ? 10 : options.cardsPerPage === 6 ? 12 : 14,
      fontFamily: headingFontFamily,
      fontWeight: "bold",
      color: style.colors.text,
      textAlign: "center",
    },
    cardDescription: {
      fontSize:
        options.cardsPerPage === 9 ? 8 : options.cardsPerPage === 6 ? 9 : 10,
      fontFamily: bodyFontFamily,
      color: style.colors.text,
      opacity: 0.7,
      textAlign: "center",
      marginTop: 2,
    },
    noImagePlaceholder: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: style.colors.secondary + "20",
    },
    placeholderText: {
      fontSize: 12,
      fontFamily: bodyFontFamily,
      color: style.colors.text,
      opacity: 0.5,
    },
    cutLinesHorizontal: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 1,
      borderTop: "1px dashed #CCCCCC",
    },
    cutLinesVertical: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 1,
      borderLeft: "1px dashed #CCCCCC",
    },
    // Frame overlay styles
    frameOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    frameBorder: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      // No objectFit - stretch to fill card (matches web previews)
    },
  });
};

// Emotion Card component
function EmotionCard({
  card,
  styles,
  options,
  frames,
}: {
  card: EmotionCardData;
  styles: ReturnType<typeof createStyles>;
  options: PDFLayoutOptions;
  frames?: PDFFrameOptions;
}) {
  // Use shared layout calculation for consistency
  const cardDimensions = calculateCardLayout(
    options.cardLayout,
    options.showLabels,
    options.showDescriptions,
  );

  const showFullCard = options.useFrames?.fullCard && frames?.fullCardUrl;
  // Border is disabled when fullCard is active (fullCard takes precedence)
  const showBorder =
    options.useFrames?.border && frames?.borderUrl && !showFullCard;

  return createElement(
    View,
    { style: styles.card },
    // Image container
    createElement(
      View,
      { style: styles.cardImageContainer },
      card.imageUrl
        ? createElement(Image, { src: card.imageUrl, style: styles.cardImage })
        : createElement(
            View,
            { style: styles.noImagePlaceholder },
            createElement(Text, { style: styles.placeholderText }, "No image"),
          ),
    ),
    // Content area (label/description)
    // Use overlay style when text position is "overlay" - positioned over image with backdrop
    cardDimensions.hasContent &&
      createElement(
        View,
        {
          style: cardDimensions.isOverlay
            ? styles.cardContentOverlay
            : styles.cardContent,
        },
        // Label text
        options.showLabels &&
          createElement(Text, { style: styles.cardLabel }, card.emotion),
        // Description text
        options.showDescriptions &&
          card.description &&
          createElement(
            Text,
            { style: styles.cardDescription },
            card.description,
          ),
      ),
    // Border overlay (on top of everything)
    showBorder &&
      createElement(Image, {
        src: frames!.borderUrl,
        style: styles.frameBorder,
      }),
    // Full card template overlay (takes precedence over border)
    showFullCard &&
      createElement(Image, {
        src: frames!.fullCardUrl,
        style: styles.frameBorder,
      }),
  );
}

// PDF Page component
function CardPage({
  cards,
  styles,
  options,
  frames,
}: {
  cards: EmotionCardData[];
  styles: ReturnType<typeof createStyles>;
  options: PDFLayoutOptions;
  frames?: PDFFrameOptions;
}) {
  return createElement(
    Page,
    { size: "A4", style: styles.page },
    createElement(
      View,
      { style: styles.cardGrid },
      cards.map((card, index) =>
        createElement(EmotionCard, {
          key: index,
          card,
          styles,
          options,
          frames,
        }),
      ),
    ),
  );
}

/**
 * Generate a PDF document for emotion cards
 *
 * @param cards - Array of emotion card data
 * @param options - Layout options for the PDF
 * @param style - Optional style options (colors, fonts)
 * @param frames - Optional frame asset URLs
 */
export async function generateEmotionCardsPDF(
  cards: EmotionCardData[],
  options: PDFLayoutOptions,
  style?: PDFStyleOptions,
  frames?: PDFFrameOptions,
): Promise<Blob> {
  // Merge with defaults
  const effectiveStyle = style
    ? {
        ...DEFAULT_STYLE,
        ...style,
        colors: { ...DEFAULT_STYLE.colors, ...style.colors },
        typography: { ...DEFAULT_STYLE.typography, ...style.typography },
      }
    : DEFAULT_STYLE;

  // Register fonts before creating styles
  registerFonts([
    effectiveStyle.typography.headingFont,
    effectiveStyle.typography.bodyFont,
  ]);

  const styles = createStyles(options, effectiveStyle);

  // Split cards into pages
  const pages: EmotionCardData[][] = [];
  for (let i = 0; i < cards.length; i += options.cardsPerPage) {
    pages.push(cards.slice(i, i + options.cardsPerPage));
  }

  const document = createElement(
    Document,
    {},
    pages.map((pageCards, pageIndex) =>
      createElement(CardPage, {
        key: pageIndex,
        cards: pageCards,
        styles,
        options,
        frames,
      }),
    ),
  );

  const blob = await pdf(document).toBlob();
  return blob;
}

/**
 * Generate PDF and return as data URL for preview
 */
export async function generateEmotionCardsPDFDataUrl(
  cards: EmotionCardData[],
  options: PDFLayoutOptions,
  style?: PDFStyleOptions,
  frames?: PDFFrameOptions,
): Promise<string> {
  const blob = await generateEmotionCardsPDF(cards, options, style, frames);
  return URL.createObjectURL(blob);
}
