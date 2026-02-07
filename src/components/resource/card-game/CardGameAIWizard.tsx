"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { AIWizard } from "@/components/resource/wizard/AIWizard";

interface CardGameAIWizardProps {
  resourceId?: Id<"resources">;
}

export function CardGameAIWizard({ resourceId }: CardGameAIWizardProps) {
  return <AIWizard resourceType="card_game" resourceId={resourceId} />;
}
