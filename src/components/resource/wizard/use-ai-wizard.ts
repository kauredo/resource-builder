"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import type { StylePreset, ResourceType, CharacterSelection, DetectedCharacterResult } from "@/types";

export interface ImageItem {
  assetKey: string;
  assetType: string;
  prompt: string;
  characterIds?: Id<"characters">[];
  includeText: boolean;
  aspect: "1:1" | "3:4" | "4:3";
  greenScreen?: boolean;
  /** Human-readable name for display */
  label?: string;
  /** Label for grouping in the generate step UI */
  group?: string;
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
  detectedCharacters: DetectedCharacterResult[];
  detectedCharactersStatus: "idle" | "creating" | "ready" | "skipped";
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
  const createDetectedCharacters = useAction(api.characterActions.createDetectedCharacters);
  const updateCharacter = useMutation(api.characters.updateCharacter);

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
    detectedCharacters: [],
    detectedCharactersStatus: "idle",
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
      !hasInitializedEditMode.current
    ) {
      // Wait for style to load if the resource has one
      if (existingResource.styleId && !existingStyle) return;

      hasInitializedEditMode.current = true;
      const content = existingResource.content as Record<string, unknown>;
      const charSel = (content.characters as CharacterSelection) || null;
      const imageItems = extractImageItems(resourceType, content, charSel);
      setState((prev) => ({
        ...prev,
        name: existingResource.name,
        description: existingResource.description,
        styleId: existingResource.styleId ?? null,
        stylePreset: existingStyle
          ? {
              name: existingStyle.name,
              colors: existingStyle.colors,
              typography: existingStyle.typography,
              illustrationStyle: existingStyle.illustrationStyle,
            }
          : null,
        resourceId: existingResource._id,
        generatedContent: content,
        contentStatus: "ready",
        isEditMode: true,
        characterSelection: charSel,
        imageItems,
      }));
    }
  }, [editResourceId, existingResource, existingStyle, resourceType]);

  // Draft resume prompt — only show before the user has started working
  useEffect(() => {
    if (!user?._id || editResourceId || state.resourceId) return;
    if (draftResources === undefined || hasPromptedResume.current) return;
    // Don't interrupt if the user has already progressed past step 0 or generated content
    if (currentStep > 0 || state.contentStatus !== "idle") return;

    const drafts = draftResources.filter((r) => r.status === "draft");
    if (drafts.length === 0) return;

    const latest = drafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    setResumeDraftId(latest._id);
    setShowResumeDialog(true);
    hasPromptedResume.current = true;
  }, [user?._id, editResourceId, state.resourceId, draftResources, currentStep, state.contentStatus]);

  const updateState = useCallback((updatesOrFn: StateUpdater) => {
    setState((prev) => {
      const updates = typeof updatesOrFn === 'function' ? updatesOrFn(prev) : updatesOrFn;
      return { ...prev, ...updates };
    });
  }, []);

  // Generate AI content
  const handleGenerateContent = useCallback(async () => {
    if (!state.description.trim()) return;

    updateState({ contentStatus: "generating", contentError: undefined, detectedCharacters: [], detectedCharactersStatus: "idle" });

    try {
      // Only poster, flashcards, card_game, board_game supported
      const validTypes = ["poster", "flashcards", "card_game", "board_game", "book"] as const;
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

      // Extract detected characters from AI output
      const rawDetected = (content.detectedCharacters as Array<Record<string, unknown>>) || [];
      delete content.detectedCharacters;

      // Extract name from generated content
      const name =
        (content.name as string) || state.name || state.description.slice(0, 50);

      // Extract image prompts into imageItems
      let imageItems = extractImageItems(resourceType, content, state.characterSelection);

      // Auto-detect characters if user hasn't pre-selected any
      if (rawDetected.length > 0 && !state.characterSelection && user?._id) {
        updateState({ contentStatus: "ready", detectedCharactersStatus: "creating", generatedContent: content, name, imageItems });
        try {
          const charResults = await createDetectedCharacters({
            userId: user._id,
            styleId: state.styleId ?? undefined,
            characters: rawDetected.map((c) => ({
              name: (c.name as string) || "",
              description: (c.description as string) || "",
              personality: (c.personality as string) || "",
              visualDescription: (c.visualDescription as string) || "",
              appearsOn: Array.isArray(c.appearsOn) ? (c.appearsOn as string[]) : [],
            })),
          });

          // Link characters to content items
          const linkedContent = linkCharactersToContent(resourceType, content, charResults);
          // Build character selection
          const charSelection: CharacterSelection = {
            mode: "per_item",
            characterIds: charResults.map((r) => r.characterId),
          };
          // Re-extract image items with character links + world context
          imageItems = applyWorldContext(
            extractImageItems(resourceType, linkedContent, charSelection),
            charResults.map((r) => ({ name: r.name, promptFragment: r.promptFragment })),
          );

          updateState({
            generatedContent: linkedContent,
            imageItems,
            characterSelection: charSelection,
            detectedCharacters: charResults.map((r) => ({
              name: r.name,
              characterId: r.characterId,
              appearsOn: r.appearsOn,
              isNew: r.isNew,
              promptFragment: r.promptFragment,
              suggestedPromptFragment: r.suggestedPromptFragment,
            })),
            detectedCharactersStatus: "ready",
          });
          return;
        } catch {
          // Non-blocking: proceed without character linking
          updateState({
            detectedCharactersStatus: "idle",
          });
        }
      } else if (state.characterSelection) {
        updateState({ detectedCharactersStatus: "skipped" });
      }

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
    createDetectedCharacters,
    user,
    updateState,
  ]);

  // Update a detected character's prompt fragment
  const handleUpdateCharacterPrompt = useCallback(async (characterId: string, promptFragment: string) => {
    await updateCharacter({
      characterId: characterId as Id<"characters">,
      promptFragment,
    });
    updateState((prev) => ({
      detectedCharacters: prev.detectedCharacters.map((c) =>
        c.characterId === characterId ? { ...c, promptFragment } : c,
      ),
    }));
  }, [updateCharacter, updateState]);

  // Remove a detected character (unlink from content, remove from list)
  const handleRemoveDetectedCharacter = useCallback((characterId: string) => {
    updateState((prev) => {
      const remaining = prev.detectedCharacters.filter((c) => c.characterId !== characterId);
      const content = prev.generatedContent ? unlinkCharacterFromContent(prev.resourceType, prev.generatedContent, characterId) : prev.generatedContent;
      const charSelection = remaining.length > 0
        ? { mode: "per_item" as const, characterIds: remaining.map((r) => r.characterId) }
        : null;
      const imageItems = content ? extractImageItems(prev.resourceType, content, charSelection) : prev.imageItems;
      return {
        detectedCharacters: remaining,
        generatedContent: content,
        characterSelection: charSelection,
        imageItems,
      };
    });
  }, [updateState]);

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!user?._id || !state.name) return null;

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
      styleId: styleId ?? undefined,
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
        return state.description.trim().length > 0;
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
        return state.description.trim().length > 0;
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
    !user || (!!editResourceId && !existingResource);

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
    handleUpdateCharacterPrompt,
    handleRemoveDetectedCharacter,
    saveDraft,
    resumeDialog: {
      open: showResumeDialog,
      onResume: handleResumeDraft,
      onStartFresh: handleStartFresh,
    },
    isLoading,
  };
}

