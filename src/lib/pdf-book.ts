/**
 * PDF generator for Book resources.
 *
 * Two layout modes:
 * - picture_book: Large image (~65% of page) + text below (~35%)
 * - illustrated_text: Smaller image (~30% of page) at top + text below
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

  const isPictureBook = content.layout === "picture_book";
  const usableWidth = A4_WIDTH - MARGIN * 2;
  const usableHeight = A4_HEIGHT - MARGIN * 2;

  const pages: ReturnType<typeof createElement>[] = [];

  // Cover page
  if (content.cover) {
    pages.push(
      renderCoverPage(content.cover, assetMap, {
        headingFontFamily,
        bodyFontFamily,
        colors: effectiveStyle.colors,
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
        headingFontFamily,
        bodyFontFamily,
        colors: effectiveStyle.colors,
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
        backgroundColor: opts.colors.background,
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

  const imageHeightRatio = opts.isPictureBook ? 0.6 : 0.3;
  const imageHeight = imageUrl ? opts.usableHeight * imageHeightRatio : 0;
  const textAreaHeight = opts.usableHeight - imageHeight - (imageUrl ? 16 : 0) - 24; // 16 gap, 24 page number

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
        backgroundColor: opts.colors.background,
        flexDirection: "column",
      },
    },
    ...children,
  );
}
