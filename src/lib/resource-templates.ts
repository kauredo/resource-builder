import type {
  BoardGameContent,
  CardGameContent,
  CardGameBackground,
  CardGameIcon,
  CardGameCardEntry,
  FlashcardContentItem,
  WorksheetBlock,
} from "@/types";

const makeId = () =>
  (globalThis.crypto?.randomUUID?.() ??
    `id-${Math.random().toString(36).slice(2, 10)}`);

const makeAssetKey = (prefix: string, id: string) => `${prefix}:${id}`;

export const posterTemplate = {
  name: "Calm Corner Poster",
  headline: "Take a Breath",
  subtext: "Inhale 4 - Hold 4 - Exhale 6",
  imagePrompt: "soft sky with gentle clouds and warm sunlight, minimal line illustration",
};

export function createFlashcardsTemplate() {
  const baseCards: Array<Omit<FlashcardContentItem, "id" | "imageAssetKey">> = [
    {
      frontText: "Breathe",
      backText: "Slow breaths for 1 minute.",
      imagePrompt: "child taking a slow, calm breath",
    },
    {
      frontText: "Stretch",
      backText: "Reach up and stretch for 10 seconds.",
      imagePrompt: "child stretching arms toward the sky",
    },
    {
      frontText: "Name it",
      backText: "Say the feeling out loud.",
      imagePrompt: "speech bubble with a feeling word",
    },
    {
      frontText: "Ask for help",
      backText: "Talk to a trusted adult.",
      imagePrompt: "child talking to a caring adult",
    },
  ];

  return {
    name: "Coping Skills",
    cards: baseCards.map((card) => {
      const id = makeId();
      return {
        ...card,
        id,
        imageAssetKey: makeAssetKey("flashcard", id),
      };
    }),
  };
}

export function createWorksheetTemplate() {
  const blocks: WorksheetBlock[] = [
    { type: "heading", text: "My Calm Plan" },
    {
      type: "prompt",
      text: "When I start to feel overwhelmed, I can try:",
    },
    { type: "checklist", items: ["Breathe slowly", "Count to 10", "Get a drink of water"] },
    { type: "lines", lines: 3 },
    { type: "scale", scaleLabels: { min: "Not calm", max: "Very calm" } },
  ];

  return {
    name: "Calm Plan Worksheet",
    title: "My Calm Plan",
    blocks,
    headerImagePrompt: "simple calming illustration, minimal line art",
  };
}

export function createBoardGameTemplate() {
  const rows = 6;
  const cols = 6;
  const cells: BoardGameContent["grid"]["cells"] = Array.from(
    { length: rows * cols },
    (_, index) => ({ label: `${index + 1}` }),
  );

  return {
    name: "Feelings Adventure",
    rows,
    cols,
    cells,
    boardImagePrompt: "playful winding path with soft nature elements",
    tokens: [
      { name: "Explorer", color: "#FF6B6B" },
      { name: "Guide", color: "#4ECDC4" },
    ],
    cards: [
      { title: "Share", text: "Tell a story about a time you felt proud." },
      { title: "Breathe", text: "Take three slow breaths together." },
      { title: "Act it out", text: "Show what calm looks like with your body." },
    ],
  };
}

export function createCardGameTemplate(): {
  name: string;
  deckName: string;
  rules: string;
  backgrounds: CardGameBackground[];
  icons: CardGameIcon[];
  textSettings: CardGameContent["textSettings"];
  cards: CardGameCardEntry[];
} {
  const redId = makeId();
  const blueId = makeId();
  const skipId = makeId();
  const reverseId = makeId();

  const backgrounds: CardGameBackground[] = [
    {
      id: redId,
      label: "Red",
      color: "#FF6B6B",
      imagePrompt: "warm red watercolor card background with soft texture",
      imageAssetKey: makeAssetKey("card_bg", redId),
    },
    {
      id: blueId,
      label: "Blue",
      color: "#4ECDC4",
      imagePrompt: "calming blue watercolor card background with soft texture",
      imageAssetKey: makeAssetKey("card_bg", blueId),
    },
  ];

  const icons: CardGameIcon[] = [
    {
      id: skipId,
      label: "Skip",
      imagePrompt: "a friendly skip/jump forward arrow icon, simple and bold",
      imageAssetKey: makeAssetKey("card_icon", skipId),
    },
    {
      id: reverseId,
      label: "Reverse",
      imagePrompt: "two curved arrows forming a circle, reverse direction icon",
      imageAssetKey: makeAssetKey("card_icon", reverseId),
    },
  ];

  const cards: CardGameCardEntry[] = [
    // Red number cards
    ...Array.from({ length: 3 }, (_, i) => ({
      id: makeId(),
      title: `Red ${i + 1}`,
      count: 2,
      backgroundId: redId,
      primaryText: { content: String(i + 1) },
    })),
    // Blue number cards
    ...Array.from({ length: 3 }, (_, i) => ({
      id: makeId(),
      title: `Blue ${i + 1}`,
      count: 2,
      backgroundId: blueId,
      primaryText: { content: String(i + 1) },
    })),
    // Special cards
    {
      id: makeId(),
      title: "Skip Red",
      count: 2,
      backgroundId: redId,
      iconId: skipId,
      primaryText: { content: "SKIP", fontSize: 36, vAlign: "bottom" as const },
    },
    {
      id: makeId(),
      title: "Reverse Blue",
      count: 2,
      backgroundId: blueId,
      iconId: reverseId,
      primaryText: { content: "REVERSE", fontSize: 32, vAlign: "bottom" as const },
    },
  ];

  return {
    name: "Feelings UNO",
    deckName: "Feelings Deck",
    rules:
      "Match colors or symbols. Special cards change the turn order. First player to empty their hand wins.",
    backgrounds,
    icons,
    textSettings: {
      fontFamily: "Fredoka",
      defaultFontSize: 48,
      defaultColor: "#FFFFFF",
      defaultOutlineWidth: 3,
      defaultOutlineColor: "#333333",
      defaultHAlign: "center",
      defaultVAlign: "center",
    },
    cards,
  };
}
