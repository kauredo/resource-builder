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

export interface PDFLayoutOptions {
  cardsPerPage: 4 | 6 | 9;
  cardSize: "small" | "medium" | "large";
  showLabels: boolean;
  showDescriptions: boolean;
  showCutLines: boolean;
  useFrames?: {
    border?: boolean;
    textBacking?: boolean;
    fullCard?: boolean;
  };
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
  textBackingUrl?: string;
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

  // Calculate content area height percentage based on what's shown
  const hasContent = options.showLabels || options.showDescriptions;
  const imageHeightPercent = hasContent ? "75%" : "100%";
  const contentHeightPercent = hasContent ? "25%" : "0%";
  // Content overlaps image by 10% of card height (matches web CardPreview's top: -10%)
  const contentOverlap = hasContent ? dimensions.cardHeight * 0.1 : 0;

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
      border: options.showCutLines
        ? "1px dashed #CCCCCC"
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
      objectFit: "cover",
    },
    // Text backing: 2:1 aspect ratio, centered in content area
    frameTextBacking: {
      position: "absolute",
      left: "10%",
      width: "80%",
      // Height calculated to maintain 2:1 ratio based on available width
      height: (dimensions.cardWidth * 0.8) / 4,
      objectFit: "contain",
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
  const showFullCard = options.useFrames?.fullCard && frames?.fullCardUrl;
  // Border is disabled when fullCard is active (fullCard takes precedence)
  const showBorder = options.useFrames?.border && frames?.borderUrl && !showFullCard;
  const showTextBacking =
    options.useFrames?.textBacking && frames?.textBackingUrl && !showFullCard;
  const hasContent = options.showLabels || options.showDescriptions;

  // Calculate frame positions (matches web CardPreview positioning)
  const dimensions = calculateCardDimensions(options);
  const textBackingHeight = (dimensions.cardWidth * 0.8) / 4; // 2:1 aspect ratio
  const contentHeight = dimensions.cardHeight * 0.25;

  // Content starts at 75% but overlaps image by 10% of card height (top: -10% in web)
  const contentOverlap = dimensions.cardHeight * 0.1;
  const effectiveContentTop = hasContent
    ? dimensions.cardHeight * 0.75 - contentOverlap
    : dimensions.cardHeight;

  // Position text backing centered in the overlapped content area
  const textBackingTop = effectiveContentTop + (contentHeight - textBackingHeight) / 2;

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
    hasContent &&
      createElement(
        View,
        { style: styles.cardContent },
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
    // Text backing (behind text, absolute positioned)
    showTextBacking &&
      createElement(Image, {
        src: frames!.textBackingUrl,
        style: {
          ...styles.frameTextBacking,
          top: textBackingTop,
        },
      }),
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
