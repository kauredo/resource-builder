import { Document, Page, View, Text, Image, pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { getPDFFontFamily, registerFonts } from "./pdf-fonts";
import { createWatermarkOverlay } from "./pdf-watermark";
import type { VisualScheduleContent } from "@/types";

interface VisualSchedulePDFOptions {
  content: VisualScheduleContent;
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
  assetMap?: Map<string, string>;
  watermark?: boolean;
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

export async function generateVisualSchedulePDF(
  options: VisualSchedulePDFOptions,
): Promise<Blob> {
  const {
    content,
    style = DEFAULT_STYLE,
    assetMap,
    watermark,
  } = options;

  const effectiveStyle = {
    ...DEFAULT_STYLE,
    ...style,
    colors: { ...DEFAULT_STYLE.colors, ...style.colors },
    typography: { ...DEFAULT_STYLE.typography, ...style.typography },
  };

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

  const { primary, secondary, accent, text: textColor } = effectiveStyle.colors;

  let document;
  switch (content.scheduleFormat) {
    case "schedule_board":
      document = renderScheduleBoard(content, { headingFontFamily, bodyFontFamily, primary, secondary, accent, textColor, assetMap, watermark });
      break;
    case "first_then":
      document = renderFirstThen(content, { headingFontFamily, bodyFontFamily, primary, secondary, accent, textColor, assetMap, watermark });
      break;
    default:
      document = renderRoutineStrip(content, { headingFontFamily, bodyFontFamily, primary, secondary, accent, textColor, assetMap, watermark });
      break;
  }

  return await pdf(document).toBlob();
}

interface RenderContext {
  headingFontFamily: string;
  bodyFontFamily: string;
  primary: string;
  secondary: string;
  accent: string;
  textColor: string;
  assetMap?: Map<string, string>;
  watermark?: boolean;
}

/** Append hex alpha to a color (e.g. "#1A1A1A", 0.1 → "#1A1A1A1A") */
function colorAlpha(hex: string, alpha: number): string {
  const base = hex.startsWith("#") ? hex.slice(1, 7) : hex.slice(0, 6);
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `#${base}${a}`;
}

// ---------------------------------------------------------------------------
// Routine Strip — Landscape, horizontal card sequence with arrows
// ---------------------------------------------------------------------------

function renderRoutineStrip(content: VisualScheduleContent, ctx: RenderContext) {
  const headerUrl = ctx.assetMap?.get(content.headerImageAssetKey ?? "schedule_header");
  const activities = content.activities;
  const cardsPerRow = 5;
  const rows: typeof activities[] = [];
  for (let i = 0; i < activities.length; i += cardsPerRow) {
    rows.push(activities.slice(i, i + cardsPerRow));
  }

  // Card dimensions
  const cardWidth = 120;
  const cardHeight = 130;
  const arrowWidth = 20;

  return createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", orientation: "landscape", style: { padding: 36, backgroundColor: "#FFFFFF", color: ctx.textColor } },

      // Header image
      headerUrl
        ? createElement(Image, {
            src: headerUrl,
            style: { width: "100%", height: 80, borderRadius: 8, marginBottom: 10, objectFit: "contain" as const },
          })
        : null,

      // Title
      createElement(
        Text,
        { style: { fontFamily: ctx.headingFontFamily, fontSize: 22, marginBottom: 4, textAlign: "center" as const } },
        content.title,
      ),

      // Instructions
      content.instructions
        ? createElement(
            Text,
            { style: { fontFamily: ctx.bodyFontFamily, fontSize: 10, color: ctx.textColor, opacity: 0.7, marginBottom: 12, textAlign: "center" as const } },
            content.instructions,
          )
        : null,

      // Activity rows
      ...rows.map((row, rowIdx) =>
        createElement(
          View,
          {
            key: `row-${rowIdx}`,
            style: {
              flexDirection: "row" as const,
              justifyContent: "center" as const,
              alignItems: "center" as const,
              marginBottom: 12,
              gap: 0,
            },
          },
          ...row.flatMap((activity, aIdx) => {
            const globalIdx = rowIdx * cardsPerRow + aIdx;
            const iconUrl = ctx.assetMap?.get(activity.imageAssetKey ?? `schedule_activity_icon:activity_${globalIdx}`);
            const elements = [];

            // Activity card
            elements.push(
              createElement(
                View,
                {
                  key: `card-${globalIdx}`,
                  style: {
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: 10,
                    border: `1.5px solid ${colorAlpha(ctx.primary, 0.8)}`,
                    alignItems: "center" as const,
                    justifyContent: "center" as const,
                    padding: 8,
                    position: "relative" as const,
                  },
                },
                // Number badge
                createElement(
                  View,
                  {
                    style: {
                      position: "absolute" as const,
                      top: -8,
                      left: -8,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: ctx.primary,
                      alignItems: "center" as const,
                      justifyContent: "center" as const,
                    },
                  },
                  createElement(
                    Text,
                    { style: { fontFamily: ctx.headingFontFamily, fontSize: 10, color: "#FFFFFF" } },
                    `${globalIdx + 1}`,
                  ),
                ),
                // Icon
                iconUrl
                  ? createElement(Image, { src: iconUrl, style: { width: 56, height: 56, borderRadius: 8, marginBottom: 6 } })
                  : createElement(View, { style: { width: 56, height: 56, borderRadius: 8, backgroundColor: colorAlpha(ctx.primary, 0.15), marginBottom: 6 } }),
                // Name
                createElement(
                  Text,
                  { style: { fontFamily: ctx.bodyFontFamily, fontSize: 9, textAlign: "center" as const } },
                  activity.name,
                ),
              ),
            );

            // Arrow connector (except after last in row)
            if (aIdx < row.length - 1) {
              elements.push(
                createElement(
                  View,
                  {
                    key: `arrow-${globalIdx}`,
                    style: {
                      width: arrowWidth,
                      alignItems: "center" as const,
                      justifyContent: "center" as const,
                    },
                  },
                  createElement(
                    Text,
                    { style: { fontFamily: ctx.bodyFontFamily, fontSize: 16, color: colorAlpha(ctx.primary, 0.6) } },
                    "→",
                  ),
                ),
              );
            }

            return elements;
          }),
        ),
      ),

      ctx.watermark ? createWatermarkOverlay() : null,
    ),
  );
}

