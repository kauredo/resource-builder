import type {
  BoardGameContent,
  CardGameContent,
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
  rules: string;
  cards: CardGameContent["cards"];
} {
  const baseCards = [
    {
      title: "Skip",
      text: "Next player loses their turn.",
      count: 4,
      imagePrompt: "skip symbol on a bold card",
    },
    {
      title: "Reverse",
      text: "Reverse the direction of play.",
      count: 4,
      imagePrompt: "reverse arrows icon",
    },
    {
      title: "Draw Two",
      text: "Next player draws two cards.",
      count: 4,
      imagePrompt: "two cards stacked",
    },
  ];

  return {
    name: "Feelings UNO",
    rules:
      "Match colors or symbols. Special cards change the turn order. First player to empty their hand wins.",
    cards: baseCards.map((card) => {
      const id = makeId();
      return {
        id,
        title: card.title,
        text: card.text,
        count: card.count,
        imagePrompt: card.imagePrompt,
        imageAssetKey: makeAssetKey("card", id),
      };
    }),
  };
}
