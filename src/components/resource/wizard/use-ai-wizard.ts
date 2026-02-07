"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import type { StylePreset, ResourceType, CharacterSelection } from "@/types";

export interface ImageItem {
  assetKey: string;
  assetType: string;
  prompt: string;
  characterId?: Id<"characters">;
  includeText: boolean;
  aspect: "1:1" | "3:4" | "4:3";
  status: "pending" | "generating" | "complete" | "error";
  error?: string;
}

export interface AIWizardState {
  description: string;
  name: string;
  styleId: Id<"styles"> | null;
  stylePreset: StylePreset | null;
  characterSelection: CharacterSelection | null;
  generatedContent: Record<string, unknown> | null;
  contentStatus: "idle" | "generating" | "ready" | "error";
  contentError?: string;
  imageItems: ImageItem[];
  resourceId: Id<"resources"> | null;
  resourceType: ResourceType;
  isEditMode: boolean;
}

export type StateUpdater = Partial<AIWizardState> | ((prev: AIWizardState) => Partial<AIWizardState>);

// 4 steps: Describe → Review/Edit → Generate → Export
export const STEP_LABELS = ["Describe", "Review", "Generate", "Export"] as const;
export const STEP_TITLES = [
  "Describe Your Resource",
  "Review & Edit",
  "Generate Images",
  "Export",
] as const;
export const TOTAL_STEPS = 4;

interface UseAIWizardArgs {
  resourceType: ResourceType;
  editResourceId?: Id<"resources">;
}

