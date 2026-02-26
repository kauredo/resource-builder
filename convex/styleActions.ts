"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const TEXT_MODEL = "models/gemini-2.0-flash";

const FALLBACK_COLORS = {
  primary: "#FF6B6B",
  secondary: "#4ECDC4",
  accent: "#FFE66D",
  background: "#FFF9F0",
  text: "#2C3E50",
};

const FALLBACK_TYPOGRAPHY = {
  headingFont: "Nunito",
  bodyFont: "Open Sans",
};

function normalizeHex(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const match = value.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!match) return fallback;
  return `#${match[1].toUpperCase()}`;
}

function parsePaletteResponse(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export const createStyleFromCharacter = action({
  args: {
    userId: v.id("users"),
    characterId: v.id("characters"),
    storageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ styleId: Id<"styles"> }> => {
    const character = (await ctx.runQuery(api.characters.getCharacter, {
      characterId: args.characterId,
    })) as Doc<"characters"> | null;
    if (!character) throw new Error("Character not found");

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

    const selectedIds =
      args.storageIds && args.storageIds.length > 0
        ? args.storageIds
        : character.primaryImageId
          ? [character.primaryImageId]
          : character.referenceImages.slice(0, 1);
    const hasImages = selectedIds.length > 0;
    const prompt = `You are a design assistant helping a therapist build a visual style for children's therapy resources.

Use the character details${hasImages ? " and reference image" : ""} to propose a cohesive color palette. Output ONLY JSON in this exact shape:
{
  "colors": {
    "primary": "#RRGGBB",
    "secondary": "#RRGGBB",
    "accent": "#RRGGBB",
    "background": "#RRGGBB",
    "text": "#RRGGBB"
  },
  "illustrationStyle": "short description"
}

Guidelines:
- Use friendly, calming colors appropriate for therapy resources.
- Ensure background is light and text has strong contrast.
- Match the character's dominant colors when possible.
- Keep illustrationStyle concise (1-2 sentences).

Character Name: ${character.name}
Description: ${character.description || "N/A"}
Personality: ${character.personality || "N/A"}
Visual prompt fragment: ${character.promptFragment || "N/A"}`;

    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [{ text: prompt }];

    if (hasImages) {
      for (const storageId of selectedIds) {
        const imageUrl = await ctx.storage.getUrl(storageId);
        if (!imageUrl) continue;
        const imageResponse: Response = await fetch(imageUrl);
        if (!imageResponse.ok) continue;
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString("base64");
        const mimeType =
          imageUrl.includes(".jpg") || imageUrl.includes(".jpeg")
            ? "image/jpeg"
            : "image/png";
        parts.push({ inlineData: { mimeType, data: base64 } });
      }
    }

    const response: Response = await fetch(
      `${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to generate palette",
      );
    }

    const data = await response.json();
    const generatedText: string | undefined =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const parsed = generatedText ? parsePaletteResponse(generatedText) : null;

    const colors = {
      primary: normalizeHex(parsed?.colors?.primary, FALLBACK_COLORS.primary),
      secondary: normalizeHex(
        parsed?.colors?.secondary,
        FALLBACK_COLORS.secondary,
      ),
      accent: normalizeHex(parsed?.colors?.accent, FALLBACK_COLORS.accent),
      background: normalizeHex(
        parsed?.colors?.background,
        FALLBACK_COLORS.background,
      ),
      text: normalizeHex(parsed?.colors?.text, FALLBACK_COLORS.text),
    };

    const illustrationStyle =
      typeof parsed?.illustrationStyle === "string" &&
      parsed.illustrationStyle.trim().length > 0
        ? parsed.illustrationStyle.trim()
        : "Warm, friendly illustration style with soft shapes and gentle color transitions.";

    const newStyleId: Id<"styles"> = await ctx.runMutation(
      api.styles.createStyle,
      {
        userId: args.userId,
        name: `${character.name} Style`,
        colors,
        typography: FALLBACK_TYPOGRAPHY,
        illustrationStyle,
      },
    );

    await ctx.runMutation(api.characters.updateCharacter, {
      characterId: args.characterId,
      styleId: newStyleId,
    });

    return { styleId: newStyleId };
  },
});
