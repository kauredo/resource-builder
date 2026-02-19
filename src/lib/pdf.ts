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
  pdf,
  Svg,
  Rect,
  StyleSheet,
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

function getOverlayGradientDataUrl(bgColor: string): string {
  const color = bgColor || "#FFFFFF";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="100" viewBox="0 0 1 100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
      <stop offset="60%" stop-color="${color}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1" height="100" fill="url(#g)"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Create styles for PDF
const createStyles = (
  options: PDFLayoutOptions,
  style: PDFStyleOptions = DEFAULT_STYLE,
) => {
  const dimensions = calculateCardDimensions(options);
  const headingFontFamily = getPDFFontFamily(style.typography.headingFont);
  const bodyFontFamily = getPDFFontFamily(style.typography.bodyFont);
  const cutLineOffset = 4;
  const cutLineWidth = dimensions.cardWidth + cutLineOffset * 2;
  const cutLineHeight = dimensions.cardHeight + cutLineOffset * 2;

  // Use shared layout calculation for consistency with web previews
  const cardDimensions = calculateCardLayout(
    options.cardLayout,
    options.showLabels,
    options.showDescriptions,
  );
  const borderColor = cardDimensions.borderColor || style.colors.text;

  // Convert percentages to actual heights for PDF positioning
  const imageHeightPercent = `${cardDimensions.imageHeightPercent}%`;
  const contentHeightPercent = cardDimensions.hasContent
    ? `${cardDimensions.contentHeightPercent}%`
    : "0%";
  const contentTopPercent = `${cardDimensions.contentTopPercent}%`;

  // Overlap is already accounted for in calculateCardLayout

  const styles = StyleSheet.create({
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
    cardWrapper: {
      width: dimensions.cardWidth,
      height: dimensions.cardHeight,
      position: "relative",
      overflow: "visible" as any,
    },
    card: {
      width: dimensions.cardWidth,
      height: dimensions.cardHeight,
      backgroundColor: "#FFFFFF",
      borderRadius: 8,
      overflow: "hidden",
      position: "relative",
    },
    cardBorderOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: dimensions.cardWidth,
      height: dimensions.cardHeight,
    },
    cardImageContainer: {
      width: "100%",
      height: imageHeightPercent,
      backgroundColor: "#FFFFFF",
      position: "relative",
    },
    cardImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    cardContent: {
      paddingLeft: 32,
      paddingRight: 32,
      height: contentHeightPercent,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      left: 0,
      right: 0,
      top: contentTopPercent,
      backgroundColor: "transparent",
    },
    // Overlay mode: content positioned absolutely over image with gradient backdrop
    cardContentOverlay: {
      paddingLeft: 32,
      paddingRight: 32,
      height: contentHeightPercent,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      left: 0,
      right: 0,
      top: contentTopPercent,
      backgroundColor: "transparent",
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
    cutLineBox: {
      position: "absolute",
      top: -cutLineOffset,
      left: -cutLineOffset,
      width: cutLineWidth,
      height: cutLineHeight,
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

  return {
    styles,
    overlayGradientSrc: getOverlayGradientDataUrl(style.colors.background),
    cutLineWidth,
    cutLineHeight,
    cardWidth: dimensions.cardWidth,
    cardHeight: dimensions.cardHeight,
    borderColor,
  };
};

// Emotion Card component
function EmotionCard({
  card,
  styles,
  options,
  frames,
  overlayGradientSrc,
  cutLineWidth,
  cutLineHeight,
  cardWidth,
  cardHeight,
  borderColor,
}: {
  card: EmotionCardData;
  styles: ReturnType<typeof createStyles>["styles"];
  options: PDFLayoutOptions;
  frames?: PDFFrameOptions;
  overlayGradientSrc?: string;
  cutLineWidth: number;
  cutLineHeight: number;
  cardWidth: number;
  cardHeight: number;
  borderColor: string;
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

  const borderWidth = cardDimensions.borderWidth ?? 0;
  const borderRadius = 8;

  const overlayGradient =
    cardDimensions.isOverlay && overlayGradientSrc ? overlayGradientSrc : null;

  return createElement(
    View,
    { style: styles.cardWrapper },
    options.showCutLines &&
      createElement(
        View,
        { style: styles.cutLineBox },
        createElement(
          Svg,
          { width: cutLineWidth, height: cutLineHeight },
          createElement(Rect, {
            x: 0.5,
            y: 0.5,
            width: cutLineWidth - 1,
            height: cutLineHeight - 1,
            stroke: "#C8C8C8",
            strokeWidth: 1,
            strokeDasharray: "4 3",
            fill: "none",
          }),
        ),
      ),
    createElement(
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
      // Border/full card overlays (above image, below text)
      borderWidth > 0 &&
        createElement(
          View,
          { style: styles.cardBorderOverlay },
          createElement(
            Svg,
            { width: cardWidth, height: cardHeight },
            createElement(Rect, {
              x: borderWidth / 2,
              y: borderWidth / 2,
              width: cardWidth - borderWidth,
              height: cardHeight - borderWidth,
              stroke: borderColor,
              strokeWidth: borderWidth,
              fill: "none",
              rx: borderRadius,
              ry: borderRadius,
            }),
          ),
        ),
      showBorder &&
        createElement(Image, {
          src: frames!.borderUrl,
          style: styles.frameBorder,
        }),
      showFullCard &&
        createElement(Image, {
          src: frames!.fullCardUrl,
          style: styles.frameBorder,
        }),
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
          // Gradient backdrop for overlay mode (matches CardPreview)
          cardDimensions.isOverlay &&
            overlayGradient &&
            createElement(Image, {
              src: overlayGradient,
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            }),
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
    ),
  );
}

// PDF Page component
function CardPage({
  cards,
  styles,
  options,
  frames,
  overlayGradientSrc,
  cutLineWidth,
  cutLineHeight,
  cardWidth,
  cardHeight,
  borderColor,
}: {
  cards: EmotionCardData[];
  styles: ReturnType<typeof createStyles>["styles"];
  options: PDFLayoutOptions;
  frames?: PDFFrameOptions;
  overlayGradientSrc?: string;
  cutLineWidth: number;
  cutLineHeight: number;
  cardWidth: number;
  cardHeight: number;
  borderColor: string;
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
          overlayGradientSrc,
          cutLineWidth,
          cutLineHeight,
          cardWidth,
          cardHeight,
          borderColor,
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
  const { failed } = registerFonts([
    effectiveStyle.typography.headingFont,
    effectiveStyle.typography.bodyFont,
  ]);

  const resolvedStyle =
    failed.length > 0
      ? {
          ...effectiveStyle,
          typography: {
            headingFont: failed.includes(effectiveStyle.typography.headingFont)
              ? "Helvetica"
              : effectiveStyle.typography.headingFont,
            bodyFont: failed.includes(effectiveStyle.typography.bodyFont)
              ? "Helvetica"
              : effectiveStyle.typography.bodyFont,
          },
        }
      : effectiveStyle;

  const {
    styles,
    overlayGradientSrc,
    cutLineWidth,
    cutLineHeight,
    cardWidth,
    cardHeight,
    borderColor,
  } = createStyles(options, resolvedStyle);

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
        overlayGradientSrc,
        cutLineWidth,
        cutLineHeight,
        cardWidth,
        cardHeight,
        borderColor,
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
