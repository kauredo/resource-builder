"use client";

import { use } from "react";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { EmotionCardsWizard } from "@/components/resource/emotion-cards/EmotionCardsWizard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditResourcePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const resourceId = resolvedParams.id as Id<"resources">;

  return <EmotionCardsWizard resourceId={resourceId} />;
}
