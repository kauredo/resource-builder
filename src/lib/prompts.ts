import { StylePreset } from "@/types";

/**
 * Build an image generation prompt that incorporates style settings
 */
export function buildImagePrompt({
  basePrompt,
  style,
  characterPromptFragment,
}: {
  basePrompt: string;
  style: StylePreset;
  characterPromptFragment?: string;
}): string {
  const parts: string[] = [];

  // Start with character prompt fragment if provided
  if (characterPromptFragment) {
    parts.push(characterPromptFragment);
  }

  // Add the base prompt (e.g., "a child showing the emotion Happy")
  parts.push(basePrompt);

  // Always include the style's illustration style
  parts.push(style.illustrationStyle);

  // Add color guidance
  parts.push(
    `Using these colors: ${style.colors.primary} (primary), ${style.colors.secondary} (secondary), ${style.colors.accent} (accent)`
  );

  return parts.join(". ");
}

/**
 * Build a prompt for generating an emotion card illustration
 */
export function buildEmotionCardPrompt({
  emotion,
  style,
  characterPromptFragment,
  description,
}: {
  emotion: string;
  style: StylePreset;
  characterPromptFragment?: string;
  description?: string;
}): string {
  let basePrompt = `A child-friendly illustration showing the emotion "${emotion}"`;

  if (description) {
    basePrompt += `. ${description}`;
  }

  return buildImagePrompt({
    basePrompt,
    style,
    characterPromptFragment,
  });
}

/**
 * Build a prompt for generating a character reference image
 */
export function buildCharacterReferencePrompt({
  name,
  description,
  personality,
  style,
}: {
  name: string;
  description: string;
  personality: string;
  style: StylePreset;
}): string {
  const basePrompt = `Character design for ${name}: ${description}. Personality: ${personality}. Full body view, neutral pose, clear features for recognition`;

  return buildImagePrompt({
    basePrompt,
    style,
  });
}
