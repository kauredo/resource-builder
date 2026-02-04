"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { STYLE_PRESETS } from "@/lib/style-presets";
import type { EmotionCardContent, EmotionCardLayout, StylePreset } from "@/types";

// Wizard state types
export interface WizardState {
  // Step 1: Name & Style
  name: string;
  styleId: Id<"styles"> | null;
  stylePreset: StylePreset | null;

  // Step 2: Emotions
  selectedEmotions: string[];
  // Track original emotions for edit mode (to detect changes)
  originalEmotions: string[];

  // Step 3: Character (optional)
  characterId: Id<"characters"> | null;

  // Step 4: Layout
  layout: EmotionCardLayout;

  // Image generation options
  includeTextInImage: boolean;

  // Resource tracking
  resourceId: Id<"resources"> | null;

  // Generation tracking
  generatedCards: Map<string, { storageId: Id<"_storage">; url: string }>;
  generationStatus: "idle" | "generating" | "complete" | "error";

  // Edit mode tracking
  isEditMode: boolean;
}

const INITIAL_STATE: WizardState = {
  name: "",
  styleId: null,
  stylePreset: null,
  selectedEmotions: [],
  originalEmotions: [],
  characterId: null,
  layout: {
    cardsPerPage: 6,
    cardSize: "medium",
    showLabels: true,
    showDescriptions: false,
  },
  includeTextInImage: false,
  resourceId: null,
  generatedCards: new Map(),
  generationStatus: "idle",
  isEditMode: false,
};

const STEP_TITLES = [
  "Name & Style",
  "Select Emotions",
  "Character",
  "Layout",
  "Generate",
  "Export",
];

interface EmotionCardsWizardProps {
  resourceId?: Id<"resources">;
}

export function EmotionCardsWizard({ resourceId: editResourceId }: EmotionCardsWizardProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStyleName = searchParams.get("style");
  const user = useQuery(api.users.currentUser);
  const userCharacters = useQuery(
    api.characters.getUserCharacters,
    user?._id ? { userId: user._id } : "skip"
  );

  // Query existing resource for edit mode
  const existingResource = useQuery(
    api.resources.getResourceWithImages,
    editResourceId ? { resourceId: editResourceId } : "skip"
  );
  const existingStyle = useQuery(
    api.styles.getStyle,
    existingResource?.styleId ? { styleId: existingResource.styleId } : "skip"
  );

  const createResource = useMutation(api.resources.createResource);
  const updateResource = useMutation(api.resources.updateResource);
  const removeImagesFromResource = useMutation(api.resources.removeImagesFromResource);
  const recordFirstResource = useMutation(api.users.recordFirstResource);
  const getOrCreatePresetStyle = useMutation(api.styles.getOrCreatePresetStyle);

  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [isNavigating, setIsNavigating] = useState(false);
  const hasInitializedEditMode = useRef(false);

  // Initialize state from existing resource in edit mode
  useEffect(() => {
    if (
      editResourceId &&
      existingResource &&
      existingStyle &&
      !hasInitializedEditMode.current
    ) {
      hasInitializedEditMode.current = true;
      const content = existingResource.content as EmotionCardContent;
      const emotions = content.cards.map((c) => c.emotion);

      // Build stylePreset from existing style
      const stylePreset: StylePreset = {
        name: existingStyle.name,
        colors: existingStyle.colors,
        typography: existingStyle.typography,
        illustrationStyle: existingStyle.illustrationStyle,
      };

      setState({
        name: existingResource.name,
        styleId: existingResource.styleId,
        stylePreset,
        selectedEmotions: emotions,
        originalEmotions: emotions,
        characterId: content.cards[0]?.characterId as Id<"characters"> | null ?? null,
        layout: content.layout,
        includeTextInImage: false, // Default to no text in images
        resourceId: existingResource._id,
        generatedCards: new Map(),
        generationStatus: existingResource.images.length > 0 ? "complete" : "idle",
        isEditMode: true,
      });
    }
  }, [editResourceId, existingResource, existingStyle]);

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
    if (!user?._id || !state.name) return null;
    if (!state.styleId && !state.stylePreset) return null;

    // Ensure we have a styleId - create from preset if needed
    let styleId = state.styleId;
    if (!styleId && state.stylePreset) {
      styleId = await getOrCreatePresetStyle({
        userId: user._id,
        name: state.stylePreset.name,
        colors: state.stylePreset.colors,
        typography: state.stylePreset.typography,
        illustrationStyle: state.stylePreset.illustrationStyle,
      });
      // Update state with the new styleId
      updateState({ styleId });
    }

    if (!styleId) return null;

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

      // In edit mode, clean up images for removed emotions
      if (state.isEditMode && state.originalEmotions.length > 0) {
        const removedEmotions = state.originalEmotions.filter(
          (e) => !state.selectedEmotions.includes(e)
        );
        if (removedEmotions.length > 0) {
          await removeImagesFromResource({
            resourceId: state.resourceId,
            emotionsToRemove: removedEmotions,
          });
        }
      }

      return state.resourceId;
    } else {
      // Create new draft
      const resourceId = await createResource({
        userId: user._id,
        styleId,
        type: "emotion_cards",
        name: state.name,
        description: `Emotion card deck with ${state.selectedEmotions.length} cards`,
        content,
      });
      // Record this as the user's first resource (for onboarding analytics)
      await recordFirstResource();
      return resourceId;
    }
  }, [user?._id, state, createResource, updateResource, removeImagesFromResource, recordFirstResource, getOrCreatePresetStyle, updateState]);

  // Navigation handlers
  const canGoNext = (): boolean => {
    switch (actualStep) {
      case 0: // Name & Style
        return state.name.trim().length > 0 && (state.styleId !== null || state.stylePreset !== null);
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
    if (state.isEditMode && state.resourceId) {
      router.push(`/dashboard/resources/${state.resourceId}`);
    } else {
      router.push("/dashboard");
    }
  };

  // Compute emotions that already have generated images (for edit mode)
  const emotionsWithImages = existingResource?.images
    .map((img) => img.description)
    .filter(Boolean) ?? [];

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
            initialStyleName={initialStyleName}
            isFirstTimeUser={!user?.firstResourceCreatedAt}
            isEditMode={state.isEditMode}
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
            includeTextInImage={state.includeTextInImage}
            onUpdate={updateState}
            isFirstTimeUser={!user?.firstResourceCreatedAt}
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

  // Show loading state while user or edit mode data is loading
  const isLoadingEditData = editResourceId && (!existingResource || !existingStyle);
  if (!user || isLoadingEditData) {
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
          className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-150 mb-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {state.isEditMode ? "Back to Resource" : "Dashboard"}
        </button>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
          {state.isEditMode ? `Edit: ${STEP_TITLES[actualStep]}` : STEP_TITLES[actualStep]}
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
            onClick={() => {
              if (state.isEditMode && state.resourceId) {
                router.push(`/dashboard/resources/${state.resourceId}`);
              } else {
                router.push("/dashboard");
              }
            }}
          >
            Done
            <Check className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
