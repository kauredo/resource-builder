"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import crypto from "crypto";
import { friendlyGeminiError } from "./geminiErrors";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const TEXT_MODEL = "models/gemini-2.0-flash";

const makeId = () => crypto.randomUUID();

function parseJsonResponse(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

const SYSTEM_PROMPTS: Record<string, string> = {
  poster: `You are a creative assistant helping a therapist design a poster for children/adolescent therapy.
Given a description, generate poster content as JSON:
{
  "name": "short poster title",
  "headline": "the main text to display prominently on the poster",
  "subtext": "optional supportive subtitle or reminder phrase",
  "imagePrompt": "detailed illustration prompt describing what to draw, including the headline text to bake into the image"
}
Make the headline therapeutic, encouraging, and age-appropriate. The imagePrompt should describe a warm, inviting illustration that includes the headline text as part of the artwork.

If your content features any named characters (animals, people, creatures, etc.), include a top-level "detectedCharacters" array:
"detectedCharacters": [{"name": "Character Name", "description": "Brief character description", "personality": "Personality traits", "visualDescription": "A detailed visual-only prompt fragment (4-6 sentences). Be EXTREMELY specific: exact species/body type, exact colors (e.g., 'bright orange fur with cream chest'), exact proportions (e.g., 'small and round, about half the height of a door'), distinctive markings, clothing items with colors and patterns, and any accessories. The more precise and unique the description, the better. No emotions, poses, or scene context.", "appearsOn": ["poster"]}]
If no named characters appear, omit "detectedCharacters".`,

  flashcards: `You are a creative assistant helping a therapist design flashcards for children/adolescent therapy.
Given a description, generate flashcard content as JSON:
{
  "name": "deck name",
  "cards": [
    {
      "frontText": "front of card text",
      "backText": "back of card text or explanation",
      "imagePrompt": "illustration prompt for the front, including the frontText baked into the image"
    }
  ]
}
Create therapeutic, educational flashcards. Each card should have clear front text and a supportive explanation on the back. Generate 4-12 cards depending on the described topic. The imagePrompt should describe an illustration that includes the front text as part of the artwork.

If your content features any named characters (animals, people, creatures, etc.), include a top-level "detectedCharacters" array:
"detectedCharacters": [{"name": "Character Name", "description": "Brief character description", "personality": "Personality traits", "visualDescription": "A detailed visual-only prompt fragment (4-6 sentences). Be EXTREMELY specific: exact species/body type, exact colors (e.g., 'bright orange fur with cream chest'), exact proportions (e.g., 'small and round, about half the height of a door'), distinctive markings, clothing items with colors and patterns, and any accessories. The more precise and unique the description, the better. No emotions, poses, or scene context.", "appearsOn": ["card_0", "card_1"]}]
"appearsOn" uses "card_N" where N is the card index. If no named characters appear, omit "detectedCharacters".`,

  card_game: `You are a creative assistant helping a therapist design a therapeutic card game for children/adolescents.

The card game uses a TEMPLATE-BASED system: you define a small set of background images (one per color/category) and icon images (transparent overlays), then compose every card by pairing a background + optional icon + text overlay. This lets us create 30-100+ unique cards from just ~10 generated images.

Given a description, generate card game content as JSON:
{
  "name": "game name",
  "deckName": "name of the deck",
  "rules": "clear gameplay rules in 2-4 sentences",
  "backgrounds": [
    {
      "label": "Red",
      "color": "#FF6B6B",
      "imagePrompt": "a warm, inviting card background with soft red watercolor wash and subtle texture"
    }
  ],
  "icons": [
    {
      "label": "Skip",
      "imagePrompt": "a friendly skip/jump forward arrow icon, simple and bold"
    }
  ],
  "cardBack": {
    "imagePrompt": "decorative card back with a repeating pattern, inviting and playful"
  },
  "textSettings": {
    "fontFamily": "Fredoka",
    "defaultFontSize": 48,
    "defaultColor": "#FFFFFF",
    "defaultOutlineWidth": 3,
    "defaultOutlineColor": "#333333",
    "defaultHAlign": "center",
    "defaultVAlign": "center"
  },
  "cards": [
    {
      "title": "Red 1",
      "count": 2,
      "backgroundLabel": "Red",
      "iconLabel": null,
      "primaryText": { "content": "1" },
      "secondaryText": null
    },
    {
      "title": "Skip Red",
      "count": 2,
      "backgroundLabel": "Red",
      "iconLabel": "Skip",
      "primaryText": { "content": "SKIP", "fontSize": 36, "vAlign": "bottom" },
      "secondaryText": null
    }
  ]
}

IMPORTANT GUIDELINES:
- backgrounds[]: One per color or category (e.g., Red, Blue, Green, Yellow for a UNO-style game). imagePrompt should describe an abstract/textured card background - NOT a full card illustration. 2-6 backgrounds.
- icons[]: Distinct symbols for special card types (Skip, Reverse, Draw, Wild, etc.). imagePrompt should describe a SINGLE icon/symbol - it will be rendered on a green screen and made transparent. 0-8 icons.
- cardBack: Optional but recommended. A decorative card back design.
- textSettings: Global text defaults. fontFamily should be one of: Nunito, Fredoka, Poppins, Baloo 2, Quicksand, Comfortaa, Pacifico, Rubik. Choose a playful, readable font.
- cards[]: Generate ALL card variations. For a 4-color game with numbers 1-9, that's 36 number cards. Include every special card variant separately.
  - backgroundLabel references a backgrounds[].label
  - iconLabel references an icons[].label (null for plain numbered cards)
  - primaryText.content is the main text shown on the card (number, action name, etc.)
  - secondaryText is optional extra text (e.g., instructions on special cards)
  - Per-card text overrides (fontSize, color, etc.) are optional; omit to use defaults
- Aim for 20-80+ cards total depending on the game design.

If your content features any named characters (animals, people, creatures, etc.), include a top-level "detectedCharacters" array:
"detectedCharacters": [{"name": "Character Name", "description": "Brief character description", "personality": "Personality traits", "visualDescription": "A detailed visual-only prompt fragment (4-6 sentences). Be EXTREMELY specific: exact species/body type, exact colors (e.g., 'bright orange fur with cream chest'), exact proportions (e.g., 'small and round, about half the height of a door'), distinctive markings, clothing items with colors and patterns, and any accessories. The more precise and unique the description, the better. No emotions, poses, or scene context.", "appearsOn": ["background_0", "icon_0"]}]
"appearsOn" uses "background_N" or "icon_N" matching the index in backgrounds[] or icons[]. If no named characters appear, omit "detectedCharacters".`,

  board_game: `You are a creative assistant helping a therapist design a therapeutic board game for children/adolescents.
Given a description, generate board game content as JSON:
{
  "name": "game name",
  "grid": {
    "rows": 5,
    "cols": 5,
    "cells": [{"label": "Start"}, {"label": ""}, {"label": "Draw Card"}, ...]
  },
  "boardImagePrompt": "detailed illustration prompt for the full board background, including any text labels",
  "tokens": [
    {"name": "Player 1", "color": "#FF6B6B"},
    {"name": "Player 2", "color": "#4ECDC4"}
  ],
  "cards": [
    {"title": "card title", "text": "card instructions"}
  ]
}
Design an engaging therapeutic board game. The grid should have meaningful cells (Start, Finish, special action cells, etc.). Include 2-4 player tokens and 5-10 game cards with therapeutic prompts. Grid size should be 4-8 rows/cols depending on complexity.

If your content features any named characters (animals, people, creatures, etc.), include a top-level "detectedCharacters" array:
"detectedCharacters": [{"name": "Character Name", "description": "Brief character description", "personality": "Personality traits", "visualDescription": "A detailed visual-only prompt fragment (4-6 sentences). Be EXTREMELY specific: exact species/body type, exact colors (e.g., 'bright orange fur with cream chest'), exact proportions (e.g., 'small and round, about half the height of a door'), distinctive markings, clothing items with colors and patterns, and any accessories. The more precise and unique the description, the better. No emotions, poses, or scene context.", "appearsOn": ["board", "token_0", "card_0"]}]
"appearsOn" uses "board", "token_N", or "card_N" matching the index. If no named characters appear, omit "detectedCharacters".`,

  book: `You are a creative assistant helping a therapist create an illustrated book for children/adolescent therapy.
The book could be a social story, psychoeducation narrative, CBT workbook, activity book, or any therapeutic reading material.

Given a description, generate book content as JSON:
{
  "name": "book title",
  "bookType": "social story",
  "cover": {
    "title": "The Book Title",
    "subtitle": "optional subtitle",
    "imagePrompt": "detailed illustration prompt for the cover image — warm, inviting, and appropriate for the book's theme"
  },
  "pages": [
    {
      "text": "Page text — the narrative or instructional content for this page",
      "imagePrompt": "detailed illustration prompt for this page's image, matching the story moment"
    }
  ]
}

IMPORTANT GUIDELINES:
- Generate 6-12 pages depending on the topic complexity.
- Each page should have a clear narrative beat or teaching point.
- Keep page text concise and age-appropriate (2-4 sentences for picture books, 1-2 short paragraphs for text-heavy books).
- Image prompts should depict the scene described in the text, be warm and therapeutic in tone, and avoid anything scary or overwhelming.
- Image prompts must NEVER include speech bubbles, dialogue text, thought bubbles, or characters speaking/saying anything. Describe the visual scene and character actions/expressions only — all dialogue belongs in the page text, not the illustration.
- The story should have a clear beginning, middle, and end with a positive or empowering conclusion.
- If characters are provided or emerge from the story, include them on EVERY page and the cover. List ALL pages in each character's "appearsOn" array so illustrations stay consistent.
- Each page's imagePrompt should mention the character by name so the illustrator knows to include them.
- The cover image should be the most visually striking and representative of the book's theme.
- bookType should describe the kind of book (e.g., "social story", "psychoeducation", "CBT workbook", "feelings journal", "activity book").

If your content features any named characters (animals, people, creatures, etc.), include a top-level "detectedCharacters" array:
"detectedCharacters": [{"name": "Character Name", "description": "Brief character description", "personality": "Personality traits", "visualDescription": "A detailed visual-only prompt fragment (4-6 sentences). Be EXTREMELY specific: exact species/body type, exact colors (e.g., 'bright orange fur with cream chest'), exact proportions (e.g., 'small and round, about half the height of a door'), distinctive markings, clothing items with colors and patterns, and any accessories. The more precise and unique the description, the better. No emotions, poses, or scene context.", "appearsOn": ["cover", "page_0", "page_1"]}]
"appearsOn" uses "cover" or "page_N" where N is the page index. If no named characters appear, omit "detectedCharacters".`,

  worksheet: `You are a creative assistant helping a therapist design a therapeutic worksheet for children/adolescents.
Worksheets are printed activity sheets used in therapy sessions — think CBT thought records, coping skills worksheets, feelings journals, and psychoeducation handouts.

Given a description, generate worksheet content as JSON:
{
  "name": "worksheet name",
  "title": "Title displayed at the top of the worksheet",
  "orientation": "portrait",
  "blocks": [
    { "type": "heading", "text": "Section heading" },
    { "type": "prompt", "text": "Instructions or questions for the child" },
    { "type": "text", "text": "Informational or psychoeducational text" },
    { "type": "lines", "lines": 3 },
    { "type": "checklist", "items": ["Item 1", "Item 2", "Item 3"] },
    { "type": "scale", "scaleLabels": { "min": "Not at all", "max": "Very much" } },
    { "type": "drawing_box", "label": "Draw how you feel right now" },
    { "type": "word_bank", "words": ["happy", "sad", "angry", "calm", "worried"] },
    { "type": "matching", "leftItems": ["Feeling", "Thought"], "rightItems": ["Body clue", "Coping skill"] },
    { "type": "fill_in_blank", "text": "When I feel ___ I can try ___" },
    { "type": "multiple_choice", "question": "Which is a coping skill?", "options": ["Deep breathing", "Yelling", "Counting to 10"] },
    { "type": "image", "caption": "My safe place", "imagePrompt": "a warm cozy room with soft blankets and fairy lights", "imageLayout": "inline", "imageAspect": "4:3" },
    { "type": "image", "imagePrompt": "a friendly cartoon bear sitting peacefully in a meadow", "imageLayout": "background", "imageAspect": "1:1" },
    { "type": "table", "headers": ["Situation", "Feeling", "Thought", "Action"], "tableRows": [["", "", "", ""], ["", "", "", ""]] }
  ]
}

IMPORTANT GUIDELINES:
- Choose "orientation": "portrait" or "landscape" based on the content. Use landscape for timelines, wide tables, board-style activities, or content that benefits from horizontal space. Use portrait for standard worksheets, journals, and vertically-flowing content. Default to portrait when unsure.
- Use a MIX of block types to create an engaging, interactive worksheet. Don't just use text and lines.
- Generate 6-15 blocks depending on the topic complexity.
- Keep text age-appropriate and therapeutic in tone.
- Use drawing_box for creative expression activities.
- Use word_bank for vocabulary/emotion labeling activities.
- Use matching for connecting concepts (feelings to body sensations, situations to coping skills).
- Use fill_in_blank for sentence completion exercises.
- Use multiple_choice for psychoeducation review.
- Always include at least 1 image block. Use 1-3 image blocks — visual illustrations make worksheets more engaging for children. Even a simple background watermark adds warmth.
- Each image block must include "imageLayout" and "imageAspect":
  - imageLayout: "inline" (full-width content block — for instructional illustrations, scenarios to discuss), "accent" (compact right-aligned image — for character references, small decorative visuals), or "background" (subtle low-opacity watermark centered behind all content — for mood-setting, thematic atmosphere). Use at most one "background" image per worksheet.
  - imageAspect: "4:3" (landscape — scenes, environments), "3:4" (portrait — characters, people), or "1:1" (square — icons, emotion faces, simple objects).
- Use table for structured tracking (thought records, mood logs, etc.).
- The worksheet should flow logically: introduction → activity → reflection.
- Use headings to create clear sections.
- Empty table rows should use empty strings ["", "", ""] to indicate fillable cells.

If your content features any named characters (animals, people, creatures, etc.), include a top-level "detectedCharacters" array:
"detectedCharacters": [{"name": "Character Name", "description": "Brief character description", "personality": "Personality traits", "visualDescription": "A detailed visual-only prompt fragment (4-6 sentences). Be EXTREMELY specific: exact species/body type, exact colors (e.g., 'bright orange fur with cream chest'), exact proportions (e.g., 'small and round, about half the height of a door'), distinctive markings, clothing items with colors and patterns, and any accessories. The more precise and unique the description, the better. No emotions, poses, or scene context.", "appearsOn": ["block_0", "block_5"]}]
"appearsOn" uses "block_N" where N is the block index. If no named characters appear, omit "detectedCharacters".`,
};

export const refinePrompt = action({
  args: {
    prompt: v.string(),
    aspect: v.union(v.literal("1:1"), v.literal("3:4"), v.literal("4:3")),
    styleId: v.optional(v.id("styles")),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

    const contextParts: string[] = [];
    if (args.styleId) {
      const style = (await ctx.runQuery(api.styles.getStyle, {
        styleId: args.styleId,
      })) as Doc<"styles"> | null;
      if (style) {
        contextParts.push(
          `Illustration style: ${style.illustrationStyle}`,
          `Colors: ${style.colors.primary} (primary), ${style.colors.secondary} (secondary), ${style.colors.accent} (accent)`,
        );
      }
    }

    const systemPrompt = `You are an expert image prompt engineer. Given a rough description, expand it into a detailed, compositionally rich image generation prompt in 2-4 sentences. Include specifics about composition, lighting, mood, and textures. Output ONLY the refined prompt text — no JSON, no labels, no explanation.${
      contextParts.length > 0
        ? `\n\nIncorporate this visual context naturally:\n${contextParts.join("\n")}`
        : ""
    }`;

    const userPrompt = `Aspect ratio: ${args.aspect}\n\nRough description: ${args.prompt}`;

    const response: Response = await fetch(
      `${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        friendlyGeminiError(response.status, errorData.error?.message || ""),
      );
    }

    const data = await response.json();
    const refinedPrompt: string | undefined =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!refinedPrompt) {
      throw new Error("No content generated");
    }

    return { refinedPrompt };
  },
});

export const generateResourceContent = action({
  args: {
    resourceType: v.union(
      v.literal("poster"),
      v.literal("flashcards"),
      v.literal("card_game"),
      v.literal("board_game"),
      v.literal("book"),
      v.literal("worksheet"),
    ),
    description: v.string(),
    styleId: v.optional(v.id("styles")),
    characterIds: v.optional(v.array(v.id("characters"))),
    characterMode: v.optional(
      v.union(v.literal("resource"), v.literal("per_item")),
    ),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

    // Build context from style and characters
    const contextParts: string[] = [];

    if (args.styleId) {
      const style = (await ctx.runQuery(api.styles.getStyle, {
        styleId: args.styleId,
      })) as Doc<"styles"> | null;
      if (style) {
        contextParts.push(
          `Visual style: ${style.illustrationStyle}`,
          `Colors: ${style.colors.primary} (primary), ${style.colors.secondary} (secondary), ${style.colors.accent} (accent)`,
        );
      }
    }

    if (args.characterIds && args.characterIds.length > 0) {
      const characters: Doc<"characters">[] = [];
      for (const charId of args.characterIds) {
        const char = (await ctx.runQuery(api.characters.getCharacter, {
          characterId: charId,
        })) as Doc<"characters"> | null;
        if (char) characters.push(char);
      }

      if (characters.length > 0) {
        const charDescriptions = characters
          .map(
            (c) =>
              `- ${c.name}: ${c.description}${c.personality ? ` (Personality: ${c.personality})` : ""}`,
          )
          .join("\n");

        if (args.characterMode === "per_item") {
          contextParts.push(
            `Characters available (assign different characters to different items):\n${charDescriptions}`,
          );
        } else {
          contextParts.push(
            `Character to feature:\n${charDescriptions}`,
            `Include this character in the image prompts.`,
          );
        }
      }
    }

    const systemPrompt = SYSTEM_PROMPTS[args.resourceType];
    if (!systemPrompt) {
      throw new Error(`No system prompt for resource type: ${args.resourceType}`);
    }

    const userPrompt = [
      args.description,
      contextParts.length > 0 ? `\nContext:\n${contextParts.join("\n")}` : "",
      "\nRespond with ONLY the JSON object, no other text.",
    ].join("");

    const response: Response = await fetch(
      `${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        friendlyGeminiError(response.status, errorData.error?.message || ""),
      );
    }

    const data = await response.json();
    const generatedText: string | undefined =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedText) {
      throw new Error("No content generated");
    }

    const parsed = parseJsonResponse(generatedText);
    if (!parsed) {
      throw new Error("Failed to parse generated content as JSON");
    }

    // Extract detected characters before post-processing
    const rawParsed = parsed as Record<string, unknown>;
    const detectedCharacters = Array.isArray(rawParsed.detectedCharacters)
      ? (rawParsed.detectedCharacters as Array<Record<string, unknown>>).filter(
          (c) => typeof c.name === "string" && typeof c.visualDescription === "string",
        )
      : [];
    delete rawParsed.detectedCharacters;

    // Post-process: resolve labels to IDs, assign asset keys
    let content: Record<string, unknown>;
    if (args.resourceType === "card_game") {
      content = postProcessCardGameContent(rawParsed);
    } else if (args.resourceType === "book") {
      content = postProcessBookContent(rawParsed);
    } else if (args.resourceType === "worksheet") {
      content = postProcessWorksheetContent(rawParsed);
    } else {
      content = rawParsed;
    }

    return { ...content, detectedCharacters };
  },
});

