"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import type {
  StylePreset,
  CharacterSelection,
  WorksheetBlock,
  WorksheetContent,
  DetectedCharacterResult,
} from "@/types";
import {
  applyWorldContext,
  type ImageItem,
} from "@/components/resource/wizard/use-ai-wizard";

const makeId = () => globalThis.crypto.randomUUID();

export type WorksheetCreationMode = "ai" | "manual";

export interface WorksheetWizardState {
  name: string;
  creationMode: WorksheetCreationMode;
  styleId: Id<"styles"> | null;
  stylePreset: StylePreset | null;
  characterSelection: CharacterSelection | null;
  // Content
  description: string;
  contentStatus: "idle" | "generating" | "ready" | "error";
  contentError?: string;
  title: string;
  blocks: WorksheetBlock[];
  // Generation
  imageItems: ImageItem[];
  resourceId: Id<"resources"> | null;
  isEditMode: boolean;
  // Detected characters
  detectedCharacters: DetectedCharacterResult[];
  detectedCharactersStatus: "idle" | "creating" | "ready" | "skipped";
}

export type WorksheetStateUpdater =
  | Partial<WorksheetWizardState>
  | ((prev: WorksheetWizardState) => Partial<WorksheetWizardState>);

export const WORKSHEET_STEP_LABELS = [
  "Setup",
  "Content",
  "Generate",
  "Export",
] as const;
export const WORKSHEET_STEP_TITLES = [
  "Set Up Your Worksheet",
  "Create & Edit Content",
  "Generate Images",
  "Export",
] as const;
export const WORKSHEET_TOTAL_STEPS = 4;

interface UseWorksheetWizardArgs {
  editResourceId?: Id<"resources">;
}

