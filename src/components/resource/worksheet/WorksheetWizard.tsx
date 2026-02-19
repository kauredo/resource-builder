"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { WizardLayout } from "@/components/resource/wizard/WizardLayout";
import { DraftResumeDialog } from "@/components/resource/DraftResumeDialog";
import { WorksheetSetupStep } from "./WorksheetSetupStep";
import { WorksheetContentStep } from "./WorksheetContentStep";
import { WorksheetGenerateStep } from "./WorksheetGenerateStep";
import { WorksheetExportStep } from "./WorksheetExportStep";
import {
  useWorksheetWizard,
  WORKSHEET_STEP_LABELS,
  WORKSHEET_STEP_TITLES,
} from "./use-worksheet-wizard";

const NEXT_LABELS = [
  "Create Content",
  "Generate Images",
  "Export",
  undefined,
] as const;

interface WorksheetWizardProps {
  resourceId?: Id<"resources">;
}

export function WorksheetWizard({ resourceId }: WorksheetWizardProps) {
  const wizard = useWorksheetWizard({ editResourceId: resourceId });

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

  const isStepCompleteArray = Array.from(
    { length: WORKSHEET_STEP_LABELS.length },
    (_, i) => wizard.isStepComplete(i),
  );

  return (
    <WizardLayout
      title="Worksheet"
      stepLabels={[...WORKSHEET_STEP_LABELS]}
      stepTitles={[...WORKSHEET_STEP_TITLES]}
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
        <WorksheetSetupStep
          state={wizard.state}
          onUpdate={wizard.updateState}
          userId={wizard.user!._id}
        />
      )}

      {wizard.currentStep === 1 && (
        <WorksheetContentStep
          state={wizard.state}
          onUpdate={wizard.updateState}
          onGenerateContent={wizard.handleGenerateContent}
          onUpdateCharacterPrompt={wizard.handleUpdateCharacterPrompt}
          onRemoveDetectedCharacter={wizard.handleRemoveDetectedCharacter}
          addBlock={wizard.addBlock}
          removeBlock={wizard.removeBlock}
          moveBlock={wizard.moveBlock}
          updateBlock={wizard.updateBlock}
        />
      )}

      {wizard.currentStep === 2 && (
        <WorksheetGenerateStep
          state={wizard.state}
          onUpdate={wizard.updateState}
        />
      )}

      {wizard.currentStep === 3 && (
        <WorksheetExportStep state={wizard.state} />
      )}
    </WizardLayout>
  );
}