/** Post-process AI-generated card game content: assign IDs, resolve label references, set asset keys */
function postProcessCardGameContent(raw: Record<string, unknown>): Record<string, unknown> {
  const backgrounds = (raw.backgrounds as Array<Record<string, unknown>>) || [];
  const icons = (raw.icons as Array<Record<string, unknown>>) || [];
  const cards = (raw.cards as Array<Record<string, unknown>>) || [];
  const textSettings = (raw.textSettings as Record<string, unknown>) || {};
  const cardBack = raw.cardBack as Record<string, unknown> | null | undefined;

  // Build label → ID maps and assign IDs + asset keys to backgrounds
  const bgLabelToId: Record<string, string> = {};
  const processedBgs = backgrounds.map((bg) => {
    const id = makeId();
    const label = (bg.label as string) || "Background";
    bgLabelToId[label.toLowerCase()] = id;
    return {
      id,
      label,
      color: (bg.color as string) || "#888888",
      imagePrompt: (bg.imagePrompt as string) || "",
      imageAssetKey: `card_bg:${id}`,
    };
  });

  // Same for icons
  const iconLabelToId: Record<string, string> = {};
  const processedIcons = icons.map((icon) => {
    const id = makeId();
    const label = (icon.label as string) || "Icon";
    iconLabelToId[label.toLowerCase()] = id;
    return {
      id,
      label,
      imagePrompt: (icon.imagePrompt as string) || "",
      imageAssetKey: `card_icon:${id}`,
    };
  });

  // Process card back
  const processedCardBack = cardBack
    ? {
        imagePrompt: (cardBack.imagePrompt as string) || "",
        imageAssetKey: "card_back",
      }
    : undefined;

  // Default text settings
  const processedTextSettings = {
    fontFamily: (textSettings.fontFamily as string) || "Fredoka",
    defaultFontSize: (textSettings.defaultFontSize as number) || 48,
    defaultColor: (textSettings.defaultColor as string) || "#FFFFFF",
    defaultOutlineWidth: (textSettings.defaultOutlineWidth as number) ?? 3,
    defaultOutlineColor: (textSettings.defaultOutlineColor as string) || "#333333",
    defaultHAlign: (textSettings.defaultHAlign as string) || "center",
    defaultVAlign: (textSettings.defaultVAlign as string) || "center",
  };

  // Process cards: resolve backgroundLabel/iconLabel to IDs
  const processedCards = cards.map((card) => {
    const id = makeId();
    const bgLabel = ((card.backgroundLabel as string) || "").toLowerCase();
    const iconLabel = ((card.iconLabel as string) || "").toLowerCase();

    const backgroundId = bgLabelToId[bgLabel] || processedBgs[0]?.id || "";
    const iconId = iconLabel ? iconLabelToId[iconLabel] || undefined : undefined;

    const primaryText = card.primaryText as Record<string, unknown> | null;
    const secondaryText = card.secondaryText as Record<string, unknown> | null;

    return {
      id,
      title: (card.title as string) || "",
      count: (card.count as number) || 1,
      backgroundId,
      iconId,
      primaryText: primaryText
        ? {
            content: (primaryText.content as string) || "",
            ...(primaryText.fontSize != null && { fontSize: primaryText.fontSize as number }),
            ...(primaryText.color != null && { color: primaryText.color as string }),
            ...(primaryText.outlineWidth != null && { outlineWidth: primaryText.outlineWidth as number }),
            ...(primaryText.outlineColor != null && { outlineColor: primaryText.outlineColor as string }),
            ...(primaryText.hAlign != null && { hAlign: primaryText.hAlign as string }),
            ...(primaryText.vAlign != null && { vAlign: primaryText.vAlign as string }),
          }
        : { content: "" },
      ...(secondaryText && {
        secondaryText: {
          content: (secondaryText.content as string) || "",
          ...(secondaryText.fontSize != null && { fontSize: secondaryText.fontSize as number }),
          ...(secondaryText.color != null && { color: secondaryText.color as string }),
          ...(secondaryText.outlineWidth != null && { outlineWidth: secondaryText.outlineWidth as number }),
          ...(secondaryText.outlineColor != null && { outlineColor: secondaryText.outlineColor as string }),
          ...(secondaryText.hAlign != null && { hAlign: secondaryText.hAlign as string }),
          ...(secondaryText.vAlign != null && { vAlign: secondaryText.vAlign as string }),
        },
      }),
    };
  });

  return {
    ...raw,
    backgrounds: processedBgs,
    icons: processedIcons,
    cardBack: processedCardBack,
    textSettings: processedTextSettings,
    cards: processedCards,
    characterPlacement: "backgrounds",
    showText: "numbers_only",
  };
}

