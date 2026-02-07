"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const TEXT_MODEL = "models/gemini-2.0-flash";

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
Make the headline therapeutic, encouraging, and age-appropriate. The imagePrompt should describe a warm, inviting illustration that includes the headline text as part of the artwork.`,

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
Create therapeutic, educational flashcards. Each card should have clear front text and a supportive explanation on the back. Generate 4-12 cards depending on the described topic. The imagePrompt should describe an illustration that includes the front text as part of the artwork.`,

  card_game: `You are a creative assistant helping a therapist design a therapeutic card game for children/adolescents.
Given a description, generate card game content as JSON:
{
  "name": "game name",
  "deckName": "name of the deck",
  "rules": "clear gameplay rules in 2-4 sentences",
  "cards": [
    {
      "title": "card type name",
      "text": "card instructions or content",
      "count": 1,
      "imagePrompt": "illustration prompt for this card, including the title text baked into the image"
    }
  ]
}
Design an engaging therapeutic card game. Include varied card types with different counts (action cards might have 4-8 copies, special cards 1-2). The imagePrompt should describe an illustration that includes the card title as part of the artwork. Generate 4-10 unique card types.`,

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
Design an engaging therapeutic board game. The grid should have meaningful cells (Start, Finish, special action cells, etc.). Include 2-4 player tokens and 5-10 game cards with therapeutic prompts. Grid size should be 4-8 rows/cols depending on complexity.`,
};

export const generateResourceContent = action({
  args: {
    resourceType: v.union(
      v.literal("poster"),
      v.literal("flashcards"),
      v.literal("card_game"),
      v.literal("board_game"),
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
        errorData.error?.message || "Failed to generate content",
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

    return parsed;
  },
});