export function useAIWizard({ resourceType, editResourceId }: UseAIWizardArgs) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStyleId = searchParams.get("styleId") as Id<"styles"> | null;

  const user = useQuery(api.users.currentUser);
  const draftResources = useQuery(
    api.resources.getResourcesByType,
    user?._id ? { userId: user._id, type: resourceType } : "skip",
  );

  const existingResource = useQuery(
    api.resources.getResource,
    editResourceId ? { resourceId: editResourceId } : "skip",
  );
  const existingStyle = useQuery(
    api.styles.getStyle,
    existingResource?.styleId ? { styleId: existingResource.styleId } : "skip",
  );
  const initialStyle = useQuery(
    api.styles.getStyle,
    initialStyleId ? { styleId: initialStyleId } : "skip",
  );

  const createResource = useMutation(api.resources.createResource);
  const updateResource = useMutation(api.resources.updateResource);
  const getOrCreatePresetStyle = useMutation(api.styles.getOrCreatePresetStyle);
  const recordFirstResource = useMutation(api.users.recordFirstResource);
  const generateContent = useAction(api.contentGeneration.generateResourceContent);

  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<Id<"resources"> | null>(null);

  const hasInitializedFromUrl = useRef(false);
  const hasInitializedEditMode = useRef(false);
  const hasPromptedResume = useRef(false);

  const [state, setState] = useState<AIWizardState>({
    description: "",
    name: "",
    styleId: null,
    stylePreset: null,
    characterSelection: null,
    generatedContent: null,
    contentStatus: "idle",
    imageItems: [],
    resourceId: null,
    resourceType,
    isEditMode: false,
  });

  // Initialize from URL styleId
  useEffect(() => {
    if (
      initialStyleId &&
      initialStyle &&
      !editResourceId &&
      !hasInitializedFromUrl.current &&
      !state.styleId
    ) {
      hasInitializedFromUrl.current = true;
      setState((prev) => ({
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

  // Initialize edit mode
  useEffect(() => {
    if (
      editResourceId &&
      existingResource &&
      existingStyle &&
      !hasInitializedEditMode.current
    ) {
      hasInitializedEditMode.current = true;
      setState((prev) => ({
        ...prev,
        name: existingResource.name,
        description: existingResource.description,
        styleId: existingResource.styleId,
        stylePreset: {
          name: existingStyle.name,
          colors: existingStyle.colors,
          typography: existingStyle.typography,
          illustrationStyle: existingStyle.illustrationStyle,
        },
        resourceId: existingResource._id,
        generatedContent: existingResource.content as Record<string, unknown>,
        contentStatus: "ready",
        isEditMode: true,
      }));
    }
  }, [editResourceId, existingResource, existingStyle]);

  // Draft resume prompt
  useEffect(() => {
    if (!user?._id || editResourceId || state.resourceId) return;
    if (draftResources === undefined || hasPromptedResume.current) return;

    const drafts = draftResources.filter((r) => r.status === "draft");
    if (drafts.length === 0) return;

    const latest = drafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    setResumeDraftId(latest._id);
    setShowResumeDialog(true);
    hasPromptedResume.current = true;
  }, [user?._id, editResourceId, state.resourceId, draftResources]);

  const updateState = useCallback((updatesOrFn: StateUpdater) => {
    setState((prev) => {
      const updates = typeof updatesOrFn === 'function' ? updatesOrFn(prev) : updatesOrFn;
      return { ...prev, ...updates };
    });
  }, []);

  // Generate AI content
  const handleGenerateContent = useCallback(async () => {
    if (!state.description.trim()) return;

    updateState({ contentStatus: "generating", contentError: undefined });

    try {
      // Only poster, flashcards, card_game, board_game supported
      const validTypes = ["poster", "flashcards", "card_game", "board_game"] as const;
      type ValidType = (typeof validTypes)[number];
      if (!validTypes.includes(resourceType as ValidType)) {
        throw new Error(`Content generation not supported for ${resourceType}`);
      }

      const result = await generateContent({
        resourceType: resourceType as ValidType,
        description: state.description,
        styleId: state.styleId ?? undefined,
        characterIds: state.characterSelection?.characterIds.map(
          (id) => id as Id<"characters">,
        ),
        characterMode: state.characterSelection?.mode,
      });

      const content = result as Record<string, unknown>;

      // Extract name from generated content
      const name =
        (content.name as string) || state.name || state.description.slice(0, 50);

      // Extract image prompts into imageItems
      const imageItems = extractImageItems(resourceType, content);

      updateState({
        generatedContent: content,
        contentStatus: "ready",
        name,
        imageItems,
      });
    } catch (error) {
      updateState({
        contentStatus: "error",
        contentError:
          error instanceof Error ? error.message : "Failed to generate content",
      });
    }
  }, [
    state.description,
    state.styleId,
    state.characterSelection,
    state.name,
    resourceType,
    generateContent,
    updateState,
  ]);

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!user?._id || !state.name) return null;
    if (!state.styleId && !state.stylePreset) return null;

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

    if (!styleId) return null;

    const content = state.generatedContent ?? {};

    if (state.resourceId) {
      await updateResource({
        resourceId: state.resourceId,
        name: state.name,
        content,
      });
      return state.resourceId;
    }

    const newId = await createResource({
      userId: user._id,
      styleId,
      type: resourceType,
      name: state.name,
      description: state.description || `${resourceType}: ${state.name}`,
      content,
    });
    await recordFirstResource();
    return newId;
  }, [
    user?._id,
    state,
    resourceType,
    createResource,
    updateResource,
    getOrCreatePresetStyle,
    recordFirstResource,
    updateState,
  ]);

  // Navigation
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 0: // Describe
        return (
          state.description.trim().length > 0 &&
          (state.styleId !== null || state.stylePreset !== null)
        );
      case 1: // Review
        return state.contentStatus === "ready" && state.name.trim().length > 0;
      case 2: // Generate
        return state.imageItems.some((item) => item.status === "complete");
      case 3: // Export
        return true;
      default:
        return false;
    }
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0:
        return (
          state.description.trim().length > 0 &&
          (state.styleId !== null || state.stylePreset !== null)
        );
      case 1:
        return state.contentStatus === "ready" && state.name.trim().length > 0;
      case 2:
        return state.imageItems.some((item) => item.status === "complete");
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      // Generate AI content when leaving Describe step
      if (currentStep === 0 && state.contentStatus === "idle") {
        await handleGenerateContent();
      }

      // Save draft when leaving Review step
      if (currentStep === 1 && !state.resourceId) {
        const resourceId = await saveDraft();
        if (resourceId) updateState({ resourceId });
      }

      // Save content updates
      if (state.resourceId && currentStep > 0) {
        await saveDraft();
      }

      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
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

  const isLoading =
    !user || (!!editResourceId && (!existingResource || !existingStyle));

  return {
    user,
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
    handleGenerateContent,
    saveDraft,
    resumeDialog: {
      open: showResumeDialog,
      onResume: handleResumeDraft,
      onStartFresh: handleStartFresh,
    },
    isLoading,
  };
}

/** Extract image items from generated content based on resource type */
function extractImageItems(
  resourceType: ResourceType,
  content: Record<string, unknown>,
): ImageItem[] {
  const items: ImageItem[] = [];

  switch (resourceType) {
    case "poster": {
      const prompt = (content.imagePrompt as string) || (content.headline as string) || "";
      items.push({
        assetKey: "poster_main",
        assetType: "poster_image",
        prompt: `Poster illustration: ${prompt}`,
        includeText: true,
        aspect: "3:4",
        status: "pending",
      });
      break;
    }

    case "flashcards": {
      const cards = (content.cards as Array<Record<string, unknown>>) || [];
      cards.forEach((card, i) => {
        const prompt =
          (card.imagePrompt as string) || `Flashcard illustration for: ${card.frontText as string}`;
        items.push({
          assetKey: `flashcard_front_${i}`,
          assetType: "flashcard_front_image",
          prompt,
          characterId: card.characterId as Id<"characters"> | undefined,
          includeText: true,
          aspect: "1:1",
          status: "pending",
        });
      });
      break;
    }

    case "card_game": {
      const cards = (content.cards as Array<Record<string, unknown>>) || [];
      cards.forEach((card, i) => {
        const prompt =
          (card.imagePrompt as string) || `Card game card: ${card.title as string}`;
        items.push({
          assetKey: `card_${i}`,
          assetType: "card_image",
          prompt,
          characterId: card.characterId as Id<"characters"> | undefined,
          includeText: true,
          aspect: "3:4",
          status: "pending",
        });
      });
      break;
    }

    case "board_game": {
      const boardPrompt =
        (content.boardImagePrompt as string) || "Board game background illustration";
      items.push({
        assetKey: "board_main",
        assetType: "board_image",
        prompt: `Board game illustration: ${boardPrompt}`,
        includeText: true,
        aspect: "1:1",
        status: "pending",
      });
      break;
    }

    default:
      break;
  }

  return items;
}
