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
 * Crop image to target dimensions from center.
 * No resizing/stretching - just extracts the center portion at target size.
 * If the source is smaller than target, pads with green.
 */
async function cropToTargetDimensions(
  imageBuffer: Buffer,
  targetWidth: number,
  targetHeight: number,
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const srcWidth = metadata.width || targetWidth;
  const srcHeight = metadata.height || targetHeight;

  // Calculate crop position (center of source image)
  const cropLeft = Math.max(0, Math.round((srcWidth - targetWidth) / 2));
  const cropTop = Math.max(0, Math.round((srcHeight - targetHeight) / 2));

  // Calculate actual extractable dimensions
  const extractWidth = Math.min(targetWidth, srcWidth);
  const extractHeight = Math.min(targetHeight, srcHeight);

  // Extract the center portion
  let result = await sharp(imageBuffer)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: extractWidth,
      height: extractHeight,
    })
    .toBuffer();

  // If extracted size is smaller than target, pad with green
  if (extractWidth < targetWidth || extractHeight < targetHeight) {
    const leftPad = Math.round((targetWidth - extractWidth) / 2);
    const topPad = Math.round((targetHeight - extractHeight) / 2);
    result = await sharp(result)
      .extend({
        top: topPad,
        bottom: targetHeight - extractHeight - topPad,
        left: leftPad,
        right: targetWidth - extractWidth - leftPad,
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
  textBacking: { width: 1024, height: 256 }, // 2:1 banner shape
  fullCard: { width: 768, height: 1024 }, // 3:4 portrait ratio (same as border)
} as const;

type FrameType = "border" | "textBacking" | "fullCard";

// Helper function to build frame prompts with chroma key instructions
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
  const dims = FRAME_DIMENSIONS[frameType];

  switch (frameType) {
    case "border":
      return `Create a decorative rectangular border frame element for a card.
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
- The border/frame should be 8-12% of the width on each side
- No text, letters, or words anywhere
- Think trading card border (Pokemon, Yu-Gi-Oh) or ornate picture frame, not overly complex design-wise
- The green center is a placeholder - it will be made transparent in post-processing`;

    case "textBacking":
      return `Create a decorative banner/ribbon shape for placing text on top.
Style: ${illustrationStyle}
Colors: Use ${colors.primary} and ${colors.secondary} for the banner shape

IMAGE DIMENSIONS: ${dims.width}x${dims.height} pixels (wide banner, 2:1 ratio)

CRITICAL REQUIREMENTS FOR CHROMA KEY:
- The BACKGROUND (everything outside the banner shape) must be solid, flat, uniform #00FF00 (pure bright green, chroma key green)
- NO gradients, shadows, textures, or variations in the green background
- The banner shape itself should be opaque with the style colors (NOT green)
- Clean, defined edges between the banner and the green background

BANNER DESIGN:
- MUST be a WIDE, SHORT horizontal banner or ribbon shape
- Soft, organic edges - related to the illustration style but should not be too complex or detailed.
- No text, letters, or words in the design
- Should enhance text readability while adding visual interest
- The shape should be edge-to-edge. Not too complex design-wise.
- The green background is a placeholder - it will be made transparent in post-processing`;

    case "fullCard":
      return `Create a complete trading card template frame (like Pokemon or Yu-Gi-Oh cards).
Style: ${illustrationStyle}
Colors: ${colorsList}

IMAGE DIMENSIONS: ${dims.width}x${dims.height} pixels (portrait, 3:4 ratio)

CRITICAL REQUIREMENTS FOR CHROMA KEY:
- The UPPER 75-80% of the card MUST be solid, flat, uniform #00FF00 (pure bright green, chroma key green)
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

    default:
      throw new Error(`Unknown frame type: ${frameType}`);
  }
}

// Generate a frame asset for a style (Node.js action with Sharp processing)
export const generateFrame = action({
  args: {
    styleId: v.id("styles"),
    frameType: v.union(
      v.literal("border"),
      v.literal("textBacking"),
      v.literal("fullCard"),
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

    // Crop to target dimensions from center (no stretching)
    const croppedBuffer = await cropToTargetDimensions(
      rawBuffer,
      targetDims.width,
      targetDims.height,
    );

    // Apply chroma key processing to convert green to transparent
    const processedBuffer = await applyChromaKey(croppedBuffer);

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
