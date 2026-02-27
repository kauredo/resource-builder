"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const IMAGE_MODEL = "models/gemini-3-pro-image-preview";
const TEXT_MODEL = "models/gemini-2.0-flash";

// Shared helper: merge character details + image descriptions into a prompt fragment
async function mergeIntoPromptFragment(
  apiKey: string,
  opts: {
    name: string;
    description: string;
    personality: string;
    imageDescriptions?: string;
  },
): Promise<string> {
  const hasImages = opts.imageDescriptions && opts.imageDescriptions.length > 0;

  const prompt = `You are helping a therapist create consistent AI-generated illustrations for therapy materials (emotion cards, worksheets, etc.).

Given this character's details${hasImages ? " and reference image analyses" : ""}, create a concise visual prompt fragment (2-4 sentences) that describes exactly how this character should look in any illustration.${hasImages ? " Prioritize visual details from the image analyses." : ""}

Character Name: ${opts.name}
${opts.description ? `Description: ${opts.description}` : ""}
${opts.personality ? `Personality: ${opts.personality}` : ""}
${hasImages ? `\nReference image analyses:\n${opts.imageDescriptions}` : ""}

Generate a prompt fragment that describes the character's VISUAL appearance in detail: body type, hair, skin tone, clothing style, distinguishing features, and overall vibe. Be specific enough that an image generation model would consistently recreate this character.

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
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || "Failed to generate prompt fragment",
    );
  }

  const data = await response.json();
  const generatedText: string | undefined =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!generatedText) throw new Error("No text generated");

  return generatedText;
}

// Suggest copyright-free rewrites when image generation is blocked
async function suggestDescriptionFix(
  apiKey: string,
  opts: { name: string; description: string; personality: string },
): Promise<{ description: string; personality: string }> {
  const prompt = `An AI image generator blocked this character description, likely due to trademarked or copyrighted references.

Character Name: ${opts.name}
Description: ${opts.description}
Personality: ${opts.personality}

Rewrite BOTH the description and personality to remove any trademarked names, brand references, or copyrighted character references (e.g. "Disney", "Pixar", "Marvel", specific show/movie names) while keeping the same visual look and personality traits. Describe the visual style generically instead of referencing brands (e.g. "cartoon animated style with bold outlines" instead of "Disney style").

Respond in EXACTLY this JSON format, no other text:
{"description": "...", "personality": "..."}`;

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      return { description: opts.description, personality: opts.personality };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      return { description: opts.description, personality: opts.personality };
    }

    // Extract JSON from response (may be wrapped in ```json blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { description: opts.description, personality: opts.personality };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      description: parsed.description || opts.description,
      personality: parsed.personality || opts.personality,
    };
  } catch {
    return { description: opts.description, personality: opts.personality };
  }
}

// Generate a prompt fragment from character details + stored image descriptions
export const generatePromptFragment = action({
  args: { characterId: v.id("characters") },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; promptFragment: string }> => {
    const character = await ctx.runQuery(api.characters.getCharacter, {
      characterId: args.characterId,
    });
    if (!character) throw new Error("Character not found");

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

    // Include stored image descriptions so regeneration doesn't lose image context
    const descriptions = character.imageDescriptions ?? {};
    const descriptionsText = Object.values(descriptions).length > 0
      ? Object.values(descriptions)
          .map((d, i) => `Image ${i + 1}: ${d}`)
          .join("\n")
      : undefined;

    const generatedText = await mergeIntoPromptFragment(apiKey, {
      name: character.name,
      description: character.description,
      personality: character.personality,
      imageDescriptions: descriptionsText,
    });

    // Update character with generated prompt fragment
    await ctx.runMutation(api.characters.updateCharacter, {
      characterId: args.characterId,
      promptFragment: generatedText,
    });

    return { success: true, promptFragment: generatedText };
  },
});

