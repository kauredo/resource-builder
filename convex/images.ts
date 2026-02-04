import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-2.0-flash-exp-image-generation";

// Generate a single emotion card image
export const generateEmotionCard = action({
  args: {
    resourceId: v.id("resources"),
    emotion: v.string(),
    description: v.optional(v.string()),
    styleId: v.id("styles"),
    characterId: v.optional(v.id("characters")),
  },
  handler: async (ctx, args) => {
    // Get the style
    const style = await ctx.runQuery(api.styles.getStyle, {
      styleId: args.styleId,
    });
    if (!style) {
      throw new Error("Style not found");
    }

    // Get character if provided
    let characterPromptFragment: string | undefined;
    if (args.characterId) {
      const character = await ctx.runQuery(api.characters.getCharacter, {
        characterId: args.characterId,
      });
      if (character) {
        characterPromptFragment = character.promptFragment;
      }
    }

    // Build the prompt
    const prompt = buildEmotionCardPrompt({
      emotion: args.emotion,
      style: {
        colors: style.colors,
        illustrationStyle: style.illustrationStyle,
      },
      characterPromptFragment,
      description: args.description,
    });

    // Get API key from environment
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY not configured");
    }

    // Generate image via Gemini API
    const response = await fetch(
      `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["image", "text"],
            responseMimeType: "image/png",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate image");
    }

    const data = await response.json();

    // Extract image from response
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated");
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      throw new Error("Invalid response format");
    }

    // Find the image part
    const imagePart = parts.find(
      (part: { inlineData?: { data: string; mimeType: string } }) =>
        part.inlineData
    );
    if (!imagePart?.inlineData) {
      throw new Error("No image in response");
    }

    // Convert base64 to blob and store in Convex
    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";

    // Decode base64 and create blob
    const binaryString = atob(imageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });

    // Upload to Convex storage
    const storageId = await ctx.storage.store(blob);

    // Add image to resource
    await ctx.runMutation(api.resources.addImageToResource, {
      resourceId: args.resourceId,
      storageId,
      description: args.emotion,
      prompt,
    });

    return {
      success: true,
      storageId,
      emotion: args.emotion,
    };
  },
});

// Batch generate emotion cards with concurrency limit
export const generateEmotionCardBatch = action({
  args: {
    resourceId: v.id("resources"),
    emotions: v.array(v.string()),
    styleId: v.id("styles"),
    characterId: v.optional(v.id("characters")),
  },
  handler: async (ctx, args) => {
    const results: Array<{
      emotion: string;
      success: boolean;
      storageId?: Id<"_storage">;
      error?: string;
    }> = [];

    // Process in batches of 3 for concurrency control
    const BATCH_SIZE = 3;

    for (let i = 0; i < args.emotions.length; i += BATCH_SIZE) {
      const batch = args.emotions.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map(async (emotion) => {
          try {
            const result = await ctx.runAction(api.images.generateEmotionCard, {
              resourceId: args.resourceId,
              emotion,
              styleId: args.styleId,
              characterId: args.characterId,
            });
            return {
              emotion,
              success: true,
              storageId: result.storageId as Id<"_storage">,
            };
          } catch (error) {
            return {
              emotion,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        })
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          results.push({
            emotion: "unknown",
            success: false,
            error: result.reason?.message || "Unknown error",
          });
        }
      }
    }

    return results;
  },
});

// Get image URL from storage ID
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get multiple image URLs
export const getImageUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const urls: Record<string, string | null> = {};
    for (const storageId of args.storageIds) {
      urls[storageId] = await ctx.storage.getUrl(storageId);
    }
    return urls;
  },
});

// Helper function to build emotion card prompt
function buildEmotionCardPrompt({
  emotion,
  style,
  characterPromptFragment,
  description,
}: {
  emotion: string;
  style: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    illustrationStyle: string;
  };
  characterPromptFragment?: string;
  description?: string;
}): string {
  const parts: string[] = [];

  // Start with character prompt fragment if provided
  if (characterPromptFragment) {
    parts.push(characterPromptFragment);
  }

  // Add the base prompt
  let basePrompt = `A child-friendly illustration showing the emotion "${emotion}"`;
  if (description) {
    basePrompt += `. ${description}`;
  }
  parts.push(basePrompt);

  // Always include the style's illustration style
  parts.push(style.illustrationStyle);

  // Add color guidance
  parts.push(
    `Using these colors: ${style.colors.primary} (primary), ${style.colors.secondary} (secondary), ${style.colors.accent} (accent)`
  );

  return parts.join(". ");
}
