"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { AIWizard } from "@/components/resource/wizard/AIWizard";

interface BoardGameAIWizardProps {
  resourceId?: Id<"resources">;
}

export function BoardGameAIWizard({ resourceId }: BoardGameAIWizardProps) {
  return <AIWizard resourceType="board_game" resourceId={resourceId} />;
}
