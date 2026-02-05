/**
 * Emotion-related utilities and descriptions
 */

/**
 * Get a human-readable description for an emotion
 */
export function getEmotionDescription(emotion: string): string {
  const descriptions: Record<string, string> = {
    Happy: "Feeling joyful and content",
    Sad: "Feeling down or unhappy",
    Angry: "Feeling frustrated or mad",
    Scared: "Feeling afraid or worried",
    Surprised: "Feeling amazed or startled",
    Disgusted: "Feeling repulsed or dislike",
    Excited: "Feeling enthusiastic and eager",
    Calm: "Feeling peaceful and relaxed",
    Worried: "Feeling anxious about something",
    Frustrated: "Feeling stuck or annoyed",
    Proud: "Feeling good about an achievement",
    Embarrassed: "Feeling self-conscious",
    Disappointed: "Feeling let down",
    Overwhelmed: "Feeling too much at once",
    Lonely: "Feeling alone or isolated",
    Confused: "Feeling uncertain or puzzled",
    Jealous: "Wanting what others have",
    Hopeful: "Feeling optimistic about the future",
    Grateful: "Feeling thankful and appreciative",
    Nervous: "Feeling uneasy or anxious",
  };

  return descriptions[emotion] || `Experiencing ${emotion.toLowerCase()}`;
}