/** Post-process AI-generated book content: assign UUIDs and asset keys to pages and cover */
function postProcessBookContent(raw: Record<string, unknown>): Record<string, unknown> {
  const pages = (raw.pages as Array<Record<string, unknown>>) || [];
  const cover = raw.cover as Record<string, unknown> | null | undefined;

  const processedPages = pages.map((page, i) => {
    const id = makeId();
    return {
      id,
      text: (page.text as string) || "",
      imagePrompt: (page.imagePrompt as string) || undefined,
      imageAssetKey: page.imagePrompt ? `book_page_${i}` : undefined,
    };
  });

  const processedCover = cover
    ? {
        title: (cover.title as string) || (raw.name as string) || "Untitled",
        subtitle: (cover.subtitle as string) || undefined,
        imagePrompt: (cover.imagePrompt as string) || undefined,
        imageAssetKey: cover.imagePrompt ? "book_cover" : undefined,
      }
    : undefined;

  return {
    ...raw,
    pages: processedPages,
    cover: processedCover,
  };
}

/** Post-process AI-generated worksheet content: assign UUIDs and asset keys to blocks */
function postProcessWorksheetContent(raw: Record<string, unknown>): Record<string, unknown> {
  const blocks = (raw.blocks as Array<Record<string, unknown>>) || [];

  const processedBlocks = blocks.map((block, i) => {
    const id = makeId();
    const type = (block.type as string) || "text";
    const base: Record<string, unknown> = { ...block, id };

    // Assign imageAssetKey to image blocks
    if (type === "image" && block.imagePrompt) {
      base.imageAssetKey = `worksheet_block_${i}`;
    }

    return base;
  });

  return {
    ...raw,
    blocks: processedBlocks,
  };
}
