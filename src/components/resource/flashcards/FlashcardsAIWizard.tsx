"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { AIWizard } from "@/components/resource/wizard/AIWizard";

interface FlashcardsAIWizardProps {
  resourceId?: Id<"resources">;
}

export function FlashcardsAIWizard({ resourceId }: FlashcardsAIWizardProps) {
  return <AIWizard resourceType="flashcards" resourceId={resourceId} />;
}
