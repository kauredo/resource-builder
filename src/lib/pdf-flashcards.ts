/**
 * Flashcard-specific PDF renderer.
 *
 * Front pages: image + front text below each card in a grid.
 * Back pages: back text centered in each cell, mirroring front grid positions.
 * Designed for double-sided printing.
 */

import { Document, Page, View, Image, Text, pdf } from "@react-pdf/renderer";
import { createElement, type ReactNode } from "react";
import { registerFont, getPDFFontFamily } from "./pdf-fonts";

export interface FlashcardsPDFInput {
  cards: Array<{ frontText: string; backText: string; imageUrl?: string }>;
  cardsPerPage?: 4 | 6 | 9;
  bodyFont?: string;
  headingFont?: string;
}

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 36;

function getGridDimensions(cardsPerPage: 4 | 6 | 9): { cols: number; rows: number } {
  switch (cardsPerPage) {
    case 4:
      return { cols: 2, rows: 2 };
    case 6:
      return { cols: 2, rows: 3 };
    case 9:
      return { cols: 3, rows: 3 };
  }
}

export async function generateFlashcardsPDF({
  cards,
  cardsPerPage = 6,
  bodyFont,
  headingFont,
}: FlashcardsPDFInput): Promise<Blob> {
  // Register fonts
  const bodyFamily = bodyFont ? (registerFont(bodyFont), getPDFFontFamily(bodyFont)) : "Helvetica";
  const headingFamily = headingFont ? (registerFont(headingFont), getPDFFontFamily(headingFont)) : "Helvetica-Bold";

  const { cols, rows } = getGridDimensions(cardsPerPage);
  const gap = 10;
  const usableWidth = A4_WIDTH - MARGIN * 2;
  const usableHeight = A4_HEIGHT - MARGIN * 2;
  const cardWidth = (usableWidth - gap * (cols - 1)) / cols;
  const cardHeight = (usableHeight - gap * (rows - 1)) / rows;

  const imageHeight = cardHeight * 0.72;
  const textHeight = cardHeight * 0.28;

  const frontFontSize = cardsPerPage === 9 ? 8 : cardsPerPage === 6 ? 10 : 12;
  const backFontSize = cardsPerPage === 9 ? 10 : cardsPerPage === 6 ? 13 : 16;

  const pages: ReactNode[] = [];

  for (let i = 0; i < cards.length; i += cardsPerPage) {
    const pageCards = cards.slice(i, i + cardsPerPage);

    // Front page
    const frontElements = pageCards.map((card, idx) => {
      const children: ReactNode[] = [];

      // Image area
      if (card.imageUrl) {
        children.push(
          createElement(Image, {
            key: "img",
            src: card.imageUrl,
            style: {
              width: cardWidth,
              height: imageHeight,
              objectFit: "contain",
            },
          }),
        );
      } else {
        children.push(
          createElement(
            View,
            {
              key: "placeholder",
              style: {
                width: cardWidth,
                height: imageHeight,
                backgroundColor: "#F0F0F0",
                alignItems: "center",
                justifyContent: "center",
              },
            },
            createElement(Text, { style: { fontSize: 9, color: "#999" } }, "No image"),
          ),
        );
      }

      // Front text area
      children.push(
        createElement(
          View,
          {
            key: "text",
            style: {
              width: cardWidth,
              height: textHeight,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 6,
            },
          },
          createElement(
            Text,
            {
              style: {
                fontSize: frontFontSize,
                fontFamily: bodyFamily,
                fontWeight: 600,
                textAlign: "center",
                color: "#1A1A1A",
              },
            },
            card.frontText,
          ),
        ),
      );

      return createElement(
        View,
        {
          key: `front-${idx}`,
          style: {
            width: cardWidth,
            height: cardHeight,
            overflow: "hidden",
            borderRadius: 6,
            border: "1px solid #E0E0E0",
          },
        },
        ...children,
      );
    });

    pages.push(
      createElement(
        Page,
        { key: `front-${i}`, size: "A4", style: { padding: MARGIN } },
        createElement(
          View,
          {
            style: {
              flexDirection: "row",
              flexWrap: "wrap",
              gap,
              width: usableWidth,
              height: usableHeight,
            },
          },
          ...frontElements,
        ),
      ),
    );

    // Back page — reverse column order per row for double-sided printing
    const backElements: ReactNode[] = [];
    for (let row = 0; row < rows; row++) {
      const rowCards: typeof pageCards = [];
      for (let col = 0; col < cols; col++) {
        const srcIdx = row * cols + col;
        if (srcIdx < pageCards.length) {
          rowCards.push(pageCards[srcIdx]);
        }
      }
      // Reverse columns so backs align when flipped on long edge
      rowCards.reverse();
      for (const card of rowCards) {
        backElements.push(
          createElement(
            View,
            {
              key: `back-${backElements.length}`,
              style: {
                width: cardWidth,
                height: cardHeight,
                overflow: "hidden",
                borderRadius: 6,
                border: "1px solid #E0E0E0",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
                backgroundColor: "#FAFAFA",
              },
            },
            createElement(
              Text,
              {
                style: {
                  fontSize: backFontSize,
                  fontFamily: headingFamily,
                  fontWeight: 700,
                  textAlign: "center",
                  color: "#1A1A1A",
                },
              },
              card.backText,
            ),
          ),
        );
      }
    }

    pages.push(
      createElement(
        Page,
        { key: `back-${i}`, size: "A4", style: { padding: MARGIN } },
        createElement(
          View,
          {
            style: {
              flexDirection: "row",
              flexWrap: "wrap",
              gap,
              width: usableWidth,
              height: usableHeight,
            },
          },
          ...backElements,
        ),
      ),
    );
  }

  const document = createElement(Document, {}, ...pages);
  return await pdf(document).toBlob();
}
