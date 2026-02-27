"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import type {
  StylePreset,
  CharacterSelection,
  BookLayout,
  BookPage,
  BookCover,
  BookContent,
  DetectedCharacterResult,
} from "@/types";
import { toast } from "sonner";
import { applyWorldContext, buildCharacterMap, type ImageItem } from "@/components/resource/wizard/use-ai-wizard";

const makeId = () => globalThis.crypto.randomUUID();

export type BookCreationMode = "ai" | "manual";

export interface BookWizardState {
  // Setup
  name: string;
  bookType: string;
  layout: BookLayout;
  hasCover: boolean;
  creationMode: BookCreationMode;
  styleId: Id<"styles"> | null;
  stylePreset: StylePreset | null;
  characterSelection: CharacterSelection | null;
  // Content
  description: string;
  contentStatus: "idle" | "generating" | "ready" | "error";
  contentError?: string;
  cover: BookCover | null;
  pages: BookPage[];
  // Generation
  imageItems: ImageItem[];
  resourceId: Id<"resources"> | null;
  isEditMode: boolean;
  // Detected characters
  detectedCharacters: DetectedCharacterResult[];
  detectedCharactersStatus: "idle" | "creating" | "ready" | "skipped";
}

export type BookStateUpdater =
  | Partial<BookWizardState>
  | ((prev: BookWizardState) => Partial<BookWizardState>);

export const BOOK_STEP_LABELS = [
  "Setup",
  "Content",
  "Generate",
  "Export",
] as const;
export const BOOK_STEP_TITLES = [
  "Set Up Your Book",
  "Create & Edit Content",
  "Generate Images",
  "Export",
] as const;
export const BOOK_TOTAL_STEPS = 4;

interface UseBookWizardArgs {
  editResourceId?: Id<"resources">;
}

