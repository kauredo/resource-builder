"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { WizardLayout } from "@/components/resource/wizard/WizardLayout";
import { DraftResumeDialog } from "@/components/resource/DraftResumeDialog";
import { BookSetupStep } from "./BookSetupStep";
import { BookContentStep } from "./BookContentStep";
import { BookGenerateStep } from "./BookGenerateStep";
import { BookExportStep } from "./BookExportStep";
import {
  useBookWizard,
  BOOK_STEP_LABELS,
  BOOK_STEP_TITLES,
} from "./use-book-wizard";

const NEXT_LABELS = [
  "Create Content",
  "Generate Images",
  "Export",
  undefined,
] as const;

interface BookWizardProps {
  resourceId?: Id<"resources">;
}

export function BookWizard({ resourceId }: BookWizardProps) {
  const wizard = useBookWizard({ editResourceId: resourceId });

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
    { length: BOOK_STEP_LABELS.length },
    (_, i) => wizard.isStepComplete(i),
  );

  return (
    <WizardLayout
      title="Book"
      stepLabels={[...BOOK_STEP_LABELS]}
      stepTitles={[...BOOK_STEP_TITLES]}
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
        <BookSetupStep
          state={wizard.state}
          onUpdate={wizard.updateState}
          onStyleChange={wizard.handleStyleChange}
          userId={wizard.user!._id}
        />
      )}

      {wizard.currentStep === 1 && (
        <BookContentStep
          state={wizard.state}
          onUpdate={wizard.updateState}
          onGenerateContent={wizard.handleGenerateContent}
          onUpdateCharacterPrompt={wizard.handleUpdateCharacterPrompt}
          onRemoveDetectedCharacter={wizard.handleRemoveDetectedCharacter}
          addPage={wizard.addPage}
          removePage={wizard.removePage}
          movePage={wizard.movePage}
          updatePage={wizard.updatePage}
        />
      )}

      {wizard.currentStep === 2 && (
        <BookGenerateStep
          state={wizard.state}
          onUpdate={wizard.updateState}
        />
      )}

      {wizard.currentStep === 3 && (
        <BookExportStep state={wizard.state} />
      )}
    </WizardLayout>
  );
}
