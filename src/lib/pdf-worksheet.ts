import { Document, Page, View, Text, Image, pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { getPDFFontFamily, registerFonts } from "./pdf-fonts";
import type { WorksheetBlock, WorksheetContent } from "@/types";

interface WorksheetPDFOptions {
  content: WorksheetContent;
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
  /** Legacy single header image URL */
  headerImageUrl?: string;
  /** Asset key → URL map for block images */
  assetMap?: Map<string, string>;
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderBlock(
  block: WorksheetBlock,
  styles: Record<string, any>,
  assetMap?: Map<string, string>,
) {
  switch (block.type) {
    case "heading":
      return createElement(Text, { style: styles.blockHeading }, block.text ?? "");

    case "prompt":
    case "text":
      return createElement(Text, { style: styles.blockText }, block.text ?? "");

    case "lines": {
      const lines = block.lines ?? 3;
      return createElement(
        View,
        { style: styles.linesWrapper },
        Array.from({ length: lines }).map((_, i) =>
          createElement(View, { key: i, style: styles.line }),
        ),
      );
    }

    case "checklist":
      return createElement(
        View,
        { style: styles.checklist },
        (block.items ?? []).map((item, i) =>
          createElement(
            View,
            { key: i, style: styles.checklistRow },
            createElement(View, { style: styles.checkbox }),
            createElement(Text, { style: styles.blockText }, item),
          ),
        ),
      );

    case "scale": {
      const min = block.scaleLabels?.min ?? "Low";
      const max = block.scaleLabels?.max ?? "High";
      return createElement(
        View,
        { style: styles.scale },
        createElement(Text, { style: styles.scaleLabel }, min),
        createElement(
          View,
          { style: styles.scaleTrack },
          Array.from({ length: 5 }).map((_, i) =>
            createElement(View, {
              key: i,
              style: styles.scaleDot,
            }),
          ),
        ),
        createElement(Text, { style: styles.scaleLabel }, max),
      );
    }

    case "drawing_box": {
      const label = block.label || "Draw here";
      return createElement(
        View,
        { style: styles.drawingBox },
        createElement(Text, { style: styles.drawingBoxLabel }, label),
      );
    }

    case "word_bank": {
      const words = block.words ?? [];
      return createElement(
        View,
        { style: styles.wordBank },
        words.map((word, i) =>
          createElement(
            View,
            { key: i, style: styles.wordChip },
            createElement(Text, { style: styles.wordChipText }, word),
          ),
        ),
      );
    }

    case "matching": {
      const left = block.leftItems ?? [];
      const right = block.rightItems ?? [];
      const maxLen = Math.max(left.length, right.length);
      return createElement(
        View,
        { style: styles.matchingContainer },
        Array.from({ length: maxLen }).map((_, i) =>
          createElement(
            View,
            { key: i, style: styles.matchingRow },
            createElement(
              View,
              { style: styles.matchingItem },
              createElement(
                Text,
                { style: styles.matchingNumber },
                `${i + 1}.`,
              ),
              createElement(
                Text,
                { style: styles.blockText },
                left[i] || "",
              ),
            ),
            createElement(View, { style: styles.matchingDots }),
            createElement(
              View,
              { style: styles.matchingItem },
              createElement(
                Text,
                { style: styles.matchingLetter },
                String.fromCharCode(65 + i) + ".",
              ),
              createElement(
                Text,
                { style: styles.blockText },
                right[i] || "",
              ),
            ),
          ),
        ),
      );
    }

    case "fill_in_blank": {
      const text = block.text ?? "";
      const parts = text.split("___");
      const children: ReturnType<typeof createElement>[] = [];
      parts.forEach((part, i) => {
        if (i > 0) {
          children.push(
            createElement(
              Text,
              { key: `blank-${i}`, style: styles.blankLine },
              "____________",
            ),
          );
        }
        if (part) {
          children.push(
            createElement(
              Text,
              { key: `text-${i}`, style: styles.blockText },
              part,
            ),
          );
        }
      });
      return createElement(View, { style: styles.fillInBlank }, ...children);
    }

    case "multiple_choice": {
      const question = block.question ?? "";
      const options = block.options ?? [];
      return createElement(
        View,
        { style: styles.multipleChoice },
        createElement(Text, { style: styles.mcQuestion }, question),
        ...options.map((opt, i) =>
          createElement(
            View,
            { key: i, style: styles.mcOption },
            createElement(View, { style: styles.mcCircle }),
            createElement(Text, { style: styles.blockText }, opt),
          ),
        ),
      );
    }

    case "image": {
      const imageUrl = block.imageAssetKey
        ? assetMap?.get(block.imageAssetKey)
        : undefined;
      if (!imageUrl) return null;
      const caption = block.caption;
      return createElement(
        View,
        { style: styles.imageBlock },
        createElement(Image, { src: imageUrl, style: styles.blockImage }),
        caption
          ? createElement(Text, { style: styles.imageCaption }, caption)
          : null,
      );
    }

    case "table": {
      const headers = block.headers ?? [];
      const rows = block.tableRows ?? [];
      const colWidth = headers.length > 0 ? `${100 / headers.length}%` : "50%";
      return createElement(
        View,
        { style: styles.table },
        // Header row
        createElement(
          View,
          { style: styles.tableHeaderRow },
          headers.map((h, i) =>
            createElement(
              View,
              {
                key: i,
                style: { ...styles.tableCell, width: colWidth, ...(styles.tableHeaderCell as object) },
              },
              createElement(Text, { style: styles.tableHeaderText }, h),
            ),
          ),
        ),
        // Data rows
        ...rows.map((row, rowIdx) =>
          createElement(
            View,
            { key: rowIdx, style: styles.tableRow },
            row.map((cell, colIdx) =>
              createElement(
                View,
                { key: colIdx, style: { ...styles.tableCell, width: colWidth } },
                createElement(
                  Text,
                  { style: styles.tableCellText },
                  cell || " ",
                ),
              ),
            ),
          ),
        ),
      );
    }

    default:
      return null;
  }
}

export async function generateWorksheetPDF({
  content,
  style,
  headerImageUrl,
  assetMap,
}: WorksheetPDFOptions): Promise<Blob> {
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

  const textColor = effectiveStyle.colors.text;
  const primaryColor = effectiveStyle.colors.primary;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles: Record<string, any> = {
    page: {
      padding: 36,
      backgroundColor: "#FFFFFF",
      color: textColor,
    },
    title: {
      fontFamily: headingFontFamily,
      fontSize: 24,
      marginBottom: 12,
    },
    headerImage: {
      width: "100%",
      height: 160,
      borderRadius: 8,
      marginBottom: 16,
      objectFit: "cover" as const,
    },
    blockHeading: {
      fontFamily: headingFontFamily,
      fontSize: 16,
      marginTop: 12,
      marginBottom: 6,
    },
    blockText: {
      fontFamily: bodyFontFamily,
      fontSize: 12,
      lineHeight: 1.4,
      marginBottom: 6,
    },
    linesWrapper: {
      marginTop: 6,
      marginBottom: 6,
    },
    line: {
      height: 1,
      backgroundColor: textColor,
      opacity: 0.2,
      marginBottom: 10,
    },
    checklist: {
      marginTop: 6,
      marginBottom: 6,
      gap: 8,
    },
    checklistRow: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    checkbox: {
      width: 12,
      height: 12,
      border: `1px solid ${textColor}`,
    },
    scale: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginVertical: 8,
    },
    scaleTrack: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `2px solid ${textColor}`,
      opacity: 0.2,
      paddingBottom: 2,
    },
    scaleDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: textColor,
      opacity: 0.3,
    },
    scaleLabel: {
      fontFamily: bodyFontFamily,
      fontSize: 10,
    },
    // Drawing box
    drawingBox: {
      marginVertical: 8,
      height: 120,
      borderWidth: 2,
      borderColor: textColor,
      borderStyle: "dashed",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.3,
    },
    drawingBoxLabel: {
      fontFamily: bodyFontFamily,
      fontSize: 11,
      color: textColor,
      opacity: 0.6,
    },
    // Word bank
    wordBank: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginVertical: 8,
    },
    wordChip: {
      backgroundColor: primaryColor,
      opacity: 0.15,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    wordChipText: {
      fontFamily: bodyFontFamily,
      fontSize: 11,
      color: textColor,
    },
    // Matching
    matchingContainer: {
      marginVertical: 8,
      gap: 6,
    },
    matchingRow: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    matchingItem: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      gap: 4,
    },
    matchingNumber: {
      fontFamily: bodyFontFamily,
      fontSize: 12,
      fontWeight: 700,
    },
    matchingLetter: {
      fontFamily: bodyFontFamily,
      fontSize: 12,
      fontWeight: 700,
    },
    matchingDots: {
      width: 40,
      borderBottom: `1px dotted ${textColor}`,
      opacity: 0.3,
    },
    // Fill in blank
    fillInBlank: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "baseline",
      marginVertical: 6,
    },
    blankLine: {
      fontFamily: bodyFontFamily,
      fontSize: 12,
      borderBottom: `1px solid ${textColor}`,
      paddingHorizontal: 2,
    },
    // Multiple choice
    multipleChoice: {
      marginVertical: 8,
      gap: 6,
    },
    mcQuestion: {
      fontFamily: bodyFontFamily,
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 4,
    },
    mcOption: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginLeft: 8,
    },
    mcCircle: {
      width: 10,
      height: 10,
      borderRadius: 5,
      border: `1.5px solid ${textColor}`,
    },
    // Image
    imageBlock: {
      marginVertical: 8,
      alignItems: "center",
    },
    blockImage: {
      width: "100%",
      maxHeight: 200,
      borderRadius: 8,
      objectFit: "cover" as const,
    },
    imageCaption: {
      fontFamily: bodyFontFamily,
      fontSize: 10,
      color: textColor,
      opacity: 0.6,
      marginTop: 4,
      textAlign: "center",
    },
    // Table
    table: {
      marginVertical: 8,
      borderWidth: 1,
      borderColor: textColor,
      borderRadius: 4,
      opacity: 0.8,
    },
    tableHeaderRow: {
      display: "flex",
      flexDirection: "row",
      backgroundColor: primaryColor,
      opacity: 0.15,
    },
    tableRow: {
      display: "flex",
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: textColor,
      borderTopStyle: "solid",
    },
    tableCell: {
      padding: 6,
      borderRightWidth: 1,
      borderRightColor: textColor,
      borderRightStyle: "solid",
    },
    tableHeaderCell: {
      backgroundColor: primaryColor,
      opacity: 0.15,
    },
    tableHeaderText: {
      fontFamily: bodyFontFamily,
      fontSize: 10,
      fontWeight: 700,
    },
    tableCellText: {
      fontFamily: bodyFontFamily,
      fontSize: 10,
      minHeight: 14,
    },
  };

  const document = createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: styles.page, wrap: true },
      createElement(Text, { style: styles.title }, content.title),
      headerImageUrl
        ? createElement(Image, {
            src: headerImageUrl,
            style: styles.headerImage,
          })
        : null,
      ...content.blocks.map((block, index) =>
        createElement(
          View,
          { key: block.id || index, wrap: false },
          renderBlock(block, styles, assetMap),
        ),
      ),
    ),
  );

  return await pdf(document).toBlob();
}
