"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import sharp from "sharp";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-3-pro-image-preview";

// Tolerance for chroma key detection (allows for compression artifacts)
const CHROMA_TOLERANCE = 50;

/**
 * Scale image to fit target dimensions, preserving aspect ratio.
 * This ensures frame borders and edges are not cropped off.
 * If the scaled image doesn't exactly match target, pads with green.
 */
async function scaleToTargetDimensions(
  imageBuffer: Buffer,
  targetWidth: number,
  targetHeight: number,
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const srcWidth = metadata.width || targetWidth;
  const srcHeight = metadata.height || targetHeight;

  // Calculate scale factor to fit within target (contain, not cover)
  const scaleX = targetWidth / srcWidth;
  const scaleY = targetHeight / srcHeight;
  const scale = Math.min(scaleX, scaleY);

  // Calculate scaled dimensions
  const scaledWidth = Math.round(srcWidth * scale);
  const scaledHeight = Math.round(srcHeight * scale);

  // Resize image to fit within target dimensions
  let result = await sharp(imageBuffer)
    .resize(scaledWidth, scaledHeight, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .toBuffer();

  // If scaled size doesn't match target exactly, pad with green (centered)
  if (scaledWidth < targetWidth || scaledHeight < targetHeight) {
    const leftPad = Math.round((targetWidth - scaledWidth) / 2);
    const topPad = Math.round((targetHeight - scaledHeight) / 2);
    result = await sharp(result)
      .extend({
        top: topPad,
        bottom: targetHeight - scaledHeight - topPad,
        left: leftPad,
        right: targetWidth - scaledWidth - leftPad,
        background: { r: 0, g: 255, b: 0, alpha: 1 },
      })
      .toBuffer();
  }

  return sharp(result).png().toBuffer();
}

/**
 * Convert chroma key green pixels to transparent.
 * Uses a tolerance-based approach to handle compression artifacts and anti-aliasing.
 */
async function applyChromaKey(imageBuffer: Buffer): Promise<Buffer> {
  // Get raw pixel data with alpha channel
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate how "green" this pixel is
    // A pure chroma key green has high G, low R, low B
    const isChromaGreen =
      g > 255 - CHROMA_TOLERANCE && // High green
      r < CHROMA_TOLERANCE && // Low red
      b < CHROMA_TOLERANCE; // Low blue

    if (isChromaGreen) {
      // Fully transparent
      data[i + 3] = 0;
    } else {
      // Check for partial green (edge feathering)
      // This handles anti-aliased edges where green bleeds into the frame
      const greenDominance = g - Math.max(r, b);
      if (greenDominance > 100 && g > 200) {
        // Partial transparency based on how green it is
        const alpha = Math.max(0, 255 - greenDominance * 2);
        data[i + 3] = alpha;
      }
    }
  }

  // Re-encode as PNG with transparency
  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

// Frame dimension specifications (in pixels)
const FRAME_DIMENSIONS = {
  border: { width: 768, height: 1024 }, // 3:4 portrait ratio
  fullCard: { width: 768, height: 1024 }, // 3:4 portrait ratio (same as border)
} as const;

type FrameType = "border" | "fullCard";

// Helper function to build frame prompts with chroma key instructions
function buildFramePrompt({
  frameType,
  colors,
  illustrationStyle,
  promptSuffix,
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
  promptSuffix?: string;
}): string {
  const colorsList = `${colors.primary} (primary), ${colors.secondary} (secondary), ${colors.accent} (accent)`;
  const dims = FRAME_DIMENSIONS[frameType];

  let basePrompt: string;

  switch (frameType) {
    case "border":
      basePrompt = `Create a decorative rectangular border frame element for a card.
Style: ${illustrationStyle}
Colors: ${colorsList}

IMAGE DIMENSIONS: ${dims.width}x${dims.height} pixels (portrait, 3:4 ratio)

CRITICAL REQUIREMENTS FOR CHROMA KEY:
- The CENTER of the frame MUST be solid, flat, uniform #00FF00 (pure bright green, chroma key green)
- NO gradients, shadows, textures, or variations in the green center area
- The green area should be at least 80% of the image
- Put a thin 1 pixel dark outline between the decorative frame and the green center to create a clean edge

FRAME DESIGN:
- Decorative elements ONLY around the outer edges (like a picture frame)
- The border/frame should be 5-8% of the width on each side, with nothing in the center
- No text, letters, or words anywhere
- Think trading card border (Pokemon, Yu-Gi-Oh) or ornate picture frame, not overly complex design-wise
- The green center is a placeholder - it will be made transparent in post-processing`;
      break;

    case "fullCard":
      basePrompt = `Create a complete trading card template frame (like Pokemon or Yu-Gi-Oh cards).
Style: ${illustrationStyle}
Colors: ${colorsList}

IMAGE DIMENSIONS: ${dims.width}x${dims.height} pixels (portrait, 3:4 ratio)

CRITICAL REQUIREMENTS FOR CHROMA KEY:
- The UPPER 75-80% of the card MUST be solid, flat, uniform #00FF00 (pure bright green, chroma key green), with the border/frame elements only around the outer edges
- This green area is where the card image will show through - it must be completely flat green
- NO gradients, shadows, textures, or variations in the green area
- Put a thin 1 pixel dark outline around the green area to create a clean edge

CARD TEMPLATE DESIGN:
- Decorative border around the ENTIRE card (like a trading card frame)
- The border should be 5-8% of the width on each side
- LOWER 20-25% should be a SOLID COLORED text area using ${colors.primary} or ${colors.secondary}
- The text area should have a subtle inner border or decoration matching the style
- The text area is where labels/descriptions will be placed - keep it clean and readable
- No text, letters, or words anywhere in the design
- Think Pokemon card, Yu-Gi-Oh card, or trading card game aesthetic
- The green upper area is a placeholder - it will be made transparent in post-processing`;
      break;

    default:
      throw new Error(`Unknown frame type: ${frameType}`);
  }

  // Append custom prompt suffix if provided
  if (promptSuffix && promptSuffix.trim()) {
    basePrompt += `\n\nADDITIONAL INSTRUCTIONS, IMPORTANT:\n${promptSuffix.trim()}`;
  }

  return basePrompt;
}

// Generate a frame asset for a style (Node.js action with Sharp processing)
export const generateFrame = action({
  args: {
    styleId: v.id("styles"),
    frameType: v.union(v.literal("border"), v.literal("fullCard")),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
      background: v.string(),
      text: v.string(),
    }),
    illustrationStyle: v.string(),
    promptSuffix: v.optional(v.string()),
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
      promptSuffix: args.promptSuffix,
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
      },
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
        part.inlineData,
    );
    if (!imagePart?.inlineData) {
      throw new Error("No image in response");
    }

    // Convert base64 to buffer
    const imageData = imagePart.inlineData.data;
    const rawBuffer = Buffer.from(imageData, "base64");

    // Get target dimensions for this frame type
    const targetDims = FRAME_DIMENSIONS[args.frameType];

    // Scale to fit target dimensions (preserves edges, no cropping)
    const scaledBuffer = await scaleToTargetDimensions(
      rawBuffer,
      targetDims.width,
      targetDims.height,
    );

    // Apply chroma key processing to convert green to transparent
    const processedBuffer = await applyChromaKey(scaledBuffer);

    // Create blob and upload to Convex storage
    // Convert Buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(processedBuffer);
    const blob = new Blob([uint8Array], { type: "image/png" });
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
