"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { AIWizard } from "@/components/resource/wizard/AIWizard";

interface BehaviorChartAIWizardProps {
  resourceId?: Id<"resources">;
}

export function BehaviorChartAIWizard({ resourceId }: BehaviorChartAIWizardProps) {
  return <AIWizard resourceType="behavior_chart" resourceId={resourceId} />;
}
