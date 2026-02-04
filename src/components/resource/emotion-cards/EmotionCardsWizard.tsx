"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
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
import type { EmotionCardContent, EmotionCardLayout, StylePreset } from "@/types";

// Wizard state types
export interface WizardState {
  // Step 1: Name & Style
  name: string;
  styleId: Id<"styles"> | null;
  stylePreset: StylePreset | null;

  // Step 2: Emotions
  selectedEmotions: string[];

  // Step 3: Character (optional)
  characterId: Id<"characters"> | null;

  // Step 4: Layout
  layout: EmotionCardLayout;

  // Resource tracking
  resourceId: Id<"resources"> | null;

  // Generation tracking
  generatedCards: Map<string, { storageId: Id<"_storage">; url: string }>;
  generationStatus: "idle" | "generating" | "complete" | "error";
}

const INITIAL_STATE: WizardState = {
  name: "",
  styleId: null,
  stylePreset: null,
  selectedEmotions: [],
  characterId: null,
  layout: {
    cardsPerPage: 6,
    cardSize: "medium",
    showLabels: true,
    showDescriptions: false,
  },
  resourceId: null,
  generatedCards: new Map(),
  generationStatus: "idle",
};

const STEP_TITLES = [
  "Name & Style",
  "Select Emotions",
  "Character",
  "Layout",
  "Generate",
  "Export",
];

export function EmotionCardsWizard() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const userCharacters = useQuery(
    api.characters.getUserCharacters,
    user?._id ? { userId: user._id } : "skip"
  );

  const createResource = useMutation(api.resources.createResource);
  const updateResource = useMutation(api.resources.updateResource);

  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [isNavigating, setIsNavigating] = useState(false);

  // Check if character step should be shown (only if user has characters)
  const hasCharacters = userCharacters && userCharacters.length > 0;

  // Get actual steps (skip character step if no characters)
  const getActualStepIndex = (displayStep: number): number => {
    if (!hasCharacters && displayStep >= 2) {
      return displayStep + 1; // Skip character step
    }
    return displayStep;
  };

  const getDisplayStepIndex = (actualStep: number): number => {
    if (!hasCharacters && actualStep >= 3) {
      return actualStep - 1;
    }
    return actualStep;
  };

  const totalDisplaySteps = hasCharacters ? 6 : 5;
  const actualStep = getActualStepIndex(currentStep);

  // Update state helper
  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Save draft to Convex after Step 1
  const saveDraft = useCallback(async () => {
    if (!user?._id || !state.styleId || !state.name) return null;

    const content: EmotionCardContent = {
      cards: state.selectedEmotions.map((emotion) => ({
        emotion,
        description: "",
        characterId: state.characterId ?? undefined,
      })),
      layout: state.layout,
    };

    if (state.resourceId) {
      // Update existing draft
      await updateResource({
        resourceId: state.resourceId,
        name: state.name,
        content,
      });
      return state.resourceId;
    } else {
      // Create new draft
      const resourceId = await createResource({
        userId: user._id,
        styleId: state.styleId,
        type: "emotion_cards",
        name: state.name,
        description: `Emotion card deck with ${state.selectedEmotions.length} cards`,
        content,
      });
      return resourceId;
    }
  }, [user?._id, state, createResource, updateResource]);

  // Navigation handlers
  const canGoNext = (): boolean => {
    switch (actualStep) {
      case 0: // Name & Style
        return state.name.trim().length > 0 && state.styleId !== null;
      case 1: // Emotions
        return state.selectedEmotions.length > 0;
      case 2: // Character (optional)
        return true;
      case 3: // Layout
        return true;
      case 4: // Generate
        return state.generationStatus === "complete";
      case 5: // Export
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      // Save draft after Step 1
      if (actualStep === 0 && !state.resourceId) {
        const resourceId = await saveDraft();
        if (resourceId) {
          updateState({ resourceId });
        }
      }

      // Update content when moving forward
      if (state.resourceId && actualStep > 0) {
        await saveDraft();
      }

      setCurrentStep((prev) => Math.min(prev + 1, totalDisplaySteps - 1));
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  // Render current step
  const renderStep = () => {
    switch (actualStep) {
      case 0:
        return (
          <NameStyleStep
            name={state.name}
            styleId={state.styleId}
            stylePreset={state.stylePreset}
            onUpdate={updateState}
          />
        );
      case 1:
        return (
          <EmotionSelectionStep
            selectedEmotions={state.selectedEmotions}
            onUpdate={updateState}
          />
        );
      case 2:
        return (
          <CharacterStep
            characterId={state.characterId}
            styleId={state.styleId}
            onUpdate={updateState}
          />
        );
      case 3:
        return (
          <LayoutOptionsStep
            layout={state.layout}
            onUpdate={updateState}
          />
        );
      case 4:
        return (
          <GenerateReviewStep
            state={state}
            onUpdate={updateState}
          />
        );
      case 5:
        return (
          <ExportStep
            state={state}
            onUpdate={updateState}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading">
        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Dashboard
        </button>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
          {STEP_TITLES[actualStep]}
        </h1>
      </div>

      {/* Compact progress indicator */}
      <nav className="mb-6 flex items-center gap-3" aria-label="Wizard progress">
        <div className="flex items-center gap-1.5" role="list">
          {Array.from({ length: totalDisplaySteps }).map((_, i) => {
            const isComplete = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div
                key={i}
                role="listitem"
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  isCurrent ? "w-6 bg-coral" : "w-1.5",
                  isComplete ? "bg-coral" : "",
                  !isComplete && !isCurrent ? "bg-muted" : ""
                )}
              />
            );
          })}
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          Step {currentStep + 1} of {totalDisplaySteps}
        </span>
      </nav>

      {/* Step content */}
      <div className="min-h-[400px]">
        {renderStep()}
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

        {actualStep < 5 ? (
          <Button
            className="btn-coral min-w-[120px]"
            onClick={handleNext}
            disabled={!canGoNext() || isNavigating}
          >
            {isNavigating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        ) : (
          <Button
            className="btn-coral min-w-[120px]"
            onClick={() => router.push("/dashboard")}
          >
            Done
            <Check className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
