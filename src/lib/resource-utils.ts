import type {
  EmotionCardContent,
  FlashcardsContent,
  WorksheetContent,
  BoardGameContent,
  CardGameContent,
  FreePromptContent,
  PosterContent,
} from "@/types";

export function getItemCount(resource: {
  type: string;
  content: unknown;
  assetCount?: number;
  images?: unknown[];
}): number {
  switch (resource.type) {
    case "emotion_cards":
      return (resource.content as EmotionCardContent)?.cards?.length ?? 0;
    case "flashcards":
      return (resource.content as FlashcardsContent)?.cards?.length ?? 0;
    case "worksheet":
      return (resource.content as WorksheetContent)?.blocks?.length ?? 0;
    case "board_game": {
      const grid = (resource.content as BoardGameContent)?.grid;
      if (!grid) return 0;
      return grid.rows * grid.cols;
    }
    case "card_game":
      return (
        (resource.content as CardGameContent)?.cards?.reduce(
          (sum, card) => sum + (card.count ?? 0),
          0
        ) ?? 0
      );
    case "poster":
      return (resource.content as PosterContent)?.imageAssetKey ? 1 : 0;
    case "free_prompt":
      return (resource.content as FreePromptContent)?.imageAssetKey ? 1 : 0;
    default:
      return resource.assetCount ?? resource.images?.length ?? 0;
  }
}
