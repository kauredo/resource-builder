"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { WizardLayout } from "@/components/resource/wizard/WizardLayout";
import { DraftResumeDialog } from "@/components/resource/DraftResumeDialog";
import { WizardDescribeStep } from "./WizardDescribeStep";
import { WizardGenerateStep } from "./WizardGenerateStep";
import { WizardExportStep } from "./WizardExportStep";
import { PosterReview } from "./review/PosterReview";
import { FlashcardsReview } from "./review/FlashcardsReview";
import { CardGameReview } from "./review/CardGameReview";
import { BoardGameReview } from "./review/BoardGameReview";
import { BehaviorChartReview } from "./review/BehaviorChartReview";
import { DetectedCharactersReview } from "./DetectedCharactersReview";
import {
  useAIWizard,
  STEP_LABELS,
  STEP_TITLES,
  type AIWizardState,
} from "./use-ai-wizard";
import type { ResourceType } from "@/types";

const TITLE_MAP: Record<string, string> = {
  poster: "Poster",
  flashcards: "Flashcards",
  card_game: "Card Game",
  board_game: "Board Game",
  behavior_chart: "Behavior Chart",
};

const NEXT_LABELS = [
  "Generate Content",
  "Generate Images",
  "Export",
  undefined,
] as const;

interface AIWizardProps {
  resourceType: ResourceType;
  resourceId?: Id<"resources">;
}

export function AIWizard({ resourceType, resourceId }: AIWizardProps) {
  const wizard = useAIWizard({ resourceType, editResourceId: resourceId });

  if (wizard.isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="status"
        aria-label="Loading"
      >
        <div className="size-8 border-2 border-coral border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
      </div>
    );
  }

  const isStepCompleteArray = Array.from({ length: STEP_LABELS.length }, (_, i) =>
    wizard.isStepComplete(i),
  );

  return (
    <WizardLayout
      title={TITLE_MAP[resourceType] || resourceType}
      stepLabels={[...STEP_LABELS]}
      stepTitles={[...STEP_TITLES]}
      currentStep={wizard.currentStep}
      onStepClick={wizard.goToStep}
      isStepComplete={isStepCompleteArray}
      onBack={wizard.handleBack}
      onNext={wizard.handleNext}
      onCancel={wizard.handleCancel}
      canGoNext={wizard.canGoNext()}
      isNavigating={wizard.isNavigating}
      isEditMode={wizard.state.isEditMode}
      nextLabel={NEXT_LABELS[wizard.currentStep] ?? undefined}
    >
      <DraftResumeDialog
        open={wizard.resumeDialog.open}
        onResume={wizard.resumeDialog.onResume}
        onStartFresh={wizard.resumeDialog.onStartFresh}
      />

      {wizard.currentStep === 0 && (
        <WizardDescribeStep
          state={wizard.state}
          onUpdate={wizard.updateState}
          onStyleChange={wizard.handleStyleChange}
          onGenerateContent={wizard.handleGenerateContent}
          userId={wizard.user!._id}
        />
      )}

      {wizard.currentStep === 1 && (
        <div className="space-y-6">
          <DetectedCharactersReview
            characters={wizard.state.detectedCharacters}
            status={wizard.state.detectedCharactersStatus}
            styleId={wizard.state.styleId ?? undefined}
            onUpdatePromptFragment={wizard.handleUpdateCharacterPrompt}
            onRemoveCharacter={wizard.handleRemoveDetectedCharacter}
          />
          <ReviewStep
            resourceType={resourceType}
            state={wizard.state}
            onUpdate={wizard.updateState}
          />
        </div>
      )}

      {wizard.currentStep === 2 && (
        <WizardGenerateStep
          state={wizard.state}
          onUpdate={wizard.updateState}
        />
      )}

      {wizard.currentStep === 3 && (
        <WizardExportStep state={wizard.state} />
      )}
    </WizardLayout>
  );
}

/** Route to the correct per-type review component */
function ReviewStep({
  resourceType,
  state,
  onUpdate,
}: {
  resourceType: ResourceType;
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}) {
  if (!state.generatedContent) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No content generated yet. Go back and describe your resource.</p>
      </div>
    );
  }

  switch (resourceType) {
    case "poster":
      return <PosterReview state={state} onUpdate={onUpdate} />;
    case "flashcards":
      return <FlashcardsReview state={state} onUpdate={onUpdate} />;
    case "card_game":
      return <CardGameReview state={state} onUpdate={onUpdate} />;
    case "board_game":
      return <BoardGameReview state={state} onUpdate={onUpdate} />;
    case "behavior_chart":
      return <BehaviorChartReview state={state} onUpdate={onUpdate} />;
    default:
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>Review not available for this resource type.</p>
        </div>
      );
  }
}
