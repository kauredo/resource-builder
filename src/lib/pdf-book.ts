/**
 * PDF generator for Book resources.
 *
 * Three layout modes:
 * - picture_book: Large image (~65% of page) + text below (~35%)
 * - illustrated_text: Smaller image (~30% of page) at top + text below
 * - booklet: Saddle-stitch booklet — landscape A4, two book pages per sheet,
 *   pages reordered for print-and-fold imposition.
 *
 * Cover page (optional): Full-bleed image with title/subtitle overlaid.
 * Page numbers at the bottom of each page.
 */

import { Document, Page, View, Text, Image, pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { getPDFFontFamily, registerFonts } from "./pdf-fonts";
import type { BookContent, BookPage, BookCover } from "@/types";

interface BookPDFOptions {
  content: BookContent;
  assetMap: Map<string, string>;
  /** Export as saddle-stitch booklet (landscape A4, two pages per sheet) */
  booklet?: boolean;
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
}

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 36;

const DEFAULT_STYLE = {
  colors: {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFE66D",
    background: "#FFFFFF",
    text: "#1A1A1A",
  },
  typography: {
    headingFont: "Helvetica",
    bodyFont: "Helvetica",
  },
};

export async function generateBookPDF({
  content,
  assetMap,
  booklet,
  style,
}: BookPDFOptions): Promise<Blob> {
  const effectiveStyle = style
    ? {
        ...DEFAULT_STYLE,
        ...style,
        colors: { ...DEFAULT_STYLE.colors, ...style.colors },
        typography: { ...DEFAULT_STYLE.typography, ...style.typography },
      }
    : DEFAULT_STYLE;

  const { failed } = registerFonts([
    effectiveStyle.typography.headingFont,
    effectiveStyle.typography.bodyFont,
  ]);

  const headingFont = failed.includes(effectiveStyle.typography.headingFont)
    ? "Helvetica"
    : effectiveStyle.typography.headingFont;
  const bodyFont = failed.includes(effectiveStyle.typography.bodyFont)
    ? "Helvetica"
    : effectiveStyle.typography.bodyFont;

  const headingFontFamily = getPDFFontFamily(headingFont);
  const bodyFontFamily = getPDFFontFamily(bodyFont);

  const fontOpts = { headingFontFamily, bodyFontFamily, colors: effectiveStyle.colors };

  // Booklet uses a completely different rendering path
  if (booklet) {
    return generateBookletLayout(content, assetMap, fontOpts);
  }

  const isPictureBook = content.layout === "picture_book";
  const usableWidth = A4_WIDTH - MARGIN * 2;
  const usableHeight = A4_HEIGHT - MARGIN * 2;

  const pages: ReturnType<typeof createElement>[] = [];

  // Cover page
  if (content.cover) {
    pages.push(
      renderCoverPage(content.cover, assetMap, {
        ...fontOpts,
        usableWidth,
        usableHeight,
      }),
    );
  }

  // Content pages
  content.pages.forEach((page, i) => {
    pages.push(
      renderContentPage(page, i, content.pages.length, assetMap, {
        isPictureBook,
        ...fontOpts,
        usableWidth,
        usableHeight,
        hasCover: !!content.cover,
      }),
    );
  });

  const document = createElement(Document, {}, ...pages);
  return await pdf(document).toBlob();
}

function renderCoverPage(
  cover: BookCover,
  assetMap: Map<string, string>,
  opts: {
    headingFontFamily: string;
    bodyFontFamily: string;
    colors: typeof DEFAULT_STYLE.colors;
    usableWidth: number;
    usableHeight: number;
  },
) {
  const coverUrl = cover.imageAssetKey
    ? assetMap.get(cover.imageAssetKey)
    : undefined;

  const children: ReturnType<typeof createElement>[] = [];

  if (coverUrl) {
    // Full-bleed cover image
    children.push(
      createElement(Image, {
        key: "cover-img",
        src: coverUrl,
        style: {
          width: A4_WIDTH,
          height: A4_HEIGHT,
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
        },
      }),
    );

    // Semi-transparent scrim at bottom for text readability
    children.push(
      createElement(View, {
        key: "cover-scrim",
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: A4_HEIGHT * 0.35,
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      }),
    );

    // Title overlay
    children.push(
      createElement(
        View,
        {
          key: "cover-text",
          style: {
            position: "absolute",
            bottom: MARGIN * 2,
            left: MARGIN,
            right: MARGIN,
          },
        },
        createElement(
          Text,
          {
            style: {
              fontFamily: opts.headingFontFamily,
              fontSize: 36,
              color: "#FFFFFF",
              marginBottom: 8,
            },
          },
          cover.title,
        ),
        cover.subtitle
          ? createElement(
              Text,
              {
                style: {
                  fontFamily: opts.bodyFontFamily,
                  fontSize: 18,
                  color: "rgba(255,255,255,0.85)",
                },
              },
              cover.subtitle,
            )
          : null,
      ),
    );
  } else {
    // No cover image — simple text cover
    children.push(
      createElement(
        View,
        {
          key: "cover-text-only",
          style: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: MARGIN * 2,
          },
        },
        createElement(
          Text,
          {
            style: {
              fontFamily: opts.headingFontFamily,
              fontSize: 36,
              color: opts.colors.text,
              textAlign: "center",
              marginBottom: 12,
            },
          },
          cover.title,
        ),
        cover.subtitle
          ? createElement(
              Text,
              {
                style: {
                  fontFamily: opts.bodyFontFamily,
                  fontSize: 18,
                  color: opts.colors.text,
                  textAlign: "center",
                  opacity: 0.7,
                },
              },
              cover.subtitle,
            )
          : null,
      ),
    );
  }

  return createElement(
    Page,
    {
      key: "cover",
      size: "A4",
      style: {
        backgroundColor: "#FFFFFF",
        position: "relative",
      },
    },
    ...children,
  );
}

