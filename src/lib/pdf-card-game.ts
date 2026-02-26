/**
 * Template-based PDF generator for card games.
 *
 * Composes each card by layering:
 * 1. Background image (full card, objectFit: cover)
 * 2. Transparent icon PNG (centered, sized by iconScale)
 * 3. Primary text with simulated outline (multiple offset layers)
 * 4. Optional secondary text
 *
 * Card backs can be interleaved for double-sided printing.
 */

import {
  Document,
  Page,
  View,
  Image,
  Text,
  pdf,
} from "@react-pdf/renderer";
import { createElement, type ReactNode } from "react";
import { registerFont, getPDFFontFamily } from "./pdf-fonts";
import { createWatermarkOverlay } from "./pdf-watermark";
import type {
  CardGameContent,
  CardGameCardEntry,
  CardTextHAlign,
  CardTextVAlign,
  ShowTextMode,
} from "@/types";

interface CardGamePDFOptions {
  content: CardGameContent;
  /** Map of assetKey → image URL */
  assetMap: Map<string, string>;
  cardsPerPage?: 4 | 6 | 9;
  includeCardBacks?: boolean;
  watermark?: boolean;
}

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 36;

function getGridDimensions(cardsPerPage: 4 | 6 | 9) {
  switch (cardsPerPage) {
    case 4:
      return { cols: 2, rows: 2 };
    case 6:
      return { cols: 2, rows: 3 };
    case 9:
      return { cols: 3, rows: 3 };
  }
}

/** Convert hAlign to text alignment */
function toTextAlign(h: CardTextHAlign): "left" | "center" | "right" {
  return h;
}

/** Convert vAlign to positioning styles */
function toVerticalPosition(
  v: CardTextVAlign,
  cardHeight: number,
  isSecondary: boolean,
): { top?: number; bottom?: number } {
  if (isSecondary) {
    switch (v) {
      case "top":
        return { top: cardHeight * 0.28 };
      case "bottom":
        return { bottom: cardHeight * 0.05 };
      default:
        return { top: cardHeight * 0.6 };
    }
  }
  switch (v) {
    case "top":
      return { top: cardHeight * 0.12 };
    case "bottom":
      return { bottom: cardHeight * 0.12 };
    default:
      return { top: cardHeight * 0.4 };
  }
}

/**
 * Create text outline by rendering multiple offset copies in the outline color
 * behind the fill text. This simulates a stroke effect.
 */
function createOutlinedText(
  textContent: string,
  fontSize: number,
  fillColor: string,
  outlineColor: string,
  outlineWidth: number,
  textAlign: "left" | "center" | "right",
  fontFamily: string,
  fontWeight: number,
  cardWidth: number,
  verticalPos: { top?: number; bottom?: number },
): ReactNode[] {
  const elements: ReactNode[] = [];
  const hPadding = cardWidth * 0.08;

  const baseStyle = {
    position: "absolute" as const,
    left: hPadding,
    right: hPadding,
    ...verticalPos,
    fontSize,
    fontFamily,
    fontWeight,
    textAlign,
  };

  if (outlineWidth > 0) {
    // Generate offset positions for outline simulation
    const offsets = [
      [-outlineWidth, 0],
      [outlineWidth, 0],
      [0, -outlineWidth],
      [0, outlineWidth],
      [-outlineWidth, -outlineWidth],
      [outlineWidth, -outlineWidth],
      [-outlineWidth, outlineWidth],
      [outlineWidth, outlineWidth],
    ];

    offsets.forEach(([dx, dy], i) => {
      elements.push(
        createElement(
          Text,
          {
            key: `outline-${i}`,
            style: {
              ...baseStyle,
              color: outlineColor,
              transform: `translate(${dx}px, ${dy}px)`,
            },
          },
          textContent,
        ),
      );
    });
  }

  // Fill text on top
  elements.push(
    createElement(
      Text,
      {
        key: "fill",
        style: {
          ...baseStyle,
          color: fillColor,
        },
      },
      textContent,
    ),
  );

  return elements;
}

/** Check whether text should be rendered based on showText mode */
function shouldShowText(text: string, mode: ShowTextMode): boolean {
  if (mode === "all") return true;
  if (mode === "none") return false;
  // "numbers_only" — show if content is purely numeric
  return /^\d+$/.test(text.trim());
}

/**
 * Render a single card as a View with layered composition.
 */
