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
  headerImageUrl?: string;
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

function renderBlock(block: WorksheetBlock, styles: any) {
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
          createElement(View, { key: i, style: styles.line })),
      );
    }
    case "checklist": {
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
    }
    case "scale": {
      const min = block.scaleLabels?.min ?? "Low";
      const max = block.scaleLabels?.max ?? "High";
      return createElement(
        View,
        { style: styles.scale },
        createElement(Text, { style: styles.scaleLabel }, min),
        createElement(View, { style: styles.scaleLine }),
        createElement(Text, { style: styles.scaleLabel }, max),
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

  const styles = {
    page: {
      padding: 36,
      backgroundColor: "#FFFFFF",
      color: effectiveStyle.colors.text,
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
      backgroundColor: effectiveStyle.colors.text,
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
      border: `1px solid ${effectiveStyle.colors.text}`,
    },
    scale: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginVertical: 8,
    },
    scaleLine: {
      flex: 1,
      height: 2,
      backgroundColor: effectiveStyle.colors.text,
      opacity: 0.2,
    },
    scaleLabel: {
      fontFamily: bodyFontFamily,
      fontSize: 10,
    },
  };

  const document = createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(Text, { style: styles.title }, content.title),
      headerImageUrl
        ? createElement(Image, { src: headerImageUrl, style: styles.headerImage })
        : null,
      ...content.blocks.map((block, index) =>
        createElement(
          View,
          { key: index, wrap: false },
          renderBlock(block, styles),
        ),
      ),
    ),
  );

  return await pdf(document).toBlob();
}