export function useWorksheetWizard({ editResourceId }: UseWorksheetWizardArgs) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStyleId = searchParams.get("styleId") as Id<"styles"> | null;

  const user = useQuery(api.users.currentUser);
  const draftResources = useQuery(
    api.resources.getResourcesByType,
    user?._id ? { userId: user._id, type: "worksheet" as const } : "skip",
  );
  const existingResource = useQuery(
    api.resources.getResource,
    editResourceId ? { resourceId: editResourceId } : "skip",
  );
  const existingStyle = useQuery(
    api.styles.getStyle,
    existingResource?.styleId
      ? { styleId: existingResource.styleId }
      : "skip",
  );
  const initialStyle = useQuery(
    api.styles.getStyle,
    initialStyleId ? { styleId: initialStyleId } : "skip",
  );

  const createResource = useMutation(api.resources.createResource);
  const updateResource = useMutation(api.resources.updateResource);
  const getOrCreatePresetStyle = useMutation(
    api.styles.getOrCreatePresetStyle,
  );
  const recordFirstResource = useMutation(api.users.recordFirstResource);
  const generateContent = useAction(
    api.contentGeneration.generateResourceContent,
  );
  const createDetectedCharacters = useAction(
    api.characterActions.createDetectedCharacters,
  );
  const updateCharacterMut = useMutation(api.characters.updateCharacter);

  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<Id<"resources"> | null>(
    null,
  );

  const hasInitializedFromUrl = useRef(false);
  const hasInitializedEditMode = useRef(false);
  const hasPromptedResume = useRef(false);

  const [state, setState] = useState<WorksheetWizardState>({
    name: "",
    creationMode: "ai",
    styleId: null,
    stylePreset: null,
    characterSelection: null,
    description: "",
    contentStatus: "idle",
    title: "",
    blocks: [],
    imageItems: [],
    resourceId: null,
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
      if (existingResource.styleId && !existingStyle) return;

      hasInitializedEditMode.current = true;
      const content = existingResource.content as WorksheetContent;
      // Assign IDs to legacy blocks that don't have them
      const blocks = content.blocks.map((b) =>
        b.id ? b : { ...b, id: makeId() },
      );
      const imageItems = extractWorksheetImageItems({ ...content, blocks });
      setState((prev) => ({
        ...prev,
        name: existingResource.name,
        description: existingResource.description,
        creationMode: content.creationMode || "manual",
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
        title: content.title,
        blocks,
        contentStatus: "ready",
        isEditMode: true,
        characterSelection: content.characters || null,
        imageItems,
      }));
    }
  }, [editResourceId, existingResource, existingStyle]);

  // Draft resume prompt
  useEffect(() => {
    if (!user?._id || editResourceId || state.resourceId) return;
    if (draftResources === undefined || hasPromptedResume.current) return;
    if (currentStep > 0 || state.contentStatus !== "idle") return;

    const drafts = draftResources.filter((r) => r.status === "draft");
    if (drafts.length === 0) return;

    const latest = drafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    setResumeDraftId(latest._id);
    setShowResumeDialog(true);
    hasPromptedResume.current = true;
  }, [
    user?._id,
    editResourceId,
    state.resourceId,
    draftResources,
    currentStep,
    state.contentStatus,
  ]);

  const updateState = useCallback((updatesOrFn: WorksheetStateUpdater) => {
    setState((prev) => {
      const updates =
        typeof updatesOrFn === "function" ? updatesOrFn(prev) : updatesOrFn;
      return { ...prev, ...updates };
    });
  }, []);

  // Generate AI content
  const handleGenerateContent = useCallback(async () => {
    if (!state.description.trim()) return;
    updateState({
      contentStatus: "generating",
      contentError: undefined,
      detectedCharacters: [],
      detectedCharactersStatus: "idle",
    });

    try {
      const result = await generateContent({
        resourceType: "worksheet",
        description: state.description,
        styleId: state.styleId ?? undefined,
        characterIds: state.characterSelection?.characterIds.map(
          (id) => id as Id<"characters">,
        ),
        characterMode: state.characterSelection?.mode,
      });

      const content = result as Record<string, unknown>;

      const rawDetected =
        (content.detectedCharacters as Array<Record<string, unknown>>) || [];
      delete content.detectedCharacters;

      const name =
        (content.name as string) || state.name || state.description.slice(0, 50);
      const title = (content.title as string) || name;
      let blocks = (content.blocks as WorksheetBlock[]) || [];

      let charSelection = state.characterSelection;

      // Auto-detect characters if user hasn't pre-selected any
      if (rawDetected.length > 0 && !state.characterSelection && user?._id) {
        updateState({
          contentStatus: "ready",
          detectedCharactersStatus: "creating",
          name,
          title,
          blocks,
        });
        try {
          const charResults = await createDetectedCharacters({
            userId: user._id,
            styleId: state.styleId ?? undefined,
            characters: rawDetected.map((c) => ({
              name: (c.name as string) || "",
              description: (c.description as string) || "",
              personality: (c.personality as string) || "",
              visualDescription: (c.visualDescription as string) || "",
              appearsOn: Array.isArray(c.appearsOn)
                ? (c.appearsOn as string[])
                : [],
            })),
          });

          // Link characters to image blocks
          const keyToChar = new Map<string, string>();
          for (const r of charResults) {
            for (const key of r.appearsOn) {
              keyToChar.set(key, r.characterId);
            }
          }
          blocks = blocks.map((block, i) => {
            const charId = keyToChar.get(`block_${i}`);
            return charId && block.type === "image"
              ? { ...block, characterId: charId }
              : block;
          });

          charSelection = {
            mode: "per_item",
            characterIds: charResults.map((r) => r.characterId),
          };

          const worksheetContent: WorksheetContent = {
            title,
            blocks,
            creationMode: "ai",
            characters: charSelection || undefined,
          };
          const imageItems = applyWorldContext(
            extractWorksheetImageItems(worksheetContent),
            charResults.map((r) => ({
              name: r.name,
              promptFragment: r.promptFragment,
            })),
          );

          updateState({
            blocks,
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
          updateState({ detectedCharactersStatus: "idle" });
        }
      } else if (state.characterSelection) {
        updateState({ detectedCharactersStatus: "skipped" });
      }

      const worksheetContent: WorksheetContent = {
        title,
        blocks,
        creationMode: "ai",
        characters: charSelection || undefined,
      };
      const imageItems = extractWorksheetImageItems(worksheetContent);

      updateState({
        contentStatus: "ready",
        name,
        title,
        blocks,
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
    generateContent,
    createDetectedCharacters,
    user,
    updateState,
  ]);

  // Update a detected character's prompt fragment
  const handleUpdateCharacterPrompt = useCallback(
    async (characterId: string, promptFragment: string) => {
      await updateCharacterMut({
        characterId: characterId as Id<"characters">,
        promptFragment,
      });
      updateState((prev) => ({
        detectedCharacters: prev.detectedCharacters.map((c) =>
          c.characterId === characterId ? { ...c, promptFragment } : c,
        ),
      }));
    },
    [updateCharacterMut, updateState],
  );

  // Remove a detected character
  const handleRemoveDetectedCharacter = useCallback(
    (characterId: string) => {
      updateState((prev) => {
        const remaining = prev.detectedCharacters.filter(
          (c) => c.characterId !== characterId,
        );
        const blocks = prev.blocks.map((b) =>
          b.characterId === characterId
            ? { ...b, characterId: undefined }
            : b,
        );
        const charSelection =
          remaining.length > 0
            ? {
                mode: "per_item" as const,
                characterIds: remaining.map((r) => r.characterId),
              }
            : null;
        const worksheetContent: WorksheetContent = {
          title: prev.title,
          blocks,
          creationMode: prev.creationMode,
          characters: charSelection || undefined,
        };
        const imageItems = extractWorksheetImageItems(worksheetContent);
        return {
          detectedCharacters: remaining,
          blocks,
          characterSelection: charSelection,
          imageItems,
        };
      });
    },
    [updateState],
  );

  // Build content object
  const buildContent = useCallback((): WorksheetContent => {
    return {
      title: state.title,
      blocks: state.blocks,
      creationMode: state.creationMode,
      characters: state.characterSelection || undefined,
    };
  }, [state]);

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

    const content = buildContent();

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
      type: "worksheet",
      name: state.name,
      description: state.description || `Worksheet: ${state.name}`,
      content,
    });
    await recordFirstResource();
    return newId;
  }, [
    user?._id,
    state,
    buildContent,
    createResource,
    updateResource,
    getOrCreatePresetStyle,
    recordFirstResource,
    updateState,
  ]);

  // Rebuild image items when blocks change
  const refreshImageItems = useCallback(() => {
    const content = buildContent();
    const newItems = extractWorksheetImageItems(content);
    const merged = newItems.map((newItem) => {
      const existing = state.imageItems.find(
        (e) => e.assetKey === newItem.assetKey,
      );
      return existing ? { ...newItem, status: existing.status } : newItem;
    });
    updateState({ imageItems: merged });
  }, [buildContent, state.imageItems, updateState]);

  // Block operations
  const addBlock = useCallback(
    (type: WorksheetBlock["type"]) => {
      const base: WorksheetBlock = { id: makeId(), type };

      if (type === "checklist") base.items = [""];
      else if (type === "lines") base.lines = 3;
      else if (type === "scale")
        base.scaleLabels = { min: "Low", max: "High" };
      else if (type === "drawing_box") base.label = "";
      else if (type === "word_bank") base.words = [""];
      else if (type === "matching") {
        base.leftItems = [""];
        base.rightItems = [""];
      } else if (type === "fill_in_blank") base.text = "";
      else if (type === "multiple_choice") {
        base.question = "";
        base.options = ["", ""];
      } else if (type === "image") {
        base.caption = "";
        base.imagePrompt = "";
      } else if (type === "table") {
        base.headers = ["Column 1", "Column 2"];
        base.tableRows = [["", ""]];
      } else {
        base.text = "";
      }

      updateState((prev) => ({ blocks: [...prev.blocks, base] }));
    },
    [updateState],
  );

  const removeBlock = useCallback(
    (blockId: string) => {
      updateState((prev) => ({
        blocks: prev.blocks.filter((b) => b.id !== blockId),
      }));
    },
    [updateState],
  );

  const moveBlock = useCallback(
    (blockId: string, direction: "up" | "down") => {
      updateState((prev) => {
        const idx = prev.blocks.findIndex((b) => b.id === blockId);
        if (idx === -1) return {};
        if (direction === "up" && idx === 0) return {};
        if (direction === "down" && idx === prev.blocks.length - 1) return {};
        const newBlocks = [...prev.blocks];
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        [newBlocks[idx], newBlocks[swapIdx]] = [
          newBlocks[swapIdx],
          newBlocks[idx],
        ];
        return { blocks: newBlocks };
      });
    },
    [updateState],
  );

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<WorksheetBlock>) => {
      updateState((prev) => ({
        blocks: prev.blocks.map((b) =>
          b.id === blockId ? { ...b, ...updates } : b,
        ),
      }));
    },
    [updateState],
  );

  // Navigation
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 0:
        return state.name.trim().length > 0;
      case 1:
        return state.title.trim().length > 0 && state.blocks.length > 0;
      case 2:
        return (
          state.imageItems.length === 0 ||
          state.imageItems.some((item) => item.status === "complete")
        );
      case 3:
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
        return state.title.trim().length > 0 && state.blocks.length > 0;
      case 2:
        return (
          state.imageItems.length === 0 ||
          state.imageItems.some((item) => item.status === "complete")
        );
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
      if (currentStep === 1) {
        refreshImageItems();
        if (!state.resourceId) {
          const resourceId = await saveDraft();
          if (resourceId) updateState({ resourceId });
        } else {
          await saveDraft();
        }
      }

      if (state.resourceId && currentStep > 1) {
        await saveDraft();
      }

      setCurrentStep((prev) => Math.min(prev + 1, WORKSHEET_TOTAL_STEPS - 1));
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

  const isLoading = !user || (!!editResourceId && !existingResource);

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
    buildContent,
    refreshImageItems,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlock,
    resumeDialog: {
      open: showResumeDialog,
      onResume: handleResumeDraft,
      onStartFresh: handleStartFresh,
    },
    isLoading,
  };
}

/** Extract image items from worksheet content for generation */
function extractWorksheetImageItems(content: WorksheetContent): ImageItem[] {
  const items: ImageItem[] = [];
  const resourceCharacterId =
    content.characters?.characterIds &&
    content.characters.characterIds.length > 0
      ? (content.characters.characterIds[0] as Id<"characters">)
      : undefined;

  content.blocks.forEach((block, i) => {
    if (block.type !== "image" || !block.imagePrompt) return;
    items.push({
      assetKey: block.imageAssetKey || `worksheet_block_${i}`,
      assetType: "worksheet_block_image",
      prompt: `Worksheet illustration: ${block.imagePrompt}`,
      characterId:
        (block.characterId as Id<"characters"> | undefined) ??
        resourceCharacterId,
      includeText: false,
      aspect: "4:3",
      label: block.caption || `Image ${items.length + 1}`,
      group: "Worksheet Images",
      status: "pending",
    });
  });

  return items;
}