// ---------------------------------------------------------------------------
// Schedule Board — Portrait, vertical list with time + checkbox columns
// ---------------------------------------------------------------------------

function renderScheduleBoard(content: VisualScheduleContent, ctx: RenderContext) {
  const headerUrl = ctx.assetMap?.get(content.headerImageAssetKey ?? "schedule_header");
  const showTime = content.timeLabels ?? false;
  const showCheckbox = content.checkboxes ?? true;

  // Column widths
  const timeColWidth = showTime ? 60 : 0;
  const checkboxColWidth = showCheckbox ? 30 : 0;
  const iconColWidth = 36;
  const contentWidth = 595 - 72 - timeColWidth - iconColWidth - checkboxColWidth - 24; // padding/gaps

  return createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: { padding: 36, backgroundColor: "#FFFFFF", color: ctx.textColor } },

      // Header image
      headerUrl
        ? createElement(Image, {
            src: headerUrl,
            style: { width: "100%", height: 100, borderRadius: 8, marginBottom: 12, objectFit: "contain" as const },
          })
        : null,

      // Title
      createElement(
        Text,
        { style: { fontFamily: ctx.headingFontFamily, fontSize: 24, marginBottom: 4, textAlign: "center" as const } },
        content.title,
      ),

      // Instructions
      content.instructions
        ? createElement(
            Text,
            { style: { fontFamily: ctx.bodyFontFamily, fontSize: 11, color: ctx.textColor, opacity: 0.7, marginBottom: 14, textAlign: "center" as const } },
            content.instructions,
          )
        : null,

      // Column headers
      createElement(
        View,
        {
          style: {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: 8,
            marginBottom: 6,
            paddingBottom: 4,
            borderBottom: `1px solid ${colorAlpha(ctx.textColor, 0.2)}`,
            borderBottomStyle: "solid" as const,
          },
        },
        showTime
          ? createElement(
              Text,
              { style: { width: timeColWidth, fontFamily: ctx.bodyFontFamily, fontSize: 8, textAlign: "center" as const, color: colorAlpha(ctx.textColor, 0.5) } },
              "TIME",
            )
          : null,
        createElement(View, { style: { width: iconColWidth } }),
        createElement(
          Text,
          { style: { flex: 1, fontFamily: ctx.bodyFontFamily, fontSize: 8, color: colorAlpha(ctx.textColor, 0.5) } },
          "ACTIVITY",
        ),
        showCheckbox
          ? createElement(
              Text,
              { style: { width: checkboxColWidth, fontFamily: ctx.bodyFontFamily, fontSize: 8, textAlign: "center" as const, color: colorAlpha(ctx.textColor, 0.5) } },
              "DONE",
            )
          : null,
      ),

      // Activity rows
      ...content.activities.map((activity, aIdx) => {
        const iconUrl = ctx.assetMap?.get(activity.imageAssetKey ?? `schedule_activity_icon:activity_${aIdx}`);
        return createElement(
          View,
          {
            key: `activity-${aIdx}`,
            style: {
              flexDirection: "row" as const,
              alignItems: "center" as const,
              gap: 8,
              paddingVertical: 8,
              borderBottom: `1px solid ${colorAlpha(ctx.textColor, 0.1)}`,
              borderBottomStyle: "solid" as const,
            },
            wrap: false,
          },
          // Time
          showTime
            ? createElement(
                Text,
                { style: { width: timeColWidth, fontFamily: ctx.bodyFontFamily, fontSize: 10, textAlign: "center" as const, color: ctx.primary } },
                activity.time || "",
              )
            : null,
          // Icon
          iconUrl
            ? createElement(Image, { src: iconUrl, style: { width: 30, height: 30, borderRadius: 6 } })
            : createElement(View, { style: { width: 30, height: 30, borderRadius: 6, backgroundColor: colorAlpha(ctx.primary, 0.15) } }),
          // Name + description + duration
          createElement(
            View,
            { style: { flex: 1, width: contentWidth } },
            createElement(
              Text,
              { style: { fontFamily: ctx.bodyFontFamily, fontSize: 12 } },
              activity.name,
            ),
            activity.description
              ? createElement(
                  Text,
                  { style: { fontFamily: ctx.bodyFontFamily, fontSize: 9, color: colorAlpha(ctx.textColor, 0.6), marginTop: 1 } },
                  activity.description,
                )
              : null,
            activity.duration
              ? createElement(
                  Text,
                  { style: { fontFamily: ctx.bodyFontFamily, fontSize: 8, color: ctx.secondary, marginTop: 1 } },
                  activity.duration,
                )
              : null,
          ),
          // Checkbox
          showCheckbox
            ? createElement(View, {
                style: {
                  width: 18,
                  height: 18,
                  borderRadius: 3,
                  border: `1.5px solid ${colorAlpha(ctx.textColor, 0.35)}`,
                },
              })
            : null,
        );
      }),

      ctx.watermark ? createWatermarkOverlay() : null,
    ),
  );
}

