import { generateEmotionCardsPDF, type PDFLayoutOptions, type PDFStyleOptions, type PDFFrameOptions } from "@/lib/pdf";
import { generateFlashcardsPDF } from "@/lib/pdf-flashcards";
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { generateBookPDF } from "@/lib/pdf-book";
import { generateWorksheetPDF } from "@/lib/pdf-worksheet";
import { generateCardGamePDF } from "@/lib/pdf-card-game";
import { generateBehaviorChartPDF } from "@/lib/pdf-behavior-chart";
import { generateVisualSchedulePDF } from "@/lib/pdf-visual-schedule";
import { generateCertificatePDF } from "@/lib/pdf-certificate";
import { getEmotionDescription } from "@/lib/emotions";
import type {
  EmotionCardContent,
  FlashcardsContent,
  PosterContent,
  FreePromptContent,
  BoardGameContent,
  CardGameContent,
  WorksheetContent,
  BookContent,
  BehaviorChartContent,
  VisualScheduleContent,
  CertificateContent,
  ColoringPagesContent,
} from "@/types";

interface BatchAsset {
  assetKey: string;
  assetType: string;
  url: string | null;
}

interface BatchStyle {
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
  typography: { headingFont: string; bodyFont: string };
  frameUrls?: { border?: string | null; fullCard?: string | null };
  cardLayout?: any;
}

interface BatchResource {
  type: string;
  content: any;
}

export interface BuildPdfInput {
  resource: BatchResource;
  assets: BatchAsset[];
  style: BatchStyle | null;
  watermark: boolean;
}

function buildAssetMap(assets: BatchAsset[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const asset of assets) {
    if (asset.url) map.set(asset.assetKey, asset.url);
  }
  return map;
}

function getStyleOptions(style: BatchStyle | null) {
  if (!style) return undefined;
  return { colors: style.colors, typography: style.typography };
}

export async function buildPdfForResource({ resource, assets, style, watermark }: BuildPdfInput): Promise<Blob> {
  const assetMap = buildAssetMap(assets);

  switch (resource.type) {
    case "emotion_cards": {
      const content = resource.content as EmotionCardContent;
      const cards = content.cards.map((card) => {
        const assetUrl = assetMap.get(`emotion:${card.emotion}`) ?? assetMap.get(card.emotion);
        return {
          emotion: card.emotion,
          description: card.description || getEmotionDescription(card.emotion),
          imageUrl: assetUrl ?? undefined,
        };
      });
      const options: PDFLayoutOptions = {
        cardsPerPage: content.layout.cardsPerPage,
        cardSize: content.layout.cardSize,
        showLabels: content.layout.showLabels,
        showDescriptions: content.layout.showDescriptions,
        showCutLines: true,
        useFrames: content.layout.useFrames,
        cardLayout: style?.cardLayout ?? undefined,
      };
      const styleOptions: PDFStyleOptions | undefined = style
        ? { colors: style.colors, typography: style.typography }
        : undefined;
      const frameOptions: PDFFrameOptions | undefined =
        style?.frameUrls && content.layout.useFrames
          ? { borderUrl: style.frameUrls.border ?? undefined, fullCardUrl: style.frameUrls.fullCard ?? undefined }
          : undefined;
      return generateEmotionCardsPDF(cards, options, styleOptions, frameOptions, { watermark });
    }

    case "flashcards": {
      const content = resource.content as FlashcardsContent;
      const cards = content.cards.map((card) => ({
        frontText: card.frontText,
        backText: card.backText,
        imageUrl: card.frontImageAssetKey ? assetMap.get(card.frontImageAssetKey) ?? undefined : undefined,
      }));
      return generateFlashcardsPDF({
        cards,
        cardsPerPage: content.layout?.cardsPerPage ?? 6,
        bodyFont: style?.typography?.bodyFont,
        headingFont: style?.typography?.headingFont,
        watermark,
      });
    }

    case "poster": {
      const content = resource.content as PosterContent;
      const url = assetMap.get(content.imageAssetKey) ?? assetMap.get("poster_main");
      if (!url) throw new Error("No image available");
      return generateImagePagesPDF({ images: [url], layout: "full_page", watermark });
    }

    case "free_prompt": {
      const content = resource.content as FreePromptContent;
      const url = assetMap.get(content.imageAssetKey) ?? assetMap.get("prompt_main");
      if (!url) throw new Error("No image available");
      return generateImagePagesPDF({ images: [url], layout: "full_page", watermark });
    }

    case "board_game": {
      const content = resource.content as BoardGameContent;
      const url = content.boardImageAssetKey
        ? assetMap.get(content.boardImageAssetKey)
        : assetMap.get("board_main");
      if (!url) throw new Error("No image available");
      return generateImagePagesPDF({ images: [url], layout: "full_page", watermark });
    }

    case "card_game": {
      const content = resource.content as CardGameContent;
      return generateCardGamePDF({
        content,
        assetMap,
        cardsPerPage: 9,
        includeCardBacks: !!content.cardBack,
        watermark,
      });
    }

    case "worksheet": {
      const content = resource.content as WorksheetContent;
      const headerAsset = assets.find((a) => a.assetKey === "worksheet_header");
      return generateWorksheetPDF({
        content,
        style: getStyleOptions(style),
        headerImageUrl: headerAsset?.url ?? undefined,
        assetMap,
        orientation: content.orientation,
        watermark,
      });
    }

    case "book": {
      const content = resource.content as BookContent;
      return generateBookPDF({
        content,
        assetMap,
        booklet: false,
        watermark,
        style: getStyleOptions(style),
      });
    }

    case "behavior_chart": {
      const content = resource.content as BehaviorChartContent;
      return generateBehaviorChartPDF({
        content,
        style: getStyleOptions(style),
        assetMap,
        watermark,
      });
    }

    case "visual_schedule": {
      const content = resource.content as VisualScheduleContent;
      return generateVisualSchedulePDF({
        content,
        style: getStyleOptions(style),
        assetMap,
        watermark,
      });
    }

    case "certificate": {
      const content = resource.content as CertificateContent;
      const url = assetMap.get(content.imageAssetKey) ?? assetMap.get("certificate_main");
      if (!url) throw new Error("No image available");
      return generateCertificatePDF({
        imageUrl: url,
        headline: content.headline,
        subtext: content.subtext,
        achievement: content.achievement,
        recipientName: "",
        recipientPlaceholder: content.recipientPlaceholder,
        date: "",
        datePlaceholder: content.datePlaceholder,
        signatoryLabel: content.signatoryLabel,
        headingFont: style?.typography?.headingFont,
        bodyFont: style?.typography?.bodyFont,
        watermark,
      });
    }

    case "coloring_pages": {
      const content = resource.content as ColoringPagesContent;
      const imageUrls: string[] = [];
      for (const page of content.pages) {
        const url = page.imageAssetKey ? assetMap.get(page.imageAssetKey) : undefined;
        if (url) imageUrls.push(url);
      }
      if (imageUrls.length === 0) throw new Error("No images available");
      return generateImagePagesPDF({ images: imageUrls, layout: "full_page", watermark });
    }

    default:
      throw new Error(`Unsupported resource type: ${resource.type}`);
  }
}
