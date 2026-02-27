import { Document, Page, View, Text, Image, pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { getPDFFontFamily, registerFonts } from "./pdf-fonts";
import { createWatermarkOverlay } from "./pdf-watermark";
import type { BehaviorChartContent } from "@/types";

interface BehaviorChartPDFOptions {
  content: BehaviorChartContent;
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

export async function generateBehaviorChartPDF(
  options: BehaviorChartPDFOptions,
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
  switch (content.chartFormat) {
    case "token_board":
      document = renderTokenBoard(content, { headingFontFamily, bodyFontFamily, primary, secondary, accent, textColor, assetMap, watermark });
      break;
    case "progress_tracker":
      document = renderProgressTracker(content, { headingFontFamily, bodyFontFamily, primary, secondary, accent, textColor, assetMap, watermark });
      break;
    default:
      document = renderStickerChart(content, { headingFontFamily, bodyFontFamily, primary, secondary, accent, textColor, assetMap, watermark });
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

// ---------------------------------------------------------------------------
// Sticker Chart
// ---------------------------------------------------------------------------

function renderStickerChart(content: BehaviorChartContent, ctx: RenderContext) {
  const columns = content.columns ?? 5;
  const labels = content.columnLabels ?? [];
  const headerUrl = ctx.assetMap?.get(content.headerImageAssetKey ?? "chart_header");

  // Calculate column width for the tracking grid
  const iconColWidth = 80;
  const trackingColWidth = Math.min(50, (595 - 72 - iconColWidth - 40) / columns);

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
            { style: { fontFamily: ctx.bodyFontFamily, fontSize: 11, color: ctx.textColor, opacity: 0.7, marginBottom: 12, textAlign: "center" as const } },
            content.instructions,
          )
        : null,

      // Column header row
      createElement(
        View,
        { style: { flexDirection: "row" as const, marginBottom: 4, paddingLeft: iconColWidth + 8 } },
        ...Array.from({ length: columns }).map((_, i) =>
          createElement(
            Text,
            {
              key: `header-${i}`,
              style: {
                width: trackingColWidth,
                fontFamily: ctx.bodyFontFamily,
                fontSize: 9,
                textAlign: "center" as const,
                color: ctx.textColor,
                opacity: 0.6,
              },
            },
            labels[i] || `${i + 1}`,
          ),
        ),
      ),

      // Behavior rows
      ...content.behaviors.map((behavior, bIdx) => {
        const iconUrl = ctx.assetMap?.get(behavior.imageAssetKey ?? `chart_behavior_icon:behavior_${bIdx}`);
        return createElement(
          View,
          {
            key: `behavior-${bIdx}`,
            style: {
              flexDirection: "row" as const,
              alignItems: "center" as const,
              marginBottom: 8,
              borderBottom: `1px solid ${ctx.textColor}`,
              borderBottomStyle: "solid" as const,
              opacity: 0.15,
              paddingBottom: 8,
            },
            wrap: false,
          },
          // Icon + name
          createElement(
            View,
            { style: { width: iconColWidth, flexDirection: "row" as const, alignItems: "center" as const, gap: 6 } },
            iconUrl
              ? createElement(Image, { src: iconUrl, style: { width: 28, height: 28, borderRadius: 4 } })
              : createElement(View, { style: { width: 28, height: 28, borderRadius: 4, backgroundColor: ctx.primary, opacity: 0.2 } }),
            createElement(
              Text,
              { style: { fontFamily: ctx.bodyFontFamily, fontSize: 10, flex: 1, opacity: 1 / 0.15 } },
              behavior.name,
            ),
          ),
          // Sticker cells
          ...Array.from({ length: columns }).map((_, cIdx) =>
            createElement(View, {
              key: `cell-${bIdx}-${cIdx}`,
              style: {
                width: trackingColWidth - 4,
                height: trackingColWidth - 4,
                borderRadius: 6,
                border: `1.5px dashed ${ctx.primary}`,
                opacity: 1 / 0.15 * 0.4,
                marginHorizontal: 2,
              },
            }),
          ),
        );
      }),

      // Reward section
      createElement(
        View,
        { style: { marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: ctx.accent, opacity: 0.15, flexDirection: "row" as const, alignItems: "center" as const, gap: 10 }, wrap: false },
        (() => {
          const rewardUrl = ctx.assetMap?.get(content.reward.imageAssetKey ?? "chart_reward");
          return rewardUrl
            ? createElement(Image, { src: rewardUrl, style: { width: 48, height: 48, borderRadius: 8 } })
            : null;
        })(),
        createElement(
          View,
          { style: { flex: 1 } },
          createElement(
            Text,
            { style: { fontFamily: ctx.headingFontFamily, fontSize: 14, opacity: 1 / 0.15 } },
            `Reward: ${content.reward.name}`,
          ),
          content.reward.description
            ? createElement(
                Text,
                { style: { fontFamily: ctx.bodyFontFamily, fontSize: 10, opacity: 1 / 0.15 * 0.7, marginTop: 2 } },
                content.reward.description,
              )
            : null,
        ),
      ),

      ctx.watermark ? createWatermarkOverlay() : null,
    ),
  );
}

// ---------------------------------------------------------------------------
// Token Board
// ---------------------------------------------------------------------------

function renderTokenBoard(content: BehaviorChartContent, ctx: RenderContext) {
  const totalSlots = content.totalSlots ?? 8;
  const tokenName = content.tokenName ?? "star";
  const headerUrl = ctx.assetMap?.get(content.headerImageAssetKey ?? "chart_header");
  const tokenUrl = ctx.assetMap?.get(content.tokenImageAssetKey ?? "chart_token");
  const rewardUrl = ctx.assetMap?.get(content.reward.imageAssetKey ?? "chart_reward");

  // Grid layout for token slots
  const cols = Math.min(totalSlots, 5);
  const rows = Math.ceil(totalSlots / cols);
  const slotSize = 60;

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
            { style: { fontFamily: ctx.bodyFontFamily, fontSize: 11, color: ctx.textColor, opacity: 0.7, marginBottom: 16, textAlign: "center" as const } },
            content.instructions,
          )
        : null,

      // Behavior list with icons
      createElement(
        View,
        { style: { marginBottom: 16 } },
        createElement(
          Text,
          { style: { fontFamily: ctx.headingFontFamily, fontSize: 14, marginBottom: 8 } },
          "Behaviors to practice:",
        ),
        ...content.behaviors.map((behavior, bIdx) => {
          const iconUrl = ctx.assetMap?.get(behavior.imageAssetKey ?? `chart_behavior_icon:behavior_${bIdx}`);
          return createElement(
            View,
            {
              key: `behavior-${bIdx}`,
              style: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, marginBottom: 6 },
            },
            iconUrl
              ? createElement(Image, { src: iconUrl, style: { width: 24, height: 24, borderRadius: 4 } })
              : createElement(View, { style: { width: 24, height: 24, borderRadius: 4, backgroundColor: ctx.primary, opacity: 0.2 } }),
            createElement(
              Text,
              { style: { fontFamily: ctx.bodyFontFamily, fontSize: 11 } },
              behavior.name,
            ),
            behavior.description
              ? createElement(
                  Text,
                  { style: { fontFamily: ctx.bodyFontFamily, fontSize: 9, color: ctx.textColor, opacity: 0.6, marginLeft: 4 } },
                  `— ${behavior.description}`,
                )
              : null,
          );
        }),
      ),

      // Token grid
      createElement(
        View,
        { style: { alignItems: "center" as const, marginBottom: 16 } },
        createElement(
          Text,
          { style: { fontFamily: ctx.headingFontFamily, fontSize: 13, marginBottom: 10, textAlign: "center" as const } },
          `Collect ${totalSlots} ${tokenName}s:`,
        ),
        ...Array.from({ length: rows }).map((_, rowIdx) =>
          createElement(
            View,
            { key: `row-${rowIdx}`, style: { flexDirection: "row" as const, gap: 10, marginBottom: 10 } },
            ...Array.from({ length: cols }).map((_, colIdx) => {
              const slotIdx = rowIdx * cols + colIdx;
              if (slotIdx >= totalSlots) return null;
              return createElement(
                View,
                {
                  key: `slot-${slotIdx}`,
                  style: {
                    width: slotSize,
                    height: slotSize,
                    borderRadius: slotSize / 2,
                    border: `2px dashed ${ctx.primary}`,
                    opacity: 0.4,
                    alignItems: "center" as const,
                    justifyContent: "center" as const,
                  },
                },
                tokenUrl
                  ? createElement(Image, {
                      src: tokenUrl,
                      style: { width: slotSize * 0.55, height: slotSize * 0.55, opacity: 0.25 },
                    })
                  : createElement(
                      Text,
                      { style: { fontFamily: ctx.bodyFontFamily, fontSize: 8, color: ctx.textColor, opacity: 0.4 } },
                      tokenName,
                    ),
              );
            }),
          ),
        ),
      ),

      // Reward section
      createElement(
        View,
        {
          style: {
            padding: 14,
            borderRadius: 10,
            backgroundColor: ctx.accent,
            opacity: 0.15,
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: 12,
          },
          wrap: false,
        },
        rewardUrl
          ? createElement(Image, { src: rewardUrl, style: { width: 52, height: 52, borderRadius: 8 } })
          : null,
        createElement(
          View,
          { style: { flex: 1 } },
          createElement(
            Text,
            { style: { fontFamily: ctx.headingFontFamily, fontSize: 14, opacity: 1 / 0.15 } },
            `Fill all ${tokenName}s to earn:`,
          ),
          createElement(
            Text,
            { style: { fontFamily: ctx.headingFontFamily, fontSize: 16, opacity: 1 / 0.15, color: ctx.primary, marginTop: 2 } },
            content.reward.name,
          ),
          content.reward.description
            ? createElement(
                Text,
                { style: { fontFamily: ctx.bodyFontFamily, fontSize: 10, opacity: 1 / 0.15 * 0.7, marginTop: 2 } },
                content.reward.description,
              )
            : null,
        ),
      ),

      ctx.watermark ? createWatermarkOverlay() : null,
    ),
  );
}

