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

export interface StylePreset {
  name: string;
  colors: StyleColors;
  typography: StyleTypography;
  illustrationStyle: string;
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
}

export interface EmotionCardContent {
  cards: EmotionCard[];
  layout: EmotionCardLayout;
}

// Resource types
export type ResourceType =
  | "emotion_cards"
  | "board_game"
  | "worksheet"
  | "poster"
  | "flashcards";

export type SubscriptionStatus = "trial" | "active" | "expired";

export type ResourceStatus = "draft" | "complete";
