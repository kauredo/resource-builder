import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-3-pro-image-preview";

// Frame type definitions
const frameTypes = ["border", "divider", "textBacking"] as const;
type FrameType = (typeof frameTypes)[number];

// Generate a frame asset for a style
export const generateFrame = action({
  args: {
    styleId: v.id("styles"),
    frameType: v.union(
      v.literal("border"),
      v.literal("divider"),
      v.literal("textBacking")
    ),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
      background: v.string(),
      text: v.string(),
    }),
    illustrationStyle: v.string(),
  },
  handler: async (ctx, args) => {
    // Get API key from environment
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY not configured");
    }

    // Build the prompt based on frame type
    const prompt = buildFramePrompt({
      frameType: args.frameType,
      colors: args.colors,
      illustrationStyle: args.illustrationStyle,
    });

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
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate frame");
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

    // Update the style with the new frame
    await ctx.runMutation(api.frames.updateStyleFrame, {
      styleId: args.styleId,
      frameType: args.frameType,
      storageId,
      prompt,
    });

    return {
      success: true,
      storageId,
      frameType: args.frameType,
    };
  },
});

// Mutation to update a style's frame
export const updateStyleFrame = mutation({
  args: {
    styleId: v.id("styles"),
    frameType: v.union(
      v.literal("border"),
      v.literal("divider"),
      v.literal("textBacking")
    ),
    storageId: v.id("_storage"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) {
      throw new Error("Style not found");
    }

    // Build the updated frames object
    const currentFrames = style.frames || {};
    const updatedFrames = {
      ...currentFrames,
      [args.frameType]: {
        storageId: args.storageId,
        prompt: args.prompt,
        generatedAt: Date.now(),
      },
    };

    await ctx.db.patch(args.styleId, {
      frames: updatedFrames,
      updatedAt: Date.now(),
    });
  },
});

// Delete a frame from a style
export const deleteFrame = mutation({
  args: {
    styleId: v.id("styles"),
    frameType: v.union(
      v.literal("border"),
      v.literal("divider"),
      v.literal("textBacking")
    ),
  },
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) {
      throw new Error("Style not found");
    }

    if (!style.frames) {
      return; // No frames to delete
    }

    // Get the storage ID before deleting
    const frame = style.frames[args.frameType];
    if (frame?.storageId) {
      // Delete the file from storage
      await ctx.storage.delete(frame.storageId);
    }

    // Build the updated frames object without the deleted frame
    const { [args.frameType]: _, ...remainingFrames } = style.frames;

    // If no frames remain, set to undefined
    const updatedFrames =
      Object.keys(remainingFrames).length > 0 ? remainingFrames : undefined;

    await ctx.db.patch(args.styleId, {
      frames: updatedFrames,
      updatedAt: Date.now(),
    });
  },
});

// Helper function to build frame prompts
function buildFramePrompt({
  frameType,
  colors,
  illustrationStyle,
}: {
  frameType: FrameType;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  illustrationStyle: string;
}): string {
  const colorsList = `${colors.primary} (primary), ${colors.secondary} (secondary), ${colors.accent} (accent)`;

  switch (frameType) {
    case "border":
      return `Create a decorative rectangular border frame element for a card.
Style: ${illustrationStyle}
Colors: ${colorsList}

CRITICAL REQUIREMENTS:
- The CENTER of the frame MUST be completely transparent/empty - this is where the card content will go
- The frame should only have decorative elements around the EDGES
- Design should work as a portrait orientation frame (3:4 aspect ratio)
- PNG with alpha channel transparency
- The decorative border should be about 10-15% of the total width on each side
- No text or letters in the design
- Think of it like a picture frame or trading card border (Pokemon, Yu-Gi-Oh style)`;

    case "divider":
      return `Create a horizontal decorative divider element.
Style: ${illustrationStyle}
Colors: ${colorsList}

CRITICAL REQUIREMENTS:
- Horizontal orientation, wide and short (aspect ratio around 8:1)
- Transparent background (PNG with alpha channel)
- Decorative line or pattern that separates sections
- Clean edges, suitable for placing between an image and text area
- No text or letters
- Should be subtle but match the illustration style`;

    case "textBacking":
      return `Create a decorative text background shape (banner, ribbon, or nameplate).
Style: ${illustrationStyle}
Colors: Use ${colors.primary} at 30-40% opacity, with ${colors.accent} accents

CRITICAL REQUIREMENTS:
- Horizontal orientation, suitable for placing text on top
- Semi-transparent (30-40% opacity) so text remains readable
- PNG with alpha channel
- Soft edges, banner or ribbon shape
- No text or letters in the design
- Should enhance readability while adding visual interest
- Aspect ratio around 4:1 (wide and short)`;

    default:
      throw new Error(`Unknown frame type: ${frameType}`);
  }
}