// Analyze uploaded reference images and update the prompt fragment
export const analyzeAndUpdatePrompt = action({
  args: {
    characterId: v.id("characters"),
    storageIds: v.array(v.id("_storage")),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; promptFragment: string }> => {
    const character = await ctx.runQuery(api.characters.getCharacter, {
      characterId: args.characterId,
    });
    if (!character) throw new Error("Character not found");

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

    // Step 1: Analyze each new image individually and store descriptions
    const newDescriptions: Record<string, string> = {};
    await Promise.all(
      args.storageIds.map(async (storageId) => {
        const imageUrl = await ctx.storage.getUrl(storageId);
        if (!imageUrl) return;

        const imageResponse: Response = await fetch(imageUrl);
        if (!imageResponse.ok) return;

        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString("base64");
        const mimeType =
          imageUrl.includes(".jpg") || imageUrl.includes(".jpeg")
            ? "image/jpeg"
            : "image/png";

        const visionResponse: Response = await fetch(
          `${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Describe this character's visual appearance in precise detail. Focus on: body type, proportions, colors, clothing, accessories, hair/fur, distinguishing features. Be specific about colors and shapes. Do not describe the background or art style.",
                    },
                    { inlineData: { mimeType, data: base64 } },
                  ],
                },
              ],
            }),
          },
        );

        if (!visionResponse.ok) return;

        const visionData = await visionResponse.json();
        const analysis: string | undefined =
          visionData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (analysis) {
          newDescriptions[storageId] = analysis;
        }
      }),
    );

    if (Object.keys(newDescriptions).length === 0) {
      throw new Error("Could not analyze any of the uploaded images");
    }

    // Merge new descriptions with existing ones and persist
    const allDescriptions = {
      ...(character.imageDescriptions ?? {}),
      ...newDescriptions,
    };
    await ctx.runMutation(api.characters.updateImageDescriptions, {
      characterId: args.characterId,
      imageDescriptions: allDescriptions,
    });

    // Step 2: Merge ALL image descriptions + character details into prompt fragment
    const descriptionsText = Object.values(allDescriptions)
      .map((d, i) => `Image ${i + 1}: ${d}`)
      .join("\n");

    const updatedPrompt = await mergeIntoPromptFragment(apiKey, {
      name: character.name,
      description: character.description,
      personality: character.personality,
      imageDescriptions: descriptionsText,
    });

    await ctx.runMutation(api.characters.updateCharacter, {
      characterId: args.characterId,
      promptFragment: updatedPrompt,
    });

    return { success: true, promptFragment: updatedPrompt };
  },
});

// Create or match characters detected from AI content generation
export const createDetectedCharacters = action({
  args: {
    userId: v.id("users"),
    characters: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        personality: v.string(),
        visualDescription: v.string(),
        appearsOn: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(api.characters.getUserCharacters, {
      userId: args.userId,
    });
    const existingByName = new Map(
      existing.map((c) => [c.name.toLowerCase().trim(), c]),
    );

    const results: Array<{
      name: string;
      characterId: Id<"characters">;
      appearsOn: string[];
      isNew: boolean;
      promptFragment: string;
      suggestedPromptFragment?: string;
    }> = [];

    for (const char of args.characters) {
      const match = existingByName.get(char.name.toLowerCase().trim());
      if (match) {
        // Reuse existing — fill empty promptFragment if needed
        if (!match.promptFragment?.trim() && char.visualDescription) {
          await ctx.runMutation(api.characters.updateCharacter, {
            characterId: match._id,
            promptFragment: char.visualDescription,
          });
        }
        // Suggest updated description when AI provides a different one
        const suggested =
          char.visualDescription &&
          char.visualDescription.trim() &&
          match.promptFragment?.trim() &&
          char.visualDescription.trim() !== match.promptFragment.trim()
            ? char.visualDescription
            : undefined;

        results.push({
          name: char.name,
          characterId: match._id,
          appearsOn: char.appearsOn,
          isNew: false,
          promptFragment: match.promptFragment || char.visualDescription,
          suggestedPromptFragment: suggested,
        });
      } else {
        const charId = await ctx.runMutation(api.characters.createCharacter, {
          userId: args.userId,
          name: char.name,
        });
        await ctx.runMutation(api.characters.updateCharacter, {
          characterId: charId,
          description: char.description,
          personality: char.personality,
          promptFragment: char.visualDescription,
        });
        results.push({
          name: char.name,
          characterId: charId,
          appearsOn: char.appearsOn,
          isNew: true,
          promptFragment: char.visualDescription,
        });
      }
    }

    return results;
  },
});

// Generate (or return cached) styled reference portrait for a character.
// Idempotent: returns existing image if the style matches.
export const ensureCharacterReference = action({
  args: {
    characterId: v.id("characters"),
    styleId: v.id("styles"),
    force: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ storageId: Id<"_storage"> | null }> => {
    try {
      const character = await ctx.runQuery(api.characters.getCharacter, {
        characterId: args.characterId,
      });
      if (!character) return { storageId: null };

      // Return cached if style matches (skip cache when forced)
      const cachedPortrait = (character.styledPortraits ?? []).find(
        (p) => p.styleId === args.styleId,
      );
      if (!args.force && cachedPortrait) {
        return { storageId: cachedPortrait.storageId };
      }

      // No prompt fragment → can't generate a meaningful reference
      if (!character.promptFragment?.trim()) {
        return { storageId: null };
      }

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return { storageId: null };

      // Look up style for illustration guidance
      const style = await ctx.runQuery(api.styles.getStyle, {
        styleId: args.styleId,
      });
      if (!style) return { storageId: null };

      const prompt = buildStyledReferencePrompt(character, style);

      const response: Response = await fetch(
        `${GEMINI_API_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["image", "text"] },
            safetySettings: [
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            ],
          }),
        },
      );

      if (!response.ok) return { storageId: null };

      const data = await response.json();
      const candidates = data.candidates;
      if (!candidates?.[0]?.content?.parts) return { storageId: null };

      const imagePart = candidates[0].content.parts.find(
        (part: { inlineData?: { data: string; mimeType: string } }) =>
          part.inlineData,
      );
      if (!imagePart?.inlineData) return { storageId: null };

      const imageData: string = imagePart.inlineData.data;
      const mimeType: string = imagePart.inlineData.mimeType || "image/png";
      const binaryString: string = atob(imageData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const storageId: Id<"_storage"> = await ctx.storage.store(blob);

      await ctx.runMutation(api.characters.addStyledPortrait, {
        characterId: args.characterId,
        styleId: args.styleId,
        storageId,
      });

      return { storageId };
    } catch {
      return { storageId: null };
    }
  },
});