export function useBookWizard({ editResourceId }: UseBookWizardArgs) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStyleId = searchParams.get("styleId") as Id<"styles"> | null;

  const user = useQuery(api.users.currentUser);
  const draftResources = useQuery(
    api.resources.getResourcesByType,
    user?._id ? { userId: user._id, type: "book" as const } : "skip",
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
  const recordFirstResource = useMutation(api.users.recordFirstResource);
  const generateContent = useAction(
    api.contentGeneration.generateResourceContent,
  );
  const createDetectedCharacters = useAction(
    api.characterActions.createDetectedCharacters,
  );
  const ensureCharacterRef = useAction(api.characterActions.ensureCharacterReference);
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

  const [state, setState] = useState<BookWizardState>({
    name: "",
    bookType: "",
    layout: "picture_book",
    hasCover: true,
    creationMode: "ai",
    styleId: null,
    stylePreset: null,
    characterSelection: null,
    description: "",
    contentStatus: "idle",
    cover: null,
    pages: [],
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
      // Wait for style to load if the resource has one
      if (existingResource.styleId && !existingStyle) return;

      hasInitializedEditMode.current = true;
      const content = existingResource.content as BookContent;
      const imageItems = extractBookImageItems(content);
      setState((prev) => ({
        ...prev,
        name: existingResource.name,
        description: existingResource.description,
        bookType: content.bookType || "",
        layout: content.layout || "picture_book",
        hasCover: !!content.cover,
        creationMode: "ai",
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
        cover: content.cover || null,
        pages: content.pages || [],
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

  const updateState = useCallback((updatesOrFn: BookStateUpdater) => {
    setState((prev) => {
      const updates =
        typeof updatesOrFn === "function" ? updatesOrFn(prev) : updatesOrFn;
      return { ...prev, ...updates };
    });
  }, []);

  // Handle style change — persist + ensure character references in edit mode
  const handleStyleChange = useCallback(async (
    styleId: Id<"styles"> | null,
    stylePreset: StylePreset | null,
  ) => {
    updateState({ styleId, stylePreset });

    if (!styleId || !state.isEditMode || !state.resourceId) return;

    await updateResource({ resourceId: state.resourceId, styleId });

    const characterIds = state.characterSelection?.characterIds ?? [];
    if (characterIds.length > 0) {
      Promise.allSettled(
        characterIds.map((id) =>
          ensureCharacterRef({
            characterId: id as Id<"characters">,
            styleId,
          }),
        ),
      );
    }

    toast.success(
      state.imageItems.length > 0
        ? "Style updated. Regenerate images to apply the new style."
        : "Style updated.",
    );
  }, [state.isEditMode, state.resourceId, state.characterSelection, state.imageItems.length, updateResource, ensureCharacterRef, updateState]);

  // Generate AI content
  const handleGenerateContent = useCallback(async () => {
    if (!state.description.trim()) return;
    updateState({ contentStatus: "generating", contentError: undefined, detectedCharacters: [], detectedCharactersStatus: "idle" });

    try {
      const result = await generateContent({
        resourceType: "book",
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

      const name =
        (content.name as string) || state.name || state.description.slice(0, 50);
      let pages = (content.pages as BookPage[]) || [];
      const cover = (content.cover as BookCover) || null;
      const bookType = (content.bookType as string) || state.bookType;

      let charSelection = state.characterSelection;

      // Auto-detect characters if user hasn't pre-selected any
      if (rawDetected.length > 0 && !state.characterSelection && user?._id) {
        updateState({ contentStatus: "ready", detectedCharactersStatus: "creating", name, bookType, pages, cover });
        try {
          const charResults = await createDetectedCharacters({
            userId: user._id,
            characters: rawDetected.map((c) => ({
              name: (c.name as string) || "",
              description: (c.description as string) || "",
              personality: (c.personality as string) || "",
              visualDescription: (c.visualDescription as string) || "",
              appearsOn: Array.isArray(c.appearsOn) ? (c.appearsOn as string[]) : [],
            })),
          });

          // Link characters to pages (accumulate — multiple characters can share a page)
          const keyToChars = buildCharacterMap(charResults);
          pages = pages.map((page, i) => {
            const charIds = keyToChars.get(`page_${i}`);
            return charIds ? { ...page, characterIds: charIds } : page;
          });

          charSelection = {
            mode: "per_item",
            characterIds: charResults.map((r) => r.characterId),
          };

          const bookContent: BookContent = {
            bookType,
            layout: state.layout,
            cover: state.hasCover ? cover : undefined,
            pages,
            characters: charSelection || undefined,
          };
          const imageItems = applyWorldContext(
            extractBookImageItems(bookContent),
            charResults.map((r) => ({ name: r.name, promptFragment: r.promptFragment })),
          );

          updateState({
            pages,
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

      const bookContent: BookContent = {
        bookType,
        layout: state.layout,
        cover: state.hasCover ? cover : undefined,
        pages,
        characters: charSelection || undefined,
      };
      const imageItems = extractBookImageItems(bookContent);

      updateState({
        contentStatus: "ready",
        name,
        bookType,
        pages,
        cover,
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
    state.bookType,
    state.layout,
    state.hasCover,
    generateContent,
    createDetectedCharacters,
    user,
    updateState,
  ]);

  // Update a detected character's prompt fragment
  const handleUpdateCharacterPrompt = useCallback(async (characterId: string, promptFragment: string) => {
    await updateCharacterMut({
      characterId: characterId as Id<"characters">,
      promptFragment,
    });
    updateState((prev) => ({
      detectedCharacters: prev.detectedCharacters.map((c) =>
        c.characterId === characterId ? { ...c, promptFragment } : c,
      ),
    }));
  }, [updateCharacterMut, updateState]);

  // Remove a detected character
  const handleRemoveDetectedCharacter = useCallback((characterId: string) => {
    updateState((prev) => {
      const remaining = prev.detectedCharacters.filter((c) => c.characterId !== characterId);
      const pages = prev.pages.map((p) => {
        if (!p.characterIds) return p;
        const filtered = p.characterIds.filter((id) => id !== characterId);
        return { ...p, characterIds: filtered.length > 0 ? filtered : undefined };
      });
      const charSelection = remaining.length > 0
        ? { mode: "per_item" as const, characterIds: remaining.map((r) => r.characterId) }
        : null;
      const bookContent: BookContent = {
        bookType: prev.bookType,
        layout: prev.layout,
        cover: prev.hasCover ? (prev.cover ?? undefined) : undefined,
        pages,
        characters: charSelection || undefined,
      };
      const imageItems = extractBookImageItems(bookContent);
      return { detectedCharacters: remaining, pages, characterSelection: charSelection, imageItems };
    });
  }, [updateState]);

  // Build content object
  const buildContent = useCallback((): BookContent => {
    return {
      bookType: state.bookType,
      layout: state.layout,
      cover: state.hasCover ? (state.cover ?? undefined) : undefined,
      pages: state.pages,
      characters: state.characterSelection || undefined,
    };
  }, [state]);

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!user?._id || !state.name) return null;

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
      styleId: state.styleId ?? undefined,
      type: "book",
      name: state.name,
      description: state.description || `Book: ${state.name}`,
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
    recordFirstResource,
    updateState,
  ]);

  // Rebuild image items when pages/cover change
  const refreshImageItems = useCallback(() => {
    const content = buildContent();
    const newItems = extractBookImageItems(content);
    // Preserve status of existing items by matching assetKey
    const merged = newItems.map((newItem) => {
      const existing = state.imageItems.find(
        (e) => e.assetKey === newItem.assetKey,
      );
      return existing ? { ...newItem, status: existing.status } : newItem;
    });
    updateState({ imageItems: merged });
  }, [buildContent, state.imageItems, updateState]);

  // Page operations
  const addPage = useCallback(() => {
    const newPage: BookPage = {
      id: makeId(),
      text: "",
      imagePrompt: "",
    };
    updateState((prev) => ({ pages: [...prev.pages, newPage] }));
  }, [updateState]);

  const removePage = useCallback(
    (pageId: string) => {
      updateState((prev) => ({
        pages: prev.pages.length > 1
          ? prev.pages.filter((p) => p.id !== pageId)
          : prev.pages,
      }));
    },
    [updateState],
  );

  const movePage = useCallback(
    (pageId: string, direction: "up" | "down") => {
      updateState((prev) => {
        const idx = prev.pages.findIndex((p) => p.id === pageId);
        if (idx === -1) return {};
        if (direction === "up" && idx === 0) return {};
        if (direction === "down" && idx === prev.pages.length - 1) return {};
        const newPages = [...prev.pages];
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        [newPages[idx], newPages[swapIdx]] = [newPages[swapIdx], newPages[idx]];
        return { pages: newPages };
      });
    },
    [updateState],
  );

  const updatePage = useCallback(
    (pageId: string, updates: Partial<BookPage>) => {
      updateState((prev) => ({
        pages: prev.pages.map((p) =>
          p.id === pageId ? { ...p, ...updates } : p,
        ),
      }));
    },
    [updateState],
  );

  // Navigation
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 0: // Setup
        return state.name.trim().length > 0;
      case 1: // Content
        return (
          state.pages.length > 0 &&
          state.pages.some((p) => p.text.trim().length > 0)
        );
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
        return state.name.trim().length > 0;
      case 1:
        return (
          state.pages.length > 0 &&
          state.pages.some((p) => p.text.trim().length > 0)
        );
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
      // When leaving Content, rebuild image items and save draft
      if (currentStep === 1) {
        refreshImageItems();
        if (!state.resourceId) {
          const resourceId = await saveDraft();
          if (resourceId) updateState({ resourceId });
        } else {
          await saveDraft();
        }
      }

      // Save updates on other steps past content
      if (state.resourceId && currentStep > 1) {
        await saveDraft();
      }

      setCurrentStep((prev) => Math.min(prev + 1, BOOK_TOTAL_STEPS - 1));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.startsWith("LIMIT_REACHED:")) {
        const parts = message.split(":");
        const humanMessage = parts.slice(2).join(":");
        toast.error(humanMessage, {
          action: {
            label: "Upgrade",
            onClick: () => { window.location.href = "/dashboard/settings/billing"; },
          },
        });
      } else {
        throw error;
      }
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
    handleStyleChange,
    handleUpdateCharacterPrompt,
    handleRemoveDetectedCharacter,
    saveDraft,
    buildContent,
    refreshImageItems,
    addPage,
    removePage,
    movePage,
    updatePage,
    resumeDialog: {
      open: showResumeDialog,
      onResume: handleResumeDraft,
      onStartFresh: handleStartFresh,
    },
    isLoading,
  };
}

/** Extract image items from book content for generation */
function extractBookImageItems(content: BookContent): ImageItem[] {
  const items: ImageItem[] = [];
  const resourceCharacterIds =
    content.characters?.characterIds && content.characters.characterIds.length > 0
      ? content.characters.characterIds.map((id) => id as Id<"characters">)
      : undefined;

  // Cover image — use all resource-level characters
  if (content.cover?.imagePrompt) {
    items.push({
      assetKey: content.cover.imageAssetKey || "book_cover",
      assetType: "book_cover_image",
      prompt:
        `Book cover illustration: ${content.cover.imagePrompt}. ` +
        "Fill the entire image edge-to-edge with the illustration — no borders, frames, margins, or surrounding whitespace. " +
        "Do NOT include any text, titles, or words in the image — text will be overlaid separately. " +
        "This is a full-bleed cover image.",
      characterIds: resourceCharacterIds,
      includeText: false,
      aspect: "3:4",
      label: "Cover",
      group: "Cover",
      status: "pending",
    });
  }

  // Page images — use page-level characterIds, fallback to resource-level
  content.pages.forEach((page, i) => {
    if (!page.imagePrompt) return;
    const pageCharIds = page.characterIds && page.characterIds.length > 0
      ? page.characterIds.map((id) => id as Id<"characters">)
      : resourceCharacterIds;
    items.push({
      assetKey: page.imageAssetKey || `book_page_${i}`,
      assetType: "book_page_image",
      prompt: page.imagePrompt,
      characterIds: pageCharIds,
      includeText: false,
      aspect: "3:4",
      label: `Page ${i + 1}`,
      group: "Pages",
      status: "pending",
    });
  });

  return items;
}