function renderContentPage(
  page: BookPage,
  index: number,
  totalPages: number,
  assetMap: Map<string, string>,
  opts: {
    isPictureBook: boolean;
    headingFontFamily: string;
    bodyFontFamily: string;
    colors: typeof DEFAULT_STYLE.colors;
    usableWidth: number;
    usableHeight: number;
    hasCover: boolean;
  },
) {
  const imageUrl = page.imageAssetKey
    ? assetMap.get(page.imageAssetKey)
    : undefined;

  // Page images are 4:3 — derive height from width to match the actual ratio
  const imageHeight = imageUrl ? opts.usableWidth * (3 / 4) : 0;

  const children: ReturnType<typeof createElement>[] = [];

  // Image
  if (imageUrl) {
    children.push(
      createElement(
        View,
        {
          key: "img-wrapper",
          style: {
            width: opts.usableWidth,
            height: imageHeight,
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 16,
          },
        },
        createElement(Image, {
          src: imageUrl,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
          },
        }),
      ),
    );
  }

  // Text
  if (page.text) {
    children.push(
      createElement(
        View,
        {
          key: "text-wrapper",
          style: {
            flex: 1,
          },
        },
        createElement(
          Text,
          {
            style: {
              fontFamily: opts.bodyFontFamily,
              fontSize: opts.isPictureBook ? 16 : 12,
              lineHeight: opts.isPictureBook ? 1.6 : 1.5,
              color: opts.colors.text,
            },
          },
          page.text,
        ),
      ),
    );
  }

  // Page number
  const pageNum = index + 1;
  children.push(
    createElement(
      Text,
      {
        key: "page-num",
        style: {
          fontFamily: opts.bodyFontFamily,
          fontSize: 10,
          color: opts.colors.text,
          opacity: 0.4,
          textAlign: "center",
          marginTop: "auto",
        },
      },
      String(pageNum),
    ),
  );

  return createElement(
    Page,
    {
      key: `page-${index}`,
      size: "A4",
      style: {
        padding: MARGIN,
        backgroundColor: "#FFFFFF",
        flexDirection: "column",
      },
    },
    ...children,
  );
}

// ---------------------------------------------------------------------------
// Booklet layout — saddle-stitch imposition
// ---------------------------------------------------------------------------

// Landscape A4 dimensions
const LANDSCAPE_WIDTH = A4_HEIGHT; // 841.89
const LANDSCAPE_HEIGHT = A4_WIDTH; // 595.28
const SLOT_WIDTH = LANDSCAPE_WIDTH / 2;
const BOOKLET_MARGIN = 24;
const FOLD_MARGIN = 12; // Extra inner margin near the fold

