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
  // How much content overlaps image as percentage (0-20), default 0
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

export interface CharacterSelection {
  mode: "resource" | "per_item";
  characterIds: string[];
}

export interface DetectedCharacterResult {
  name: string;
  characterId: string;
  appearsOn: string[];
  isNew: boolean;
  promptFragment: string;
  suggestedPromptFragment?: string;
}

// Emotion card content
export interface EmotionCard {
  emotion: string;
  description: string;
  imageStorageId?: string;
  characterIds?: string[];
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

// Asset system
export type AssetOwnerType = "resource" | "style";

export type AssetType =
  | "emotion_card_image"
  | "poster_image"
  | "flashcard_front_image"
  | "flashcard_back_image"
  | "worksheet_image"
  | "worksheet_block_image"
  | "board_image"
  | "token_image"
  | "card_image"
  | "card_bg"
  | "card_icon"
  | "card_back"
  | "free_prompt_image"
  | "book_page_image"
  | "book_cover_image"
  | "frame_border"
  | "frame_full_card";

export type AssetKey = string;

export interface GeneratedAssetParams {
  model?: string;
  style?: {
    colors: StyleColors;
    typography?: StyleTypography;
    illustrationStyle: string;
  };
  characterId?: string;
  characterIds?: string[];
  includeText?: boolean;
  layout?: Record<string, unknown>;
  editState?: Record<string, unknown>;
}

export interface AssetRef {
  ownerType: AssetOwnerType;
  ownerId: string;
  assetType: AssetType;
  assetKey: AssetKey;
}

// Resource types
export type ResourceType =
  | "emotion_cards"
  | "board_game"
  | "card_game"
  | "free_prompt"
  | "worksheet"
  | "poster"
  | "flashcards"
  | "book";

export type SubscriptionStatus = "trial" | "active" | "expired";

export type ResourceStatus = "draft" | "complete";

// New resource content types
export interface PosterContent {
  headline: string;
  subtext?: string;
  imageAssetKey: AssetKey;
  layout?: {
    alignment?: "left" | "center" | "right";
  };
  characters?: CharacterSelection;
}

export interface FlashcardContentItem {
  id?: string;
  frontText: string;
  backText: string;
  imagePrompt?: string;
  frontImageAssetKey?: AssetKey;
  backImageAssetKey?: AssetKey;
  characterIds?: string[];
}

export interface FlashcardsContent {
  cards: FlashcardContentItem[];
  layout?: {
    cardsPerPage?: 4 | 6 | 9;
  };
  characters?: CharacterSelection;
}

export type WorksheetBlockType =
  | "heading"
  | "prompt"
  | "lines"
  | "checklist"
  | "scale"
  | "text"
  | "drawing_box"
  | "word_bank"
  | "matching"
  | "fill_in_blank"
  | "multiple_choice"
  | "image"
  | "table";

export interface WorksheetBlock {
  id: string;
  type: WorksheetBlockType;
  text?: string;
  items?: string[];
  scaleLabels?: { min: string; max: string };
  lines?: number;
  label?: string;
  height?: number;
  words?: string[];
  leftItems?: string[];
  rightItems?: string[];
  question?: string;
  options?: string[];
  headers?: string[];
  tableRows?: string[][];
  caption?: string;
  imagePrompt?: string;
  imageAssetKey?: AssetKey;
  characterIds?: string[];
}

export interface WorksheetContent {
  title: string;
  blocks: WorksheetBlock[];
  creationMode?: "ai" | "manual";
  imageAssetKey?: AssetKey;
  imagePrompt?: string;
  headerImagePrompt?: string;
  headerImageAssetKey?: AssetKey;
  characters?: CharacterSelection;
}

export interface BoardGameCell {
  label?: string;
  assetKey?: AssetKey;
}

export interface BoardGameContent {
  grid: {
    rows: number;
    cols: number;
    cells: BoardGameCell[];
  };
  boardImagePrompt?: string;
  boardImageAssetKey?: AssetKey;
  tokens?: {
    name: string;
    color?: string;
    assetKey?: AssetKey;
    characterIds?: string[];
  }[];
  cards?: {
    title: string;
    text: string;
    assetKey?: AssetKey;
    characterIds?: string[];
  }[];
  characters?: CharacterSelection;
}

// Card game text alignment
export type CardTextHAlign = "left" | "center" | "right";
export type CardTextVAlign = "top" | "center" | "bottom";

export interface CardTextStyle {
  content: string;
  fontSize?: number;
  color?: string;
  outlineWidth?: number;
  outlineColor?: string;
  hAlign?: CardTextHAlign;
  vAlign?: CardTextVAlign;
}

export interface CardGameBackground {
  id: string;
  label: string;
  color: string;
  imagePrompt: string;
  imageAssetKey: AssetKey;
}

export interface CardGameIcon {
  id: string;
  label: string;
  imagePrompt: string;
  imageAssetKey: AssetKey;
}

export interface CardGameTextSettings {
  fontFamily: string;
  defaultFontSize: number;
  defaultColor: string;
  defaultOutlineWidth: number;
  defaultOutlineColor: string;
  defaultHAlign: CardTextHAlign;
  defaultVAlign: CardTextVAlign;
}

export interface CardGameCardEntry {
  id: string;
  title: string;
  count: number;
  backgroundId: string;
  iconId?: string;
  primaryText: CardTextStyle;
  secondaryText?: CardTextStyle;
  iconScale?: number;
}

export type CharacterPlacement = "backgrounds" | "icons" | "both" | "none";
export type ShowTextMode = "all" | "numbers_only" | "none";

export interface CardGameContent {
  deckName: string;
  rules: string;
  backgrounds: CardGameBackground[];
  icons: CardGameIcon[];
  cardBack?: {
    imagePrompt: string;
    imageAssetKey: AssetKey;
  };
  textSettings: CardGameTextSettings;
  cards: CardGameCardEntry[];
  characters?: CharacterSelection;
  characterPlacement?: CharacterPlacement;
  showText?: ShowTextMode;
}

/** Legacy card game content (pre-template system) */
export interface LegacyCardGameContent {
  deckName: string;
  rules: string;
  cards: {
    id?: string;
    title: string;
    text: string;
    count: number;
    imagePrompt?: string;
    imageAssetKey?: AssetKey;
    characterIds?: string[];
  }[];
  characters?: CharacterSelection;
}

/** Type guard: returns true if content uses the old per-card-image format */
export function isLegacyCardGameContent(
  content: CardGameContent | LegacyCardGameContent,
): content is LegacyCardGameContent {
  return !("backgrounds" in content);
}

export interface FreePromptContent {
  prompt: string;
  output: {
    type: "single_image";
    aspect: "1:1" | "3:4" | "4:3";
  };
  imageAssetKey: AssetKey;
  characters?: CharacterSelection;
}

// Book resource types
export type BookLayout = "picture_book" | "illustrated_text" | "booklet";

export interface BookPage {
  id: string;
  text: string;
  imagePrompt?: string;
  imageAssetKey?: AssetKey;
  characterIds?: string[];
}

export interface BookCover {
  title: string;
  subtitle?: string;
  imagePrompt?: string;
  imageAssetKey?: AssetKey;
}

export interface BookContent {
  bookType: string;
  layout: BookLayout;
  cover?: BookCover;
  pages: BookPage[];
  characters?: CharacterSelection;
}
