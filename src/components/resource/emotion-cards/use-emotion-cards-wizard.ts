"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import type {
  EmotionCardContent,
  EmotionCardLayout,
  StylePreset,
} from "@/types";

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

  // Step 3: Character (optional, in Options step)
  characterId: Id<"characters"> | null;

  // Step 3: Layout (in Options step)
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

export const INITIAL_STATE: WizardState = {
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

// 5 steps: Name & Style → Emotions → Options → Generate → Export
export const STEP_LABELS = [
  "Style",
  "Emotions",
  "Options",
  "Generate",
  "Export",
] as const;

export const STEP_TITLES = [
  "Name & Style",
  "Select Emotions",
  "Options",
  "Generate",
  "Export",
] as const;

export const TOTAL_STEPS = 5;

// Context-aware button labels for "Continue"
export const NEXT_BUTTON_LABELS = [
  "Choose Emotions",
  "Configure Options",
  "Generate Cards",
  "Export",
] as const;

interface UseEmotionCardsWizardArgs {
  editResourceId?: Id<"resources">;
}

export function useEmotionCardsWizard({
  editResourceId,
}: UseEmotionCardsWizardArgs = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStyleId = searchParams.get("styleId") as Id<"styles"> | null;
  const user = useQuery(api.users.currentUser);
  const userCharacters = useQuery(
    api.characters.getUserCharacters,
    user?._id ? { userId: user._id } : "skip",
  );
  const draftResources = useQuery(
    api.resources.getResourcesByType,
    user?._id ? { userId: user._id, type: "emotion_cards" } : "skip",
  );

  // Query existing resource for edit mode
  const existingResource = useQuery(
    api.resources.getResourceWithImages,
    editResourceId ? { resourceId: editResourceId } : "skip",
  );
  const existingStyle = useQuery(
    api.styles.getStyle,
    existingResource?.styleId ? { styleId: existingResource.styleId } : "skip",
  );

  // Query initial style from URL param (for "Use Style" button from styles page)
  const initialStyle = useQuery(
    api.styles.getStyle,
    initialStyleId ? { styleId: initialStyleId } : "skip",
  );

  const createResource = useMutation(api.resources.createResource);
  const updateResource = useMutation(api.resources.updateResource);
  const removeImagesFromResource = useMutation(
    api.resources.removeImagesFromResource,
  );
  const recordFirstResource = useMutation(api.users.recordFirstResource);
  const getOrCreatePresetStyle = useMutation(api.styles.getOrCreatePresetStyle);

  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [isNavigating, setIsNavigating] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<Id<"resources"> | null>(
    null,
  );
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const hasInitializedEditMode = useRef(false);
  const hasInitializedFromUrl = useRef(false);
  const hasPromptedResume = useRef(false);
  // Track which styleId we've inherited defaultUseFrames from
  const lastInheritedStyleId = useRef<Id<"styles"> | null>(null);

  // Query style with frame URLs for preview
  // Prefer state.styleId (user selection), then URL param, then edit mode
  const selectedStyleId =
    state.styleId || initialStyleId || existingResource?.styleId || undefined;
  const styleWithFrames = useQuery(
    api.styles.getStyleWithFrameUrls,
    selectedStyleId ? { styleId: selectedStyleId } : "skip",
  );

  // Initialize state from URL styleId param (e.g., from "Use Style" button)
  useEffect(() => {
    if (
      initialStyleId &&
      initialStyle &&
      !editResourceId &&
      !hasInitializedFromUrl.current &&
      !state.styleId
    ) {
      hasInitializedFromUrl.current = true;
      setState(prev => ({
        ...prev,
        styleId: initialStyleId,
        stylePreset: {
          name: initialStyle.name,
          colors: initialStyle.colors,
          typography: initialStyle.typography,
          illustrationStyle: initialStyle.illustrationStyle,
        },
      }));
    }
  }, [initialStyleId, initialStyle, editResourceId, state.styleId]);

  // Offer to resume draft if one exists (only for new resources)
  useEffect(() => {
    if (!user?._id) return;
    if (editResourceId || state.resourceId) return;
    if (draftResources === undefined) return;
    if (hasPromptedResume.current) return;

    const drafts = draftResources.filter((r) => r.status === "draft");
    if (drafts.length === 0) return;

    const latest = drafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    setResumeDraftId(latest._id);
    setShowResumeDialog(true);
    hasPromptedResume.current = true;
  }, [user?._id, editResourceId, state.resourceId, draftResources]);

  // Initialize state from existing resource in edit mode
  useEffect(() => {
    if (
      editResourceId &&
      existingResource &&
      !hasInitializedEditMode.current
    ) {
      // Wait for style to load if the resource has one
      if (existingResource.styleId && !existingStyle) return;

      hasInitializedEditMode.current = true;
      const content = existingResource.content as EmotionCardContent;
      const emotions = content.cards.map(c => c.emotion);

      // Build stylePreset from existing style
      const stylePreset: StylePreset | null = existingStyle
        ? {
            name: existingStyle.name,
            colors: existingStyle.colors,
            typography: existingStyle.typography,
            illustrationStyle: existingStyle.illustrationStyle,
          }
        : null;

      setState({
        name: existingResource.name,
        styleId: existingResource.styleId ?? null,
        stylePreset,
        selectedEmotions: emotions,
        originalEmotions: emotions,
        characterId:
          (content.cards[0]?.characterId as Id<"characters"> | null) ?? null,
        layout: content.layout,
        includeTextInImage: false, // Default to no text in images
        resourceId: existingResource._id,
        generatedCards: new Map(),
        generationStatus:
          existingResource.images.length > 0 ? "complete" : "idle",
        isEditMode: true,
      });
    }
  }, [editResourceId, existingResource, existingStyle]);

  // Inherit defaultUseFrames from selected style (not in edit mode)
  // This makes StylePreview toggles carry over to new resources
  useEffect(() => {
    if (
      styleWithFrames &&
      state.styleId &&
      !state.isEditMode &&
      lastInheritedStyleId.current !== state.styleId
    ) {
      lastInheritedStyleId.current = state.styleId;

      // Inherit defaultUseFrames if the style has them
      if (styleWithFrames.defaultUseFrames) {
        setState(prev => ({
          ...prev,
          layout: {
            ...prev.layout,
            useFrames: styleWithFrames.defaultUseFrames,
          },
        }));
      }
    }
  }, [styleWithFrames, state.styleId, state.isEditMode]);

  // Check if user has characters (for Options step)
  const hasCharacters = userCharacters && userCharacters.length > 0;

  // Update state helper
  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Save draft to Convex after Step 1
  const saveDraft = useCallback(async () => {
    if (!user?._id || !state.name) return null;

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
      updateState({ styleId });
    }

    const content: EmotionCardContent = {
      cards: state.selectedEmotions.map(emotion => ({
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
          e => !state.selectedEmotions.includes(e),
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
        styleId: styleId ?? undefined,
        type: "emotion_cards",
        name: state.name,
        description: `Emotion card deck with ${state.selectedEmotions.length} cards`,
        content,
      });
      // Record this as the user's first resource (for onboarding analytics)
      await recordFirstResource();
      return resourceId;
    }
  }, [
    user?._id,
    state,
    createResource,
    updateResource,
    removeImagesFromResource,
    recordFirstResource,
    getOrCreatePresetStyle,
    updateState,
  ]);

  // Navigation handlers
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 0: // Name & Style
        return state.name.trim().length > 0;
      case 1: // Emotions
        return state.selectedEmotions.length > 0;
      case 2: // Options (Character + Layout)
        return true;
      case 3: // Generate
        return state.generationStatus === "complete";
      case 4: // Export
        return true;
      default:
        return false;
    }
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0:
        return state.name.trim().length > 0;
      case 1:
        return state.selectedEmotions.length > 0;
      case 2:
        return true;
      case 3:
        return state.generationStatus === "complete";
      case 4:
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
      if (currentStep === 0 && !state.resourceId) {
        const resourceId = await saveDraft();
        if (resourceId) {
          updateState({ resourceId });
        }
      }

      // Update content when moving forward
      if (state.resourceId && currentStep > 0) {
        await saveDraft();
      }

      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleCancel = () => {
    if (state.isEditMode && state.resourceId) {
      router.push(`/dashboard/resources/${state.resourceId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleResumeDraft = () => {
    if (!resumeDraftId) return;
    setShowResumeDialog(false);
    router.push(`/dashboard/resources/${resumeDraftId}/edit`);
  };

  const handleStartFresh = () => {
    setShowResumeDialog(false);
    setResumeDraftId(null);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Compute emotions that already have generated images (for edit mode)
  const emotionsWithImages =
    existingResource?.images.map(img => img.description).filter(Boolean) ?? [];

  // Get first generated image URL for preview
  const firstGeneratedImageUrl =
    existingResource?.images[0]?.url ??
    (state.generatedCards.size > 0
      ? Array.from(state.generatedCards.values())[0]?.url
      : null);

  // Get first emotion for preview
  const previewEmotion = state.selectedEmotions[0] || "Happy";

  // Determine if we should show the preview sidebar (steps 0-2)
  const showPreviewSidebar = currentStep <= 2;

  // Get style data for preview
  const previewStyle = styleWithFrames || state.stylePreset;
  const previewColors = previewStyle?.colors;
  const previewTypography = previewStyle?.typography;
  const previewFrameUrls = styleWithFrames?.frameUrls;
  const previewCardLayout = styleWithFrames?.cardLayout;

  // Show loading state while user or edit mode data is loading
  const isLoadingEditData = editResourceId && !existingResource;
  const isLoading = !user || isLoadingEditData;

  return {
    user,
    userCharacters,
    hasCharacters,
    state,
    updateState,
    currentStep,
    isNavigating,
    canGoNext,
    isStepComplete,
    goToStep,
    handleNext,
    handleBack,
    handleCancel,
    resumeDialog: {
      open: showResumeDialog,
      onResume: handleResumeDraft,
      onStartFresh: handleStartFresh,
    },
    emotionsWithImages,
    showPreviewSidebar,
    preview: {
      colors: previewColors,
      typography: previewTypography,
      frameUrls: previewFrameUrls,
      cardLayout: previewCardLayout,
      generatedImageUrl: firstGeneratedImageUrl,
      emotion: previewEmotion,
    },
    isLoading,
  };
}
