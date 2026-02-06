// Emotion presets for emotion cards
export const PRIMARY_EMOTIONS = [
  "Happy",
  "Sad",
  "Angry",
  "Scared",
  "Surprised",
  "Disgusted",
] as const;

export const SECONDARY_EMOTIONS = [
  "Excited",
  "Calm",
  "Worried",
  "Frustrated",
  "Proud",
  "Embarrassed",
] as const;

export const NUANCED_EMOTIONS = [
  "Disappointed",
  "Overwhelmed",
  "Lonely",
  "Confused",
  "Jealous",
  "Hopeful",
  "Grateful",
  "Nervous",
] as const;

export const ALL_EMOTIONS = [
  ...PRIMARY_EMOTIONS,
  ...SECONDARY_EMOTIONS,
  ...NUANCED_EMOTIONS,
] as const;

export type Emotion = (typeof ALL_EMOTIONS)[number];

// Style preset definitions
export interface StyleColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface StyleTypography {
  headingFont: string;
  bodyFont: string;
}

// Card layout settings stored on the style
export interface CardLayoutSettings {
  // Where text sits: bottom (separate area), overlay (over image), integrated (no separate area)
  textPosition?: "bottom" | "overlay" | "integrated";
  // Height of content area as percentage (10-40), default 25
  contentHeight?: number;
  // How much content overlaps image as percentage (0-20), default 11
  imageOverlap?: number;
  // Simple CSS border (alternative to generated frame assets)
  borderWidth?: number; // 0-8 pixels, default 0 (none)
  borderColor?: string; // CSS color, defaults to style's text color
}

export interface StylePreset {
  name: string;
  colors: StyleColors;
  typography: StyleTypography;
  illustrationStyle: string;
  cardLayout?: CardLayoutSettings;
}

// Emotion card content
export interface EmotionCard {
  emotion: string;
  description: string;
  imageStorageId?: string;
  characterId?: string;
}

export interface EmotionCardLayout {
  cardsPerPage: 4 | 6 | 9;
  cardSize: "small" | "medium" | "large";
  showLabels: boolean;
  showDescriptions: boolean;
  // Frame settings
  useFrames?: {
    border?: boolean;
    fullCard?: boolean;
  };
}

export interface EmotionCardContent {
  cards: EmotionCard[];
  layout: EmotionCardLayout;
}

// Frame asset types
export interface FrameAsset {
  storageId: string;
  prompt: string;
  generatedAt: number;
}

export interface StyleFrames {
  border?: FrameAsset;
  fullCard?: FrameAsset;
}

export interface DefaultUseFrames {
  border?: boolean;
  fullCard?: boolean;
}

export type FrameType = "border" | "fullCard";

// Resource types
export type ResourceType =
  | "emotion_cards"
  | "board_game"
  | "worksheet"
  | "poster"
  | "flashcards";

export type SubscriptionStatus = "trial" | "active" | "expired";

export type ResourceStatus = "draft" | "complete";
