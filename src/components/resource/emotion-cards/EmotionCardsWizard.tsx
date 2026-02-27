"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { NameStyleStep } from "./steps/NameStyleStep";
import { EmotionSelectionStep } from "./steps/EmotionSelectionStep";
import { CharacterStep } from "./steps/CharacterStep";
import { LayoutOptionsStep } from "./steps/LayoutOptionsStep";
import { GenerateReviewStep } from "./steps/GenerateReviewStep";
import { ExportStep } from "./steps/ExportStep";
import { WizardPreview } from "./WizardPreview";
import { DraftResumeDialog } from "@/components/resource/DraftResumeDialog";
import {
  NEXT_BUTTON_LABELS,
  STEP_LABELS,
  STEP_TITLES,
  TOTAL_STEPS,
  useEmotionCardsWizard,
} from "./use-emotion-cards-wizard";

interface EmotionCardsWizardProps {
  resourceId?: Id<"resources">;
}

export function EmotionCardsWizard({
  resourceId: editResourceId,
}: EmotionCardsWizardProps = {}) {
  const {
    user,
    state,
    updateState,
    currentStep,
    isNavigating,
    canGoNext,
    isStepComplete,
    goToStep,
    handleStyleChange,
    handleNext,
    handleBack,
    handleCancel,
    resumeDialog,
    emotionsWithImages,
    hasCharacters,
    showPreviewSidebar,
    preview,
    isLoading,
  } = useEmotionCardsWizard({ editResourceId });
  const progress = (currentStep + 1) / TOTAL_STEPS;

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <NameStyleStep
            name={state.name}
            styleId={state.styleId}
            stylePreset={state.stylePreset}
            onUpdate={updateState}
            onStyleChange={handleStyleChange}
            isFirstTimeUser={!user?.firstResourceCreatedAt}
            isEditMode={state.isEditMode}
            hasGeneratedImages={state.generationStatus === "complete"}
          />
        );
      case 1:
        return (
          <EmotionSelectionStep
            selectedEmotions={state.selectedEmotions}
            onUpdate={updateState}
            isFirstTimeUser={!user?.firstResourceCreatedAt}
            emotionsWithImages={emotionsWithImages}
          />
        );
      case 2:
        // Combined Options step: Character (if available) + Layout
        return (
          <div className="space-y-10">
            {hasCharacters && (
              <>
                <CharacterStep
                  characterId={state.characterIds?.[0] ?? null}
                  onUpdate={updateState}
                />
                <hr className="border-border/50" />
              </>
            )}
            <LayoutOptionsStep
              layout={state.layout}
              includeTextInImage={state.includeTextInImage}
              onUpdate={updateState}
              isFirstTimeUser={!user?.firstResourceCreatedAt}
              styleId={state.styleId}
            />
          </div>
        );
      case 3:
        return <GenerateReviewStep state={state} onUpdate={updateState} />;
      case 4:
        return <ExportStep state={state} onUpdate={updateState} />;
      default:
        return null;
    }
  };

  if (isLoading) {
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DraftResumeDialog
        open={resumeDialog.open}
        onResume={resumeDialog.onResume}
        onStartFresh={resumeDialog.onStartFresh}
      />
      {/* Header */}
      <div className="mb-8 border-b border-border/60 pb-5">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-150 motion-reduce:transition-none mb-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {state.isEditMode ? "Back to Resource" : "Dashboard"}
        </button>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {state.isEditMode ? "Editing" : "New"} Emotion Cards
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight mt-2">
              {STEP_TITLES[currentStep]}
            </h1>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress indicator with labels */}
        <nav className="mt-4" aria-label="Wizard progress">
          <div className="h-1 w-full rounded-full bg-border/70">
            <div
              className="h-1 rounded-full bg-coral origin-left transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="list">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const isComplete = i < currentStep;
              const isCurrent = i === currentStep;
              const canNavigate = state.isEditMode || (i <= currentStep && isStepComplete(i));
              return (
                <button
                  key={i}
                  type="button"
                  role="listitem"
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => {
                    if (canNavigate) goToStep(i);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em]",
                    "transition-colors duration-150 motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                    !canNavigate && "cursor-not-allowed",
                    isCurrent
                      ? "border-coral/40 text-foreground bg-[color-mix(in_oklch,var(--coral)_12%,transparent)]"
                      : isComplete
                        ? "border-border/70 text-muted-foreground"
                        : "border-border/60 text-muted-foreground/60"
                  )}
                  disabled={!canNavigate}
                >
                  <span className="tabular-nums">{i + 1}</span>
                  <span className="hidden sm:inline">{STEP_LABELS[i]}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content area with optional preview */}
      <div className="min-h-[400px]">
        {showPreviewSidebar ? (
          <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-12 items-start">
            {/* Step content - takes available space */}
            <div className="flex-1 min-w-0">{renderStep()}</div>

            {/* Preview - fixed width, sticky on desktop */}
            <aside className="w-full md:w-auto md:sticky md:top-8 flex justify-center md:justify-start pb-4 md:pb-0 border-b md:border-b-0 border-border/50">
              <WizardPreview
                colors={preview.colors}
                typography={preview.typography}
                frameUrls={preview.frameUrls}
                layout={state.layout}
                cardLayout={preview.cardLayout}
                generatedImageUrl={preview.generatedImageUrl}
                emotion={preview.emotion}
              />
            </aside>
          </div>
        ) : (
          renderStep()
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isNavigating}
          className="min-w-[100px]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>

        {currentStep < TOTAL_STEPS - 1 ? (
          <Button
            className="btn-coral min-w-[120px]"
            onClick={handleNext}
            disabled={!canGoNext() || isNavigating}
          >
            {isNavigating ? (
              <>
                <span
                  className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              <>
                {NEXT_BUTTON_LABELS[currentStep] ?? "Continue"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        ) : (
          <Button
            className="btn-coral min-w-[120px]"
            onClick={handleCancel}
          >
            Done
            <Check className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
