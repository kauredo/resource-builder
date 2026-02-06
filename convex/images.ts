import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-3-pro-image-preview";
// const MODEL = "models/gemini-2.0-flash-exp-image-generation";

// Style data for image generation (can be passed directly instead of styleId)
const styleDataValidator = v.object({
  colors: v.object({
    primary: v.string(),
    secondary: v.string(),
    accent: v.string(),
  }),
  illustrationStyle: v.string(),
});

// Generate a single emotion card image
export const generateEmotionCard = action({
  args: {
    resourceId: v.id("resources"),
    emotion: v.string(),
    description: v.optional(v.string()),
    // Accept either styleId OR style data directly
    styleId: v.optional(v.id("styles")),
    style: v.optional(styleDataValidator),
    characterId: v.optional(v.id("characters")),
    includeText: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get style from either styleId or direct style data
    let styleData: {
      colors: { primary: string; secondary: string; accent: string };
      illustrationStyle: string;
    };

    if (args.style) {
      // Use directly provided style data
      styleData = args.style;
    } else if (args.styleId) {
      // Fetch from database
      const style = await ctx.runQuery(api.styles.getStyle, {
        styleId: args.styleId,
      });
      if (!style) {
        throw new Error("Style not found");
      }
      styleData = {
        colors: style.colors,
        illustrationStyle: style.illustrationStyle,
      };
    } else {
      throw new Error("Either styleId or style data must be provided");
    }

    // Get character if provided
    let characterContext: {
      promptFragment?: string;
      description?: string;
    } = {};
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

    // Build the prompt
    const prompt = buildEmotionCardPrompt({
      emotion: args.emotion,
      style: styleData,
      characterContext,
      description: args.description,
      includeText: args.includeText ?? false,
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
          },
        }),
      },
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
        part.inlineData,
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
        batch.map(async emotion => {
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
        }),
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
  characterContext,
  description,
  includeText = false,
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
  characterContext?: {
    promptFragment?: string;
    description?: string;
  };
  description?: string;
  includeText?: boolean;
}): string {
  const parts: string[] = [];

  // Start with character details if provided
  if (characterContext?.promptFragment) {
    parts.push(characterContext.promptFragment);
  }
  if (characterContext?.description) {
    parts.push(`Character appearance: ${characterContext.description}`);
  }

  // Add the base prompt
  let basePrompt = `A illustration showing the emotion "${emotion}"`;
  if (description) {
    basePrompt += `. ${description}`;
  }
  parts.push(basePrompt);

  // Always include the style's illustration style
  parts.push(
    "IMPORTANT: follow the illustration style guidance EXACTLY: ",
    style.illustrationStyle,
  );

  // Add color guidance
  parts.push(
    `Using these colors: ${style.colors.primary} (primary), ${style.colors.secondary} (secondary), ${style.colors.accent} (accent)`,
  );

  // Text instruction - explicitly tell the model whether to include text
  if (includeText) {
    parts.push(`Include the word "${emotion}" as text in the image`);
  } else {
    parts.push(
      "IMPORTANT: Do NOT include any text, words, letters, or labels in the image. The illustration should be purely visual with no written text whatsoever",
    );
  }

  // Additional quality guidance
  parts.push(
    "Create a single cohesive square illustration (1:1 aspect ratio) with a CLEAN WHITE background suitable for a therapy emotion card. Keep the style consistent and focused on clearly conveying the specified emotion through facial expressions, body language, and color use. Avoid any extraneous details or elements that do not contribute to expressing the emotion clearly. Keep the subject centered and prominent in the frame",
    "The white background should be edge to edge with no extra padding, no extra border, card, or framing",
    "This is an original character for therapy materials, not a copyrighted character. If the description resembles an existing character, make it visually distinct enough to be clearly original",
  );

  return parts.join(". ");
}
