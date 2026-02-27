"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { AIWizard } from "@/components/resource/wizard/AIWizard";

interface CertificateAIWizardProps {
  resourceId?: Id<"resources">;
}

export function CertificateAIWizard({ resourceId }: CertificateAIWizardProps) {
  return <AIWizard resourceType="certificate" resourceId={resourceId} />;
}