interface FontOpts {
  headingFontFamily: string;
  bodyFontFamily: string;
  colors: typeof DEFAULT_STYLE.colors;
}

/** A "book page" for imposition — either content, cover, or blank */
type BookSlot =
  | { type: "cover"; cover: BookCover }
  | { type: "page"; page: BookPage; pageNum: number }
  | { type: "blank" };

/**
 * Saddle-stitch imposition: given N book pages (padded to multiple of 4),
 * returns pairs of [left, right] slots for each physical sheet side.
 *
 * For 8 pages → 2 sheets:
 *   Sheet 1 front: [8, 1], Sheet 1 back: [2, 7]
 *   Sheet 2 front: [6, 3], Sheet 2 back: [4, 5]
 */
function computeImposition(slots: BookSlot[]): [BookSlot, BookSlot][] {
  // Pad to multiple of 4
  while (slots.length % 4 !== 0) {
    slots.push({ type: "blank" });
  }
  const n = slots.length;
  const sides: [BookSlot, BookSlot][] = [];

  for (let s = 0; s < n / 4; s++) {
    // Front of sheet: [last - 2s, first + 2s]
    sides.push([slots[n - 1 - 2 * s], slots[2 * s]]);
    // Back of sheet: [first + 2s + 1, last - 2s - 1]
    sides.push([slots[2 * s + 1], slots[n - 2 - 2 * s]]);
  }

  return sides;
}

async function generateBookletLayout(
  content: BookContent,
  assetMap: Map<string, string>,
  fontOpts: FontOpts,
): Promise<Blob> {
  // Build linear list of book slots: cover (if any) + pages
  const slots: BookSlot[] = [];
  if (content.cover) {
    slots.push({ type: "cover", cover: content.cover });
  }
  content.pages.forEach((page, i) => {
    slots.push({ type: "page", page, pageNum: i + 1 });
  });

  // Compute imposition order
  const sheetSides = computeImposition([...slots]);

  const slotUsableWidth = SLOT_WIDTH - BOOKLET_MARGIN - FOLD_MARGIN;
  const slotUsableHeight = LANDSCAPE_HEIGHT - BOOKLET_MARGIN * 2;

  // Render each sheet side as a landscape PDF page
  const pages = sheetSides.map((pair, sideIndex) => {
    const [leftSlot, rightSlot] = pair;

    const leftContent = renderBookletSlot(leftSlot, "left", assetMap, {
      ...fontOpts,
      slotWidth: SLOT_WIDTH,
      usableWidth: slotUsableWidth,
      usableHeight: slotUsableHeight,
    });

    const rightContent = renderBookletSlot(rightSlot, "right", assetMap, {
      ...fontOpts,
      slotWidth: SLOT_WIDTH,
      usableWidth: slotUsableWidth,
      usableHeight: slotUsableHeight,
    });

    return createElement(
      Page,
      {
        key: `sheet-${sideIndex}`,
        size: [LANDSCAPE_WIDTH, LANDSCAPE_HEIGHT],
        style: {
          flexDirection: "row",
          backgroundColor: "#FFFFFF",
        },
      },
      // Left half
      leftContent,
      // Fold line
      createElement(View, {
        key: "fold",
        style: {
          width: 0,
          borderLeft: "1px dashed #CCCCCC",
          height: "100%",
        },
      }),
      // Right half
      rightContent,
    );
  });

  const document = createElement(Document, {}, ...pages);
  return await pdf(document).toBlob();
}

function bookletContainerStyle(side: "left" | "right", slotWidth: number) {
  return {
    width: slotWidth,
    height: LANDSCAPE_HEIGHT,
    paddingTop: BOOKLET_MARGIN,
    paddingBottom: BOOKLET_MARGIN,
    paddingLeft: side === "left" ? BOOKLET_MARGIN : FOLD_MARGIN,
    paddingRight: side === "left" ? FOLD_MARGIN : BOOKLET_MARGIN,
    flexDirection: "column" as const,
  };
}

