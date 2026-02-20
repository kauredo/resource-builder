import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract all unique character IDs from any resource content.
 * Checks both resource-level characters and per-item characterIds.
 */
export function extractCharacterIds(content: Record<string, unknown>): string[] {
  const ids = new Set<string>();

  // Resource-level characters
  const chars = content.characters as { characterIds?: string[] } | undefined;
  if (chars?.characterIds) {
    for (const id of chars.characterIds) ids.add(id);
  }

  // Per-item characterIds (cards, pages, blocks, tokens, etc.)
  for (const key of ["cards", "pages", "blocks", "tokens"]) {
    const items = content[key] as Array<{ characterIds?: string[] }> | undefined;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.characterIds) {
          for (const id of item.characterIds) ids.add(id);
        }
      }
    }
  }

  return Array.from(ids);
}

export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