function buildStyledReferencePrompt(
  character: { name: string; promptFragment: string; description: string; personality: string },
  style: { illustrationStyle: string; colors: { primary: string; secondary: string; accent: string } },
): string {
  const parts: string[] = [];

  parts.push(character.promptFragment);
  parts.push(
    `Create a character reference illustration of "${character.name}".`,
  );
  if (character.description) {
    parts.push(character.description);
  }
  if (character.personality) {
    parts.push(`Their personality is: ${character.personality}`);
  }
  parts.push(
    "IMPORTANT: follow the illustration style guidance EXACTLY: " +
      style.illustrationStyle,
  );
  parts.push(
    `Using these colors: ${style.colors.primary} (primary), ${style.colors.secondary} (secondary), ${style.colors.accent} (accent)`,
  );
  parts.push(
    "Create a clear, centered character portrait in 3:4 portrait orientation with a clean white background. The character should be shown from the waist up, facing slightly towards the viewer with a neutral, friendly expression. The illustration should be suitable as a character reference sheet for consistent reproduction in future illustrations.",
  );
  parts.push(
    "IMPORTANT: Do NOT include any text, words, letters, or labels in the image.",
  );
  parts.push(
    "This is an original character for therapy materials, not a copyrighted character. If the description resembles an existing character, make it visually distinct enough to be clearly original.",
  );

  return parts.join(". ");
}