// ---------------------------------------------------------------------------
// First-Then — Landscape, two large side-by-side panels
// ---------------------------------------------------------------------------

function renderFirstThen(content: VisualScheduleContent, ctx: RenderContext) {
  const headerUrl = ctx.assetMap?.get(content.headerImageAssetKey ?? "schedule_header");
  const firstActivity = content.activities[0];
  const thenActivity = content.activities[1];
  const firstLabel = content.firstLabel || "First";
  const thenLabel = content.thenLabel || "Then";

  const panelWidth = 310;
  const panelHeight = 300;

  function renderPanel(
    activity: typeof firstActivity | undefined,
    label: string,
    idx: number,
    bgColor: string,
  ) {
    if (!activity) {
      return createElement(
        View,
        { style: { width: panelWidth, height: panelHeight, borderRadius: 16, border: `2px dashed ${colorAlpha(ctx.textColor, 0.2)}`, alignItems: "center" as const, justifyContent: "center" as const } },
        createElement(Text, { style: { fontFamily: ctx.bodyFontFamily, fontSize: 14, color: colorAlpha(ctx.textColor, 0.5) } }, "No activity"),
      );
    }

    const iconUrl = ctx.assetMap?.get(activity.imageAssetKey ?? `schedule_activity_icon:activity_${idx}`);

    return createElement(
      View,
      {
        style: {
          width: panelWidth,
          height: panelHeight,
          borderRadius: 16,
          backgroundColor: colorAlpha(bgColor, 0.12),
          alignItems: "center" as const,
          justifyContent: "center" as const,
          padding: 20,
        },
      },
      // Label
      createElement(
        Text,
        { style: { fontFamily: ctx.headingFontFamily, fontSize: 22, color: ctx.textColor, marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: 2 } },
        label,
      ),
      // Icon
      iconUrl
        ? createElement(Image, { src: iconUrl, style: { width: 120, height: 120, borderRadius: 16, marginBottom: 12 } })
        : createElement(View, { style: { width: 120, height: 120, borderRadius: 16, backgroundColor: colorAlpha(ctx.primary, 0.2), marginBottom: 12 } }),
      // Activity name
      createElement(
        Text,
        { style: { fontFamily: ctx.headingFontFamily, fontSize: 20, color: ctx.textColor, textAlign: "center" as const } },
        activity.name,
      ),
      activity.description
        ? createElement(
            Text,
            { style: { fontFamily: ctx.bodyFontFamily, fontSize: 11, color: colorAlpha(ctx.textColor, 0.7), marginTop: 4, textAlign: "center" as const } },
            activity.description,
          )
        : null,
    );
  }

  return createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", orientation: "landscape", style: { padding: 36, backgroundColor: "#FFFFFF", color: ctx.textColor } },

      // Header image
      headerUrl
        ? createElement(Image, {
            src: headerUrl,
            style: { width: "100%", height: 70, borderRadius: 8, marginBottom: 8, objectFit: "contain" as const },
          })
        : null,

      // Title
      createElement(
        Text,
        { style: { fontFamily: ctx.headingFontFamily, fontSize: 22, marginBottom: 4, textAlign: "center" as const } },
        content.title,
      ),

      // Instructions
      content.instructions
        ? createElement(
            Text,
            { style: { fontFamily: ctx.bodyFontFamily, fontSize: 10, color: ctx.textColor, opacity: 0.7, marginBottom: 12, textAlign: "center" as const } },
            content.instructions,
          )
        : null,

      // Two panels with arrow
      createElement(
        View,
        {
          style: {
            flexDirection: "row" as const,
            justifyContent: "center" as const,
            alignItems: "center" as const,
            gap: 0,
          },
        },
        renderPanel(firstActivity, firstLabel, 0, ctx.primary),
        // Arrow between panels
        createElement(
          View,
          { style: { width: 50, alignItems: "center" as const, justifyContent: "center" as const } },
          createElement(
            Text,
            { style: { fontFamily: ctx.headingFontFamily, fontSize: 32, color: ctx.primary, opacity: 0.6 } },
            "→",
          ),
        ),
        renderPanel(thenActivity, thenLabel, 1, ctx.secondary),
      ),

      ctx.watermark ? createWatermarkOverlay() : null,
    ),
  );
}