function renderCard(
  card: CardGameCardEntry,
  content: CardGameContent,
  assetMap: Map<string, string>,
  cardWidth: number,
  cardHeight: number,
  fontFamily: string,
): ReactNode {
  const bg = content.backgrounds.find((b) => b.id === card.backgroundId);
  const icon = card.iconId
    ? content.icons.find((ic) => ic.id === card.iconId)
    : null;
  const ts = content.textSettings;

  const bgUrl = bg ? assetMap.get(bg.imageAssetKey) : undefined;
  const iconUrl = icon ? assetMap.get(icon.imageAssetKey) : undefined;

  const iconScale = card.iconScale ?? 0.4;
  const iconSize = cardWidth * iconScale;

  // Resolve text properties (per-card overrides → global defaults)
  const primaryFontSize = card.primaryText.fontSize ?? ts.defaultFontSize;
  const primaryColor = card.primaryText.color ?? ts.defaultColor;
  const primaryOutlineWidth =
    card.primaryText.outlineWidth ?? ts.defaultOutlineWidth;
  const primaryOutlineColor =
    card.primaryText.outlineColor ?? ts.defaultOutlineColor;
  const primaryHAlign = card.primaryText.hAlign ?? ts.defaultHAlign;
  const primaryVAlign = card.primaryText.vAlign ?? ts.defaultVAlign;

  const hasSecondary = !!card.secondaryText?.content;
  const secondaryFontSize =
    card.secondaryText?.fontSize ?? Math.round(ts.defaultFontSize * 0.5);
  const secondaryColor = card.secondaryText?.color ?? ts.defaultColor;
  const secondaryOutlineWidth =
    card.secondaryText?.outlineWidth ?? Math.max(1, ts.defaultOutlineWidth - 1);
  const secondaryOutlineColor =
    card.secondaryText?.outlineColor ?? ts.defaultOutlineColor;

  const children: ReactNode[] = [];

  // Layer 1: Background
  if (bgUrl) {
    children.push(
      createElement(Image, {
        key: "bg",
        src: bgUrl,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: cardWidth,
          height: cardHeight,
          objectFit: "cover",
        },
      }),
    );
  }

  // Layer 2: Icon (transparent PNG, centered)
  if (iconUrl) {
    children.push(
      createElement(Image, {
        key: "icon",
        src: iconUrl,
        style: {
          position: "absolute",
          top: (cardHeight - iconSize) / 2 - cardHeight * 0.05,
          left: (cardWidth - iconSize) / 2,
          width: iconSize,
          height: iconSize,
          objectFit: "contain",
        },
      }),
    );
  }

  // Layer 3: Primary text with outline
  const showTextMode: ShowTextMode = content.showText ?? "numbers_only";
  if (
    card.primaryText.content &&
    shouldShowText(card.primaryText.content, showTextMode)
  ) {
    const vertPos = toVerticalPosition(primaryVAlign, cardHeight, false);
    children.push(
      ...createOutlinedText(
        card.primaryText.content,
        primaryFontSize,
        primaryColor,
        primaryOutlineColor,
        primaryOutlineWidth,
        toTextAlign(primaryHAlign),
        fontFamily,
        700,
        cardWidth,
        vertPos,
      ),
    );
  }

  // Layer 4: Secondary text
  if (
    hasSecondary &&
    shouldShowText(card.secondaryText!.content, showTextMode)
  ) {
    const secondaryHAlign = card.secondaryText!.hAlign ?? primaryHAlign;
    const secondaryVAlign = card.secondaryText!.vAlign ?? primaryVAlign;
    const vertPos = toVerticalPosition(secondaryVAlign, cardHeight, true);
    children.push(
      ...createOutlinedText(
        card.secondaryText!.content,
        secondaryFontSize,
        secondaryColor,
        secondaryOutlineColor,
        secondaryOutlineWidth,
        toTextAlign(secondaryHAlign),
        fontFamily,
        600,
        cardWidth,
        vertPos,
      ),
    );
  }

  return createElement(
    View,
    {
      style: {
        width: cardWidth,
        height: cardHeight,
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
      },
    },
    ...children,
  );
}

/**
 * Expand card entries by count to produce the full deck order.
 */
function expandCards(cards: CardGameCardEntry[]): CardGameCardEntry[] {
  const expanded: CardGameCardEntry[] = [];
  for (const card of cards) {
    for (let i = 0; i < card.count; i++) {
      expanded.push(card);
    }
  }
  return expanded;
}

export async function generateCardGamePDF({
  content,
  assetMap,
  cardsPerPage = 9,
  includeCardBacks = false,
  watermark,
}: CardGamePDFOptions): Promise<Blob> {
  // Register the font
  const fontName = content.textSettings.fontFamily;
  registerFont(fontName);
  const fontFamily = getPDFFontFamily(fontName);

  const { cols, rows } = getGridDimensions(cardsPerPage);
  const gap = 12;
  const usableWidth = A4_WIDTH - MARGIN * 2;
  const usableHeight = A4_HEIGHT - MARGIN * 2;
  const cardWidth = (usableWidth - gap * (cols - 1)) / cols;
  const cardHeight = (usableHeight - gap * (rows - 1)) / rows;

  const expandedCards = expandCards(content.cards);
  const cardBackUrl = content.cardBack
    ? assetMap.get(content.cardBack.imageAssetKey)
    : undefined;

  const pages: ReactNode[] = [];

  // Chunk expanded cards into page-sized groups
  for (let i = 0; i < expandedCards.length; i += cardsPerPage) {
    const pageCards = expandedCards.slice(i, i + cardsPerPage);

    const cardElements = pageCards.map((card, idx) =>
      createElement(
        View,
        { key: `card-${idx}` },
        renderCard(card, content, assetMap, cardWidth, cardHeight, fontFamily),
      ),
    );

    pages.push(
      createElement(
        Page,
        {
          key: `front-${pages.length}`,
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

    // Card back page for double-sided printing
    if (includeCardBacks && cardBackUrl) {
      const backElements = pageCards.map((_, idx) =>
        createElement(
          View,
          {
            key: `back-card-${idx}`,
            style: {
              width: cardWidth,
              height: cardHeight,
              overflow: "hidden",
              borderRadius: 8,
            },
          },
          createElement(Image, {
            src: cardBackUrl,
            style: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
            },
          }),
        ),
      );

      pages.push(
        createElement(
          Page,
          {
            key: `back-${pages.length}`,
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
            ...backElements,
          ),
          watermark ? createWatermarkOverlay() : null,
        ),
      );
    }
  }

  const document = createElement(Document, {}, ...pages);
  return await pdf(document).toBlob();
}
