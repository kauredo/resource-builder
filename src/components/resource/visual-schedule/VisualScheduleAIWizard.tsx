"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { AIWizard } from "@/components/resource/wizard/AIWizard";

interface VisualScheduleAIWizardProps {
  resourceId?: Id<"resources">;
}

export function VisualScheduleAIWizard({ resourceId }: VisualScheduleAIWizardProps) {
  return <AIWizard resourceType="visual_schedule" resourceId={resourceId} />;
}
