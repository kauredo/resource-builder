"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { EmotionCardsWizard } from "@/components/resource/emotion-cards/EmotionCardsWizard";
import { PosterAIWizard } from "@/components/resource/poster/PosterAIWizard";
import { FlashcardsAIWizard } from "@/components/resource/flashcards/FlashcardsAIWizard";
import { WorksheetWizard } from "@/components/resource/worksheet/WorksheetWizard";
import { BoardGameAIWizard } from "@/components/resource/board-game/BoardGameAIWizard";
import { CardGameAIWizard } from "@/components/resource/card-game/CardGameAIWizard";
import { FreePromptWizard } from "@/components/resource/free-prompt/FreePromptWizard";
import { BookWizard } from "@/components/resource/book/BookWizard";
import { BehaviorChartAIWizard } from "@/components/resource/behavior-chart/BehaviorChartAIWizard";
import { VisualScheduleAIWizard } from "@/components/resource/visual-schedule/VisualScheduleAIWizard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditResourcePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const resourceId = resolvedParams.id as Id<"resources">;
  const resource = useQuery(api.resources.getResource, { resourceId });

  if (!resource) return null;

  switch (resource.type) {
    case "emotion_cards":
      return <EmotionCardsWizard resourceId={resourceId} />;
    case "poster":
      return <PosterAIWizard resourceId={resourceId} />;
    case "flashcards":
      return <FlashcardsAIWizard resourceId={resourceId} />;
    case "worksheet":
      return <WorksheetWizard resourceId={resourceId} />;
    case "board_game":
      return <BoardGameAIWizard resourceId={resourceId} />;
    case "card_game":
      return <CardGameAIWizard resourceId={resourceId} />;
    case "free_prompt":
      return <FreePromptWizard resourceId={resourceId} />;
    case "book":
      return <BookWizard resourceId={resourceId} />;
    case "behavior_chart":
      return <BehaviorChartAIWizard resourceId={resourceId} />;
    case "visual_schedule":
      return <VisualScheduleAIWizard resourceId={resourceId} />;
    default:
      return null;
  }
}
