/**
 * Gemini API integration for image generation
 *
 * Uses Gemini 3 Pro Image (gemini-3-pro-image-preview) for generating
 * child-friendly illustrations for therapy resources.
 */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "models/gemini-3-pro-image-preview";
// const MODEL = "models/gemini-2.0-flash-exp-image-generation";

interface GenerateImageOptions {
  prompt: string;
  apiKey: string;
}

interface GenerateImageResult {
  success: boolean;
  imageData?: string; // base64 encoded image
  mimeType?: string;
  error?: string;
}

/**
 * Generate an image using Gemini 3 Pro Image
 */
export async function generateImage({
  prompt,
  apiKey,
}: GenerateImageOptions): Promise<GenerateImageResult> {
  try {
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
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || "Failed to generate image",
      };
    }

    const data = await response.json();

    // Extract image from response
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      return {
        success: false,
        error: "No image generated",
      };
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      return {
        success: false,
        error: "Invalid response format",
      };
    }

    // Find the image part
    const imagePart = parts.find(
      (part: { inlineData?: { data: string; mimeType: string } }) =>
        part.inlineData,
    );
    if (!imagePart?.inlineData) {
      return {
        success: false,
        error: "No image in response",
      };
    }

    return {
      success: true,
      imageData: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
