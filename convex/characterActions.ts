import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const IMAGE_MODEL = "models/gemini-3-pro-image-preview";
const TEXT_MODEL = "models/gemini-2.0-flash";

// Generate a prompt fragment from character details
export const generatePromptFragment = action({
  args: { characterId: v.id("characters") },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; promptFragment: string }> => {
    const character = await ctx.runQuery(api.characters.getCharacter, {
      characterId: args.characterId,
    });
    if (!character) throw new Error("Character not found");

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

    const prompt: string = `You are helping a therapist create consistent AI-generated illustrations for therapy materials (emotion cards, worksheets, etc.).

Given this character description, generate a concise visual prompt fragment that can be prepended to any image generation prompt to ensure the character looks consistent across all illustrations.

Character Name: ${character.name}
${character.description ? `Description: ${character.description}` : ""}
${character.personality ? `Personality: ${character.personality}` : ""}

Generate a prompt fragment (2-4 sentences) that describes the character's VISUAL appearance in detail: body type, hair, skin tone, clothing style, distinguishing features, and overall vibe. Be specific enough that an image generation model would consistently recreate this character.

Do NOT include any emotion-specific language. The fragment should work when combined with any emotion or scene.
Respond with ONLY the prompt fragment text, no explanation or quotes.`;

    const response: Response = await fetch(
      `${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to generate prompt fragment"
      );
    }

    const data = await response.json();
    const generatedText: string | undefined =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!generatedText) throw new Error("No text generated");

    // Update character with generated prompt fragment
    await ctx.runMutation(api.characters.updateCharacter, {
      characterId: args.characterId,
      promptFragment: generatedText,
    });

    return { success: true, promptFragment: generatedText };
  },
});

// Generate a reference image for a character
export const generateReferenceImage = action({
  args: { characterId: v.id("characters") },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; storageId: Id<"_storage"> }> => {
    const character = await ctx.runQuery(api.characters.getCharacter, {
      characterId: args.characterId,
    });
    if (!character) throw new Error("Character not found");

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

    // Build prompt using character details
    const parts: string[] = [];

    if (character.promptFragment) {
      parts.push(character.promptFragment);
    }

    parts.push(
      `Create a character reference illustration of "${character.name}".`
    );

    if (character.description) {
      parts.push(character.description);
    }
    if (character.personality) {
      parts.push(`Their personality is: ${character.personality}`);
    }

    parts.push(
      "Create a clear, centered character portrait with a clean white background. The character should be shown from the waist up, facing slightly towards the viewer with a neutral, friendly expression. The illustration should be suitable as a character reference sheet for consistent reproduction in future illustrations."
    );
    parts.push(
      "IMPORTANT: Do NOT include any text, words, letters, or labels in the image."
    );

    const prompt: string = parts.join(". ");

    const response: Response = await fetch(
      `${GEMINI_API_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["image", "text"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to generate reference image"
      );
    }

    const data = await response.json();
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated");
    }

    const responseParts = candidates[0].content?.parts;
    if (!responseParts) throw new Error("Invalid response format");

    const imagePart = responseParts.find(
      (part: { inlineData?: { data: string; mimeType: string } }) =>
        part.inlineData
    );
    if (!imagePart?.inlineData) throw new Error("No image in response");

    // Convert base64 to blob and store
    const imageData: string = imagePart.inlineData.data;
    const mimeType: string = imagePart.inlineData.mimeType || "image/png";
    const binaryString: string = atob(imageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const storageId: Id<"_storage"> = await ctx.storage.store(blob);

    // Add to character's reference images
    await ctx.runMutation(api.characters.addReferenceImage, {
      characterId: args.characterId,
      storageId,
    });

    return { success: true, storageId };
  },
});
