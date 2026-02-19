"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { applyChromaKey, scaleToTargetDimensions } from "./frameActions";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-3-pro-image-preview";

const ICON_SIZE = 512; // Square icon output

const styleDataValidator = v.object({
  colors: v.object({
    primary: v.string(),
    secondary: v.string(),
    accent: v.string(),
  }),
  illustrationStyle: v.string(),
});

/**
 * Generate a card game icon with green screen background, then apply
 * chroma key processing to produce a transparent PNG.
 */
export const generateIconImage = action({
  args: {
    ownerType: v.union(v.literal("resource"), v.literal("style")),
    ownerId: v.union(v.id("resources"), v.id("styles")),
    assetType: v.string(),
    assetKey: v.string(),
    prompt: v.string(),
    styleId: v.optional(v.id("styles")),
    style: v.optional(styleDataValidator),
    characterId: v.optional(v.id("characters")),
  },
  handler: async (ctx, args) => {
    let styleData: {
      colors: { primary: string; secondary: string; accent: string };
      illustrationStyle: string;
    } | null = null;

    if (args.style) {
      styleData = args.style;
    } else if (args.styleId) {
      const style = await ctx.runQuery(api.styles.getStyle, {
        styleId: args.styleId,
      });
      if (!style) throw new Error("Style not found");
      styleData = {
        colors: style.colors,
        illustrationStyle: style.illustrationStyle,
      };
    }

    let characterContext: { promptFragment?: string; description?: string } = {};
    if (args.characterId) {
      const character = await ctx.runQuery(api.characters.getCharacter, {
        characterId: args.characterId,
      });
      if (character) {
        characterContext = {
          promptFragment: character.promptFragment || undefined,
          description: character.description || undefined,
        };
      }
    }

    const prompt = buildIconPrompt({
      prompt: args.prompt,
      style: styleData ?? undefined,
      characterContext,
    });

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY not configured");
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["image", "text"] },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate icon image");
    }

    const data = await response.json();
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated");
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      throw new Error("Invalid response format");
    }

    const imagePart = parts.find(
      (part: { inlineData?: { data: string; mimeType: string } }) =>
        part.inlineData,
    );
    if (!imagePart?.inlineData) {
      throw new Error("No image in response");
    }

    // Convert to buffer and process through chroma key pipeline
    const rawBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const scaledBuffer = await scaleToTargetDimensions(
      rawBuffer,
      ICON_SIZE,
      ICON_SIZE,
    );
    const processedBuffer = await applyChromaKey(scaledBuffer);

    // Store as PNG with transparency
    const uint8Array = new Uint8Array(processedBuffer);
    const blob = new Blob([uint8Array], { type: "image/png" });
    const storageId = await ctx.storage.store(blob);

    await ctx.runMutation(api.assetVersions.createFromGeneration, {
      ownerType: args.ownerType,
      ownerId: args.ownerId,
      assetType: args.assetType,
      assetKey: args.assetKey,
      storageId,
      prompt,
      params: {
        model: MODEL,
        style: styleData
          ? { colors: styleData.colors, illustrationStyle: styleData.illustrationStyle }
          : null,
        characterId: args.characterId,
      },
      source: "generated",
    });

    return {
      success: true,
      storageId,
      assetKey: args.assetKey,
    };
  },
});

function buildIconPrompt({
  prompt,
  style,
  characterContext,
}: {
  prompt: string;
  style?: {
    colors: { primary: string; secondary: string; accent: string };
    illustrationStyle: string;
  };
  characterContext?: { promptFragment?: string; description?: string };
}): string {
  const parts: string[] = [];

  if (characterContext?.promptFragment) {
    parts.push(characterContext.promptFragment);
  }
  if (characterContext?.description) {
    parts.push(`Character appearance: ${characterContext.description}`);
  }

  parts.push(prompt);

  if (style) {
    parts.push(
      "IMPORTANT: follow the illustration style guidance EXACTLY: ",
      style.illustrationStyle,
    );
    parts.push(
      `Using these colors: ${style.colors.primary} (primary), ${style.colors.secondary} (secondary), ${style.colors.accent} (accent)`,
    );
  }

  parts.push("Do NOT include any text, words, or letters in the image.");

  parts.push(
    "CRITICAL CHROMA KEY REQUIREMENT: The background MUST be solid, flat, uniform #00FF00 (pure bright green). " +
    "NO gradients, shadows, textures, or variations in the green background. " +
    "The subject should be centered with clean edges against the green background. " +
    "The green background will be removed in post-processing to create a transparent icon. " +
    "Create a square 1:1 aspect ratio image.",
  );

  return parts.join(" ");
}
