"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { AIWizard } from "@/components/resource/wizard/AIWizard";

interface ColoringPagesAIWizardProps {
  resourceId?: Id<"resources">;
}

export function ColoringPagesAIWizard({ resourceId }: ColoringPagesAIWizardProps) {
  return <AIWizard resourceType="coloring_pages" resourceId={resourceId} />;
}
