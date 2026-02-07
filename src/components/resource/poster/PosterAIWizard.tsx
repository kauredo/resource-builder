"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { AIWizard } from "@/components/resource/wizard/AIWizard";

interface PosterAIWizardProps {
  resourceId?: Id<"resources">;
}

export function PosterAIWizard({ resourceId }: PosterAIWizardProps) {
  return <AIWizard resourceType="poster" resourceId={resourceId} />;
}