function renderBookletSlot(
  slot: BookSlot,
  side: "left" | "right",
  assetMap: Map<string, string>,
  opts: FontOpts & {
    slotWidth: number;
    usableWidth: number;
    usableHeight: number;
  },
): ReturnType<typeof createElement> {
  const style = bookletContainerStyle(side, opts.slotWidth);

  if (slot.type === "blank") {
    return createElement(View, { key: `${side}-blank`, style });
  }

  if (slot.type === "cover") {
    return renderBookletCover(slot.cover, side, assetMap, opts, style);
  }

  return renderBookletPage(slot.page, slot.pageNum, side, assetMap, opts, style);
}

function renderBookletCover(
  cover: BookCover,
  side: "left" | "right",
  assetMap: Map<string, string>,
  opts: FontOpts & { usableWidth: number; usableHeight: number },
  containerStyle: ReturnType<typeof bookletContainerStyle>,
): ReturnType<typeof createElement> {
  const coverUrl = cover.imageAssetKey ? assetMap.get(cover.imageAssetKey) : undefined;
  const children: ReturnType<typeof createElement>[] = [];

  if (coverUrl) {
    // Cover images are 3:4 portrait — derive height from width
    const imageHeight = Math.min(opts.usableWidth * (4 / 3), opts.usableHeight * 0.75);
    const imageWidth = imageHeight * (3 / 4);
    children.push(
      createElement(
        View,
        {
          key: "cover-img-wrap",
          style: {
            width: imageWidth,
            height: imageHeight,
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 10,
            alignSelf: "center",
          },
        },
        createElement(Image, {
          src: coverUrl,
          style: { width: "100%", height: "100%", objectFit: "cover" },
        }),
      ),
    );
  }

  // Title
  children.push(
    createElement(
      Text,
      {
        key: "cover-title",
        style: {
          fontFamily: opts.headingFontFamily,
          fontSize: 22,
          color: opts.colors.text,
          textAlign: "center",
          marginBottom: 4,
        },
      },
      cover.title,
    ),
  );

  if (cover.subtitle) {
    children.push(
      createElement(
        Text,
        {
          key: "cover-subtitle",
          style: {
            fontFamily: opts.bodyFontFamily,
            fontSize: 12,
            color: opts.colors.text,
            textAlign: "center",
            opacity: 0.6,
          },
        },
        cover.subtitle,
      ),
    );
  }

  return createElement(
    View,
    { key: `${side}-cover`, style: containerStyle },
    ...children,
  );
}

function renderBookletPage(
  page: BookPage,
  pageNum: number,
  side: "left" | "right",
  assetMap: Map<string, string>,
  opts: FontOpts & { usableWidth: number; usableHeight: number },
  containerStyle: ReturnType<typeof bookletContainerStyle>,
): ReturnType<typeof createElement> {
  const imageUrl = page.imageAssetKey ? assetMap.get(page.imageAssetKey) : undefined;
  const children: ReturnType<typeof createElement>[] = [];

  // Page images are 4:3 — same ratio as standard layout
  if (imageUrl) {
    const imageHeight = opts.usableWidth * (3 / 4);
    children.push(
      createElement(
        View,
        {
          key: "img-wrap",
          style: {
            width: opts.usableWidth,
            height: imageHeight,
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 8,
          },
        },
        createElement(Image, {
          src: imageUrl,
          style: { width: "100%", height: "100%", objectFit: "cover" },
        }),
      ),
    );
  }

  // Text
  if (page.text) {
    children.push(
      createElement(
        View,
        { key: "text-wrap", style: { flex: 1 } },
        createElement(
          Text,
          {
            style: {
              fontFamily: opts.bodyFontFamily,
              fontSize: 11,
              lineHeight: 1.5,
              color: opts.colors.text,
            },
          },
          page.text,
        ),
      ),
    );
  }

  // Page number
  children.push(
    createElement(
      Text,
      {
        key: "page-num",
        style: {
          fontFamily: opts.bodyFontFamily,
          fontSize: 8,
          color: opts.colors.text,
          opacity: 0.35,
          textAlign: side === "left" ? "left" : "right",
          marginTop: "auto",
        },
      },
      String(pageNum),
    ),
  );

  return createElement(
    View,
    { key: `${side}-page-${pageNum}`, style: containerStyle },
    ...children,
  );
}
