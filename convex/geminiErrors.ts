/**
 * Maps raw Gemini API error responses to user-friendly messages.
 */
export function friendlyGeminiError(status: number, message: string): string {
  const lower = message.toLowerCase();

  if (status === 429 || lower.includes("quota")) {
    return "Image generation limit reached. Please try again later.";
  }

  if (
    status === 503 ||
    lower.includes("high demand") ||
    lower.includes("overloaded")
  ) {
    return "The image service is temporarily unavailable. Please try again shortly.";
  }

  if (lower.includes("safety") || lower.includes("blocked")) {
    return "The image couldn't be generated due to content guidelines. Try adjusting your description.";
  }

  return "Image generation failed. Please try again.";
}
