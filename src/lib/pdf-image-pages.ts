/**
 * Unified PDF renderer for image-based resources.
 *
 * Supports two layout modes:
 * - full_page: One image per page with print-safe margins (36pt)
 * - grid: Multiple card images per page in a grid layout (4/6/9 per page)
 *
 * Text is baked into images during generation, so this renderer
 * only needs to place images — no text overlays.
 */

import { Document, Page, View, Image, pdf } from "@react-pdf/renderer";
import { createElement, type ReactNode } from "react";
import { createWatermarkOverlay } from "./pdf-watermark";

interface ImagePagesPDFInput {
  images: string[];
  layout: "full_page" | "grid";
  cardsPerPage?: 4 | 6 | 9;
  /** If true, insert a blank back-page after each front page (for double-sided printing) */
  interleaveBackPages?: boolean;
  watermark?: boolean;
}

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 36; // ~12.7mm print-safe margin

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

export async function generateImagePagesPDF({
  images,
  layout,
  cardsPerPage = 6,
  interleaveBackPages = false,
  watermark,
}: ImagePagesPDFInput): Promise<Blob> {
  const pages: ReactNode[] = [];

  if (layout === "full_page") {
    // One image per page
    for (const imageUrl of images) {
      pages.push(
        createElement(
          Page,
          {
            key: `page-${pages.length}`,
            size: "A4",
            style: { padding: MARGIN },
          },
          createElement(
            View,
            {
              style: {
                width: A4_WIDTH - MARGIN * 2,
                height: A4_HEIGHT - MARGIN * 2,
                overflow: "hidden",
              },
            },
            createElement(Image, {
              src: imageUrl,
              style: {
                width: "100%",
                height: "100%",
                objectFit: "contain",
              },
            }),
          ),
          watermark ? createWatermarkOverlay() : null,
        ),
      );
    }
  } else {
    // Grid layout
    const { cols, rows } = getGridDimensions(cardsPerPage);
    const gap = 8;
    const usableWidth = A4_WIDTH - MARGIN * 2;
    const usableHeight = A4_HEIGHT - MARGIN * 2;
    const cardWidth = (usableWidth - gap * (cols - 1)) / cols;
    const cardHeight = (usableHeight - gap * (rows - 1)) / rows;

    // Split images into page-sized chunks
    for (let i = 0; i < images.length; i += cardsPerPage) {
      const pageImages = images.slice(i, i + cardsPerPage);

      const cardElements = pageImages.map((imageUrl, idx) =>
        createElement(
          View,
          {
            key: `card-${idx}`,
            style: {
              width: cardWidth,
              height: cardHeight,
              overflow: "hidden",
              borderRadius: 4,
            },
          },
          createElement(Image, {
            src: imageUrl,
            style: {
              width: "100%",
              height: "100%",
              objectFit: "contain",
            },
          }),
        ),
      );

      pages.push(
        createElement(
          Page,
          {
            key: `page-${pages.length}`,
            size: "A4",
            style: { padding: MARGIN },
          },
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
            ...cardElements,
          ),
          watermark ? createWatermarkOverlay() : null,
        ),
      );

      // Insert blank back-page for double-sided printing
      if (interleaveBackPages) {
        pages.push(
          createElement(Page, {
            key: `back-${pages.length}`,
            size: "A4",
            style: { padding: MARGIN },
          }),
        );
      }
    }
  }

  const document = createElement(Document, {}, ...pages);
  return await pdf(document).toBlob();
}