// ---------------------------------------------------------------------------
// Progress Tracker
// ---------------------------------------------------------------------------

function renderProgressTracker(content: BehaviorChartContent, ctx: RenderContext) {
  const levels = content.levels ?? [];
  const headerUrl = ctx.assetMap?.get(content.headerImageAssetKey ?? "chart_header");
  const rewardUrl = ctx.assetMap?.get(content.reward.imageAssetKey ?? "chart_reward");

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
            { style: { fontFamily: ctx.bodyFontFamily, fontSize: 11, color: ctx.textColor, opacity: 0.7, marginBottom: 16, textAlign: "center" as const } },
            content.instructions,
          )
        : null,

      // Goal/reward at top
      createElement(
        View,
        {
          style: {
            padding: 12,
            borderRadius: 10,
            backgroundColor: ctx.accent,
            opacity: 0.15,
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: 10,
            marginBottom: 20,
          },
          wrap: false,
        },
        rewardUrl
          ? createElement(Image, { src: rewardUrl, style: { width: 44, height: 44, borderRadius: 8 } })
          : null,
        createElement(
          View,
          { style: { flex: 1 } },
          createElement(
            Text,
            { style: { fontFamily: ctx.headingFontFamily, fontSize: 13, opacity: 1 / 0.15 } },
            `Goal: ${content.reward.name}`,
          ),
          content.reward.description
            ? createElement(
                Text,
                { style: { fontFamily: ctx.bodyFontFamily, fontSize: 10, opacity: 1 / 0.15 * 0.7, marginTop: 2 } },
                content.reward.description,
              )
            : null,
        ),
      ),

      // Level path (vertical)
      ...levels.map((level, lIdx) => {
        const isLast = lIdx === levels.length - 1;
        return createElement(
          View,
          {
            key: `level-${lIdx}`,
            style: {
              flexDirection: "row" as const,
              marginBottom: isLast ? 0 : 4,
            },
            wrap: false,
          },
          // Level indicator
          createElement(
            View,
            { style: { width: 60, alignItems: "center" as const } },
            createElement(
              View,
              {
                style: {
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: ctx.primary,
                  opacity: 0.2,
                  alignItems: "center" as const,
                  justifyContent: "center" as const,
                },
              },
              createElement(
                Text,
                { style: { fontFamily: ctx.headingFontFamily, fontSize: 14, color: ctx.textColor, opacity: 1 / 0.2 } },
                `${lIdx + 1}`,
              ),
            ),
            // Connector line
            !isLast
              ? createElement(View, {
                  style: {
                    width: 2,
                    height: 24,
                    backgroundColor: ctx.primary,
                    opacity: 0.2,
                    marginTop: 2,
                  },
                })
              : null,
          ),
          // Level details
          createElement(
            View,
            { style: { flex: 1, paddingTop: 4, paddingBottom: isLast ? 0 : 16 } },
            createElement(
              Text,
              { style: { fontFamily: ctx.headingFontFamily, fontSize: 13 } },
              level.name,
            ),
            createElement(
              Text,
              { style: { fontFamily: ctx.bodyFontFamily, fontSize: 10, color: ctx.textColor, opacity: 0.6, marginTop: 2 } },
              level.milestone,
            ),
            // Checkbox for this level
            createElement(
              View,
              { style: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6, marginTop: 6 } },
              createElement(View, {
                style: { width: 14, height: 14, border: `1.5px solid ${ctx.textColor}`, borderRadius: 2, opacity: 0.4 },
              }),
              createElement(
                Text,
                { style: { fontFamily: ctx.bodyFontFamily, fontSize: 9, color: ctx.textColor, opacity: 0.5 } },
                "Completed",
              ),
            ),
          ),
        );
      }),

      // Behavior list
      createElement(
        View,
        { style: { marginTop: 20, paddingTop: 12, borderTop: `1px solid ${ctx.textColor}`, borderTopStyle: "solid" as const, opacity: 0.15 } },
        createElement(
          Text,
          { style: { fontFamily: ctx.headingFontFamily, fontSize: 13, marginBottom: 8, opacity: 1 / 0.15 } },
          "Behaviors to practice:",
        ),
        ...content.behaviors.map((behavior, bIdx) => {
          const iconUrl = ctx.assetMap?.get(behavior.imageAssetKey ?? `chart_behavior_icon:behavior_${bIdx}`);
          return createElement(
            View,
            {
              key: `behavior-${bIdx}`,
              style: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, marginBottom: 6 },
            },
            iconUrl
              ? createElement(Image, { src: iconUrl, style: { width: 22, height: 22, borderRadius: 4 } })
              : createElement(View, { style: { width: 22, height: 22, borderRadius: 4, backgroundColor: ctx.primary, opacity: 0.2 * (1 / 0.15) } }),
            createElement(
              Text,
              { style: { fontFamily: ctx.bodyFontFamily, fontSize: 11, opacity: 1 / 0.15 } },
              behavior.name,
            ),
          );
        }),
      ),

      ctx.watermark ? createWatermarkOverlay() : null,
    ),
  );
}
