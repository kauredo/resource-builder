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

export interface PDFLayoutOptions {
  cardsPerPage: 4 | 6 | 9;
  cardSize: "small" | "medium" | "large";
  showLabels: boolean;
  showDescriptions: boolean;
  showCutLines: boolean;
}

export interface EmotionCardData {
  emotion: string;
  description?: string;
  imageUrl?: string;
}

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

// Create styles for PDF
const createStyles = (options: PDFLayoutOptions) => {
  const dimensions = calculateCardDimensions(options);

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
      backgroundColor: "#FAFAFA",
      borderRadius: 8,
      overflow: "hidden",
      border: options.showCutLines ? "1px dashed #CCCCCC" : "1px solid #E5E5E5",
    },
    cardImageContainer: {
      width: "100%",
      height: options.showLabels || options.showDescriptions ? "75%" : "100%",
      backgroundColor: "#F0F0F0",
    },
    cardImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    cardContent: {
      padding: 8,
      height: "25%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    cardLabel: {
      fontSize: options.cardsPerPage === 9 ? 10 : options.cardsPerPage === 6 ? 12 : 14,
      fontWeight: "bold",
      color: "#1A1A1A",
      textAlign: "center",
    },
    cardDescription: {
      fontSize: options.cardsPerPage === 9 ? 8 : options.cardsPerPage === 6 ? 9 : 10,
      color: "#666666",
      textAlign: "center",
      marginTop: 2,
    },
    noImagePlaceholder: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#E8E8E8",
    },
    placeholderText: {
      fontSize: 12,
      color: "#999999",
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
  });
};

// Emotion Card component
function EmotionCard({
  card,
  styles,
  options,
}: {
  card: EmotionCardData;
  styles: ReturnType<typeof createStyles>;
  options: PDFLayoutOptions;
}) {
  return createElement(
    View,
    { style: styles.card },
    createElement(
      View,
      { style: styles.cardImageContainer },
      card.imageUrl
        ? createElement(Image, { src: card.imageUrl, style: styles.cardImage })
        : createElement(
            View,
            { style: styles.noImagePlaceholder },
            createElement(Text, { style: styles.placeholderText }, "No image")
          )
    ),
    (options.showLabels || options.showDescriptions) &&
      createElement(
        View,
        { style: styles.cardContent },
        options.showLabels &&
          createElement(Text, { style: styles.cardLabel }, card.emotion),
        options.showDescriptions &&
          card.description &&
          createElement(Text, { style: styles.cardDescription }, card.description)
      )
  );
}

// PDF Page component
function CardPage({
  cards,
  styles,
  options,
}: {
  cards: EmotionCardData[];
  styles: ReturnType<typeof createStyles>;
  options: PDFLayoutOptions;
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
        })
      )
    )
  );
}

// Main PDF Document component
function EmotionCardsPDFDocument({
  cards,
  options,
}: {
  cards: EmotionCardData[];
  options: PDFLayoutOptions;
}) {
  const styles = createStyles(options);

  // Split cards into pages
  const pages: EmotionCardData[][] = [];
  for (let i = 0; i < cards.length; i += options.cardsPerPage) {
    pages.push(cards.slice(i, i + options.cardsPerPage));
  }

  return createElement(
    Document,
    null,
    pages.map((pageCards, pageIndex) =>
      createElement(CardPage, {
        key: pageIndex,
        cards: pageCards,
        styles,
        options,
      })
    )
  );
}

/**
 * Generate a PDF document for emotion cards
 */
export async function generateEmotionCardsPDF(
  cards: EmotionCardData[],
  options: PDFLayoutOptions
): Promise<Blob> {
  const styles = createStyles(options);

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
      })
    )
  );

  const blob = await pdf(document).toBlob();
  return blob;
}

/**
 * Generate PDF and return as data URL for preview
 */
export async function generateEmotionCardsPDFDataUrl(
  cards: EmotionCardData[],
  options: PDFLayoutOptions
): Promise<string> {
  const blob = await generateEmotionCardsPDF(cards, options);
  return URL.createObjectURL(blob);
}