// Generate a character group: N related but distinct characters from a description
export const generateCharacterGroup = action({
  args: {
    userId: v.id("users"),
    groupName: v.string(),
    groupDescription: v.string(),
    count: v.number(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ groupId: Id<"characterGroups">; characterIds: Id<"characters">[] }> => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

    const count = Math.max(2, Math.min(8, args.count));

    const prompt = `You are helping a therapist create a group of ${count} related but visually distinct characters for therapy materials (emotion cards, board games, worksheets).

Group Name: ${args.groupName}
Group Description: ${args.groupDescription}

Create ${count} characters that belong together as a group but are each visually unique. They should share a general theme or world but differ in appearance, personality, and role.

For each character provide:
- name: A distinct, child-friendly name
- description: 2-3 sentences describing their visual appearance (body type, colors, clothing, distinguishing features)
- personality: 1-2 sentences describing their personality traits
- promptFragment: A concise visual prompt fragment (2-4 sentences) for consistent image generation. Focus on physical appearance only — no emotions or scenes.

Respond in EXACTLY this JSON format, no other text:
[
  { "name": "...", "description": "...", "personality": "...", "promptFragment": "..." },
  ...
]`;

    const response: Response = await fetch(
      `${GEMINI_API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to generate character group",
      );
    }

    const data = await response.json();
    const text: string | undefined =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("No response from AI");

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse character data from AI response");

    const characters: Array<{
      name: string;
      description: string;
      personality: string;
      promptFragment: string;
    }> = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(characters) || characters.length === 0) {
      throw new Error("AI returned empty character list");
    }

    // Create each character
    const characterIds: Id<"characters">[] = [];
    for (const char of characters.slice(0, count)) {
      const charId = await ctx.runMutation(api.characters.createCharacter, {
        userId: args.userId,
        name: char.name,
      });
      await ctx.runMutation(api.characters.updateCharacter, {
        characterId: charId,
        description: char.description,
        personality: char.personality,
        promptFragment: char.promptFragment,
      });
      characterIds.push(charId);
    }

    // Create the group
    const groupId = await ctx.runMutation(api.characterGroups.createGroup, {
      userId: args.userId,
      name: args.groupName,
      description: args.groupDescription,
      characterIds,
    });

    return { groupId, characterIds };
  },
});

// Generate a reference image for a character
export const generateReferenceImage = action({
  args: { characterId: v.id("characters") },
  handler: async (
    ctx,
    args,
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
      `Create a character reference illustration of "${character.name}".`,
    );

    if (character.description) {
      parts.push(character.description);
    }
    if (character.personality) {
      parts.push(`Their personality is: ${character.personality}`);
    }

    parts.push(
      "Create a clear, centered character portrait in 3:4 portrait orientation with a clean white background. The character should be shown from the waist up, facing slightly towards the viewer with a neutral, friendly expression. The illustration should be suitable as a character reference sheet for consistent reproduction in future illustrations.",
    );
    parts.push(
      "IMPORTANT: Do NOT include any text, words, letters, or labels in the image.",
    );
    parts.push(
      "This is an original character for therapy materials, not a copyrighted character. If the description resembles an existing character, make it visually distinct enough to be clearly original.",
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
          safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to generate reference image",
      );
    }

    const data = await response.json();
    const candidates = data.candidates;
    const blocked =
      (!candidates || candidates.length === 0) ||
      candidates[0].finishReason === "SAFETY" ||
      !candidates[0].content?.parts;

    if (blocked) {
      // Ask the text model to suggest a copyright-free rewrite
      const suggestions = await suggestDescriptionFix(apiKey, {
        name: character.name,
        description: character.description,
        personality: character.personality,
      });
      throw new Error(
        JSON.stringify({ type: "SAFETY_BLOCK", suggestions }),
      );
    }

    const candidate = candidates[0];

    const responseParts = candidate.content.parts;
    const imagePart = responseParts.find(
      (part: { inlineData?: { data: string; mimeType: string } }) =>
        part.inlineData,
    );
    if (!imagePart?.inlineData) throw new Error("No image in response — the model returned only text.");

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