/** Link detected characters to content items based on appearsOn keys */
function linkCharactersToContent(
  resourceType: ResourceType,
  content: Record<string, unknown>,
  results: Array<{ name: string; characterId: string; appearsOn: string[] }>,
): Record<string, unknown> {
  const linked = { ...content };

  const keyToChars = buildCharacterMap(results);

  switch (resourceType) {
    case "flashcards": {
      const cards = [...((linked.cards as Array<Record<string, unknown>>) || [])];
      cards.forEach((card, i) => {
        const charIds = keyToChars.get(`card_${i}`);
        if (charIds) cards[i] = { ...card, characterIds: charIds };
      });
      linked.cards = cards;
      break;
    }
    case "board_game": {
      const tokens = [...((linked.tokens as Array<Record<string, unknown>>) || [])];
      tokens.forEach((token, i) => {
        const charIds = keyToChars.get(`token_${i}`);
        if (charIds) tokens[i] = { ...token, characterIds: charIds };
      });
      linked.tokens = tokens;
      const cards = [...((linked.cards as Array<Record<string, unknown>>) || [])];
      cards.forEach((card, i) => {
        const charIds = keyToChars.get(`card_${i}`);
        if (charIds) cards[i] = { ...card, characterIds: charIds };
      });
      linked.cards = cards;
      break;
    }
    // poster and card_game: resource-level character (handled via characterSelection)
    default:
      break;
  }

  return linked;
}

