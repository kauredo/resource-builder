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

// 1cm = 28.3465 PDF points
const CM = 28.3465;

// A4 = 21cm × 29.7cm
const A4_WIDTH = 21 * CM;   // 595.28
const A4_HEIGHT = 29.7 * CM; // 841.89
const MARGIN = 1.3 * CM;     // ~36pt — 0.5in per print guidelines

// Minimum space reserved below image for text + page number
const TEXT_RESERVE_PICTURE_BOOK = 3 * CM;  // ~85pt — room for 3-4 lines at 16pt
const TEXT_RESERVE_ILLUSTRATED  = 8 * CM;  // ~227pt — text-heavy layout
// Booklet has smaller pages; reserve less
const TEXT_RESERVE_BOOKLET = 2.5 * CM;     // ~71pt

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

  // Same approach as booklet cover — centered image + title below
  const children: ReturnType<typeof createElement>[] = [];

  if (coverUrl) {
    // Cover images are 3:4 portrait — leave room for title below
    const imageHeight = Math.min(opts.usableWidth * (4 / 3), opts.usableHeight - 4 * CM);
    const imageWidth = imageHeight * (3 / 4);
    children.push(
      createElement(Image, {
        key: "cover-img",
        src: coverUrl,
        style: {
          width: imageWidth,
          height: imageHeight,
          borderRadius: 8,
          marginBottom: 16,
          alignSelf: "center",
        },
      }),
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
          fontSize: 32,
          color: opts.colors.text,
          textAlign: "center",
          marginBottom: 8,
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
            fontSize: 16,
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
    Page,
    {
      key: "cover",
      size: "A4",
      style: {
        padding: MARGIN,
        backgroundColor: "#FFFFFF",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
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

  // Page images are 3:4 (portrait). Use full usable width for picture books,
  // only capping height to leave room for text + page number.
  const textReserve = opts.isPictureBook
    ? TEXT_RESERVE_PICTURE_BOOK
    : TEXT_RESERVE_ILLUSTRATED;
  const maxImageHeight = opts.usableHeight - textReserve;
  const naturalHeight = opts.usableWidth * (4 / 3);
  const imageHeight = imageUrl ? Math.min(naturalHeight, maxImageHeight) : 0;
  // Derive width from height to keep 3:4 ratio
  const imageWidth = imageHeight * (3 / 4);

  const children: ReturnType<typeof createElement>[] = [];

  // Image
  if (imageUrl) {
    children.push(
      createElement(Image, {
        key: "img",
        src: imageUrl,
        style: {
          width: imageWidth,
          height: imageHeight,
          borderRadius: 8,
          marginBottom: 16,
          alignSelf: "center",
        },
      }),
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

  // Page number — centered at bottom for picture books, right-aligned for illustrated text
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
    // Cover images are 3:4 portrait — leave room for title below
    const imageHeight = Math.min(opts.usableWidth * (4 / 3), opts.usableHeight - 3 * CM);
    const imageWidth = imageHeight * (3 / 4);
    children.push(
      createElement(Image, {
        key: "cover-img",
        src: coverUrl,
        style: {
          width: imageWidth,
          height: imageHeight,
          borderRadius: 6,
          marginBottom: 10,
          alignSelf: "center",
        },
      }),
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

  // Page images are 3:4 (portrait) — cap height to leave room for text.
  if (imageUrl) {
    const maxImageHeight = opts.usableHeight - TEXT_RESERVE_BOOKLET;
    const naturalHeight = opts.usableWidth * (4 / 3);
    const imageHeight = Math.min(naturalHeight, maxImageHeight);
    const imageWidth = imageHeight * (3 / 4);
    children.push(
      createElement(Image, {
        key: "img",
        src: imageUrl,
        style: {
          width: imageWidth,
          height: imageHeight,
          borderRadius: 6,
          marginBottom: 8,
          alignSelf: "center",
        },
      }),
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