/** Remove a character from all content item links */
function unlinkCharacterFromContent(
  resourceType: ResourceType,
  content: Record<string, unknown>,
  characterId: string,
): Record<string, unknown> {
  const unlinked = { ...content };

  const removeChar = (items: Array<Record<string, unknown>>) =>
    items.map((item) => {
      const ids = item.characterIds as string[] | undefined;
      if (!ids) return item;
      const filtered = ids.filter((id) => id !== characterId);
      return { ...item, characterIds: filtered.length > 0 ? filtered : undefined };
    });

  switch (resourceType) {
    case "flashcards": {
      unlinked.cards = removeChar((unlinked.cards as Array<Record<string, unknown>>) || []);
      break;
    }
    case "board_game": {
      unlinked.tokens = removeChar((unlinked.tokens as Array<Record<string, unknown>>) || []);
      unlinked.cards = removeChar((unlinked.cards as Array<Record<string, unknown>>) || []);
      break;
    }
    default:
      break;
  }

  return unlinked;
}

/** Extract image items from generated content based on resource type */
function extractImageItems(
  resourceType: ResourceType,
  content: Record<string, unknown>,
  characterSelection?: CharacterSelection | null,
): ImageItem[] {
  // Character(s) to apply to all items (resource-level types like poster, card_game, board_game).
  // When mode is "per_item" (e.g. from auto-detection), per-item types (flashcards) read
  // characterIds directly from content items. Resource-level types still need a fallback.
  const resourceCharacterIds =
    characterSelection?.characterIds && characterSelection.characterIds.length > 0
      ? characterSelection.characterIds.map((id) => id as Id<"characters">)
      : undefined;
  const items: ImageItem[] = [];

  switch (resourceType) {
    case "poster": {
      const prompt = (content.imagePrompt as string) || (content.headline as string) || "";
      items.push({
        assetKey: "poster_main",
        assetType: "poster_image",
        prompt: `Poster illustration: ${prompt}`,
        characterIds: resourceCharacterIds,
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
        const cardCharIds = (card.characterIds as string[] | undefined)?.map((id) => id as Id<"characters">);
        items.push({
          assetKey: `flashcard_front_${i}`,
          assetType: "flashcard_front_image",
          prompt,
          characterIds: cardCharIds?.length ? cardCharIds : resourceCharacterIds,
          includeText: true,
          aspect: "1:1",
          status: "pending",
        });
      });
      break;
    }

    case "card_game": {
      // Template-based: generate backgrounds, icons, and optional card back
      const backgrounds = (content.backgrounds as Array<Record<string, unknown>>) || [];
      const icons = (content.icons as Array<Record<string, unknown>>) || [];
      const cardBack = content.cardBack as Record<string, unknown> | undefined;

      // Respect characterPlacement setting
      const rawPlacement = (content.characterPlacement as string) || "";
      const placement = ["backgrounds", "icons", "both", "none"].includes(rawPlacement)
        ? rawPlacement
        : "backgrounds";
      const charIdsForBg =
        placement === "backgrounds" || placement === "both"
          ? resourceCharacterIds
          : undefined;
      const charIdsForIcon =
        placement === "icons" || placement === "both"
          ? resourceCharacterIds
          : undefined;

      // One ImageItem per background
      backgrounds.forEach((bg) => {
        const id = bg.id as string;
        const bgPrompt = (bg.imagePrompt as string) || `Card background for ${bg.label as string}`;
        items.push({
          assetKey: (bg.imageAssetKey as string) || `card_bg:${id}`,
          assetType: "card_bg",
          prompt:
            `CARD BACKGROUND for a printable card game. ${bgPrompt}. ` +
            "This image is ONLY the card itself — fill the entire image edge-to-edge with the design, no borders, margins, padding, or surrounding space. " +
            "Keep the center area relatively clear and simple so that icons and text can be overlaid on top. " +
            (charIdsForBg ? "If a character is included, place them along the edges or corners of the card — NOT in the center. The center must stay clear for overlay elements. " : "") +
            "Do NOT use a white background — the image IS the full card background. Use a 3:4 portrait aspect ratio.",
          label: (bg.label as string) || "Background",
          characterIds: charIdsForBg,
          includeText: false,
          aspect: "3:4",
          group: "Backgrounds",
          status: "pending",
        });
      });

      // One ImageItem per icon (green screen) — icons use first character only
      icons.forEach((icon) => {
        const id = icon.id as string;
        items.push({
          assetKey: (icon.imageAssetKey as string) || `card_icon:${id}`,
          assetType: "card_icon",
          prompt: (icon.imagePrompt as string) || `Card icon: ${icon.label as string}`,
          label: (icon.label as string) || "Icon",
          characterIds: charIdsForIcon,
          includeText: false,
          aspect: "1:1",
          greenScreen: true,
          group: "Icons",
          status: "pending",
        });
      });

      // Optional card back (never gets character)
      if (cardBack?.imagePrompt) {
        items.push({
          assetKey: (cardBack.imageAssetKey as string) || "card_back",
          assetType: "card_back",
          prompt:
            `CARD BACK design for a printable card game. ${cardBack.imagePrompt as string}. ` +
            "Fill the entire image edge-to-edge with the design, no borders, margins, or surrounding space. " +
            "This is the back face of a playing card. Use a 3:4 portrait aspect ratio.",
          label: "Card Back",
          includeText: false,
          aspect: "3:4",
          group: "Card Back",
          status: "pending",
        });
      }
      break;
    }

    case "board_game": {
      const boardPrompt =
        (content.boardImagePrompt as string) || "Board game background illustration";
      items.push({
        assetKey: "board_main",
        assetType: "board_image",
        prompt: `Board game illustration: ${boardPrompt}`,
        characterIds: resourceCharacterIds,
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

/** Add visual world context to all image items so every illustration shares the same universe.
 *  Even pages where a character doesn't physically appear will reference the world's look. */
export function applyWorldContext(
  items: ImageItem[],
  characters: Array<{ name: string; promptFragment: string }>,
): ImageItem[] {
  if (characters.length === 0) return items;

  const worldDesc = characters
    .map((c) => `"${c.name}": ${c.promptFragment}`)
    .join(". ");
  const worldPrefix =
    `VISUAL WORLD: All illustrations in this series share the same visual universe. ` +
    `The world is defined by these characters — maintain their aesthetic, proportions, and style ` +
    `even in scenes where they don't appear: ${worldDesc}. `;

  return items.map((item) => ({
    ...item,
    prompt: worldPrefix + item.prompt,
  }));
}

/** Build an accumulating map from appearsOn keys to character ID arrays.
 *  Shared by all wizards that link detected characters to content items. */
export function buildCharacterMap(
  results: Array<{ characterId: string; appearsOn: string[] }>,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const r of results) {
    for (const key of r.appearsOn) {
      const existing = map.get(key) || [];
      existing.push(r.characterId);
      map.set(key, existing);
    }
  }
  return map;
}
