"use client";

import { useState, useCallback, use, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDebouncedSave } from "@/hooks/use-debounced-save";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  Check,
  User,
  ImageIcon,
  Paintbrush,
  Upload,
  Wand2,
  X,
  ChevronDown,
  Star,
  AlertCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CharacterDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const promptSectionRef = useRef<HTMLElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingRemoveImageId, setPendingRemoveImageId] = useState<
    string | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isAnalyzingUpload, setIsAnalyzingUpload] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);

  // Error states
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuggestions, setImageSuggestions] = useState<{
    description: string;
    personality: string;
  } | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Local state for debounced fields
  const [localName, setLocalName] = useState<string | null>(null);
  const [localDescription, setLocalDescription] = useState<string | null>(null);
  const [localPersonality, setLocalPersonality] = useState<string | null>(null);
  const [localPromptFragment, setLocalPromptFragment] = useState<string | null>(
    null,
  );

  const characterId = resolvedParams.id as Id<"characters">;
  const character = useQuery(api.characters.getCharacterWithImageUrls, {
    characterId,
  });
  const updateCharacter = useMutation(api.characters.updateCharacter);
  const deleteCharacter = useMutation(api.characters.deleteCharacter);
  const generateUploadUrl = useMutation(api.characters.generateUploadUrl);
  const addReferenceImage = useMutation(api.characters.addReferenceImage);
  const removeReferenceImage = useMutation(api.characters.removeReferenceImage);
  const generateReferenceImage = useAction(
    api.characterActions.generateReferenceImage,
  );
  const generatePromptFragment = useAction(
    api.characterActions.generatePromptFragment,
  );
  const analyzeAndUpdatePrompt = useAction(
    api.characterActions.analyzeAndUpdatePrompt,
  );

  // Debounced save
  const { saveStatus, debouncedSave } = useDebouncedSave({
    onSave: useCallback(
      async (updates: Record<string, unknown>) => {
        await updateCharacter({
          characterId,
          ...updates,
        });
      },
      [characterId, updateCharacter],
    ),
  });

  // Derived values
  const displayName = localName ?? character?.name ?? "";
  const displayDescription = localDescription ?? character?.description ?? "";
  const displayPersonality = localPersonality ?? character?.personality ?? "";
  const displayPromptFragment =
    localPromptFragment ?? character?.promptFragment ?? "";

  // Derived: prerequisites and operation safety
  const isAnyOperationInProgress =
    isUploading || isGeneratingImage || isGeneratingPrompt || isAnalyzingUpload;
  const hasName =
    displayName.trim().length > 0 && displayName.trim() !== "New Character";
  const hasDescription = displayDescription.trim().length > 0;
  const canGeneratePrompt = hasName && hasDescription;
  const canGenerateImage = hasName && hasDescription;
  const hasPromptFragment = displayPromptFragment.trim().length > 0;
  const hasReferenceImages = (character?.referenceImages.length ?? 0) > 0;
  const isPromptStale =
    hasPromptFragment &&
    character?.promptFragmentUpdatedAt !== undefined &&
    character?.updatedAt !== undefined &&
    character.updatedAt > character.promptFragmentUpdatedAt;

  // Auto-focus name input for new characters
  const hasAutoFocused = useRef(false);
  useEffect(() => {
    if (
      character &&
      character.name === "New Character" &&
      nameInputRef.current &&
      !hasAutoFocused.current
    ) {
      hasAutoFocused.current = true;
      nameInputRef.current.select();
    }
  }, [character]);

  // Auto-expand visual description section when prerequisites are met but none exists
  const hasAutoExpanded = useRef(false);
  useEffect(() => {
    if (canGeneratePrompt && !hasPromptFragment && !hasAutoExpanded.current) {
      hasAutoExpanded.current = true;
      setPromptExpanded(true);
    }
  }, [canGeneratePrompt, hasPromptFragment]);

  // Debounced field handlers — clear errors on edit
  const handleNameChange = useCallback(
    (value: string) => {
      setLocalName(value);
      setImageError(null);
      setPromptError(null);
      debouncedSave({ name: value });
    },
    [debouncedSave],
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setLocalDescription(value);
      setImageError(null);
      setPromptError(null);
      debouncedSave({ description: value });
    },
    [debouncedSave],
  );

  const handlePersonalityChange = useCallback(
    (value: string) => {
      setLocalPersonality(value);
      debouncedSave({ personality: value });
    },
    [debouncedSave],
  );

  const handlePromptFragmentChange = useCallback(
    (value: string) => {
      setLocalPromptFragment(value);
      setPromptError(null);
      debouncedSave({ promptFragment: value });
    },
    [debouncedSave],
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCharacter({ characterId });
      router.push("/dashboard/characters");
    } catch (error) {
      console.error("Failed to delete character:", error);
      setIsDeleting(false);
    }
  };

  // File upload handler — supports multiple files, triggers batch analysis after
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setImageError(null);

    const newStorageIds: Id<"_storage">[] = [];
    try {
      // Upload all files in parallel
      await Promise.all(
        Array.from(files).map(async (file) => {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();
          await addReferenceImage({ characterId, storageId });
          newStorageIds.push(storageId);
        }),
      );
      setIsUploading(false);

      // After all uploads, analyze all new images together
      if (newStorageIds.length > 0) {
        setIsAnalyzingUpload(true);
        try {
          const analysisResult = await analyzeAndUpdatePrompt({
            characterId,
            storageIds: newStorageIds,
          });
          setLocalPromptFragment(analysisResult.promptFragment);
          setPromptExpanded(true);
        } catch (error) {
          // Non-blocking — uploads succeeded even if analysis fails
          console.error("Image analysis failed:", error);
        } finally {
          setIsAnalyzingUpload(false);
        }
      }
    } catch (error) {
      console.error("Failed to upload images:", error);
      setUploadError("Failed to upload. Please try again.");
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setImageError(null);
    setImageSuggestions(null);
    try {
      await generateReferenceImage({ characterId });
    } catch (error: unknown) {
      console.error("Failed to generate image:", error);
      // Try to parse structured safety block error with suggestions
      const message = error instanceof Error ? error.message : String(error);
      try {
        const jsonStart = message.indexOf("{");
        const jsonEnd = message.lastIndexOf("}");
        const jsonStr = jsonStart >= 0 && jsonEnd > jsonStart ? message.slice(jsonStart, jsonEnd + 1) : "";
        const parsed = JSON.parse(jsonStr);
        if (parsed.type === "SAFETY_BLOCK" && parsed.suggestions) {
          setImageError(
            "Image generation was blocked — the description may contain trademarked or copyrighted references.",
          );
          setImageSuggestions(parsed.suggestions);
        } else {
          setImageError("Image generation failed. Try adjusting the description.");
        }
      } catch {
        setImageError("Image generation failed. Try adjusting the description.");
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleApplySuggestions = () => {
    if (!imageSuggestions) return;
    handleDescriptionChange(imageSuggestions.description);
    if (imageSuggestions.personality) {
      handlePersonalityChange(imageSuggestions.personality);
    }
    setImageError(null);
    setImageSuggestions(null);
  };

  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    setPromptError(null);
    try {
      const result = await generatePromptFragment({ characterId });
      setLocalPromptFragment(result.promptFragment);
      setPromptExpanded(true);
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      setPromptError("Failed to generate. Try adding more detail.");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleRemoveImageClick = (storageId: string) => {
    if (hasPromptFragment) {
      // Visual description exists — show confirmation so user knows to review it
      setPendingRemoveImageId(storageId);
    } else {
      // No visual description — just remove silently
      handleRemoveImage(storageId);
    }
  };

  const handleRemoveImage = async (storageId: string) => {
    setImageError(null);
    setPendingRemoveImageId(null);
    try {
      await removeReferenceImage({
        characterId,
        storageId: storageId as Id<"_storage">,
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
      setImageError("Failed to remove image.");
    }
  };

  const handleRemoveAndReviewPrompt = async () => {
    if (!pendingRemoveImageId) return;
    await handleRemoveImage(pendingRemoveImageId);
    // Expand visual description section and scroll to it
    setPromptExpanded(true);
    requestAnimationFrame(() => {
      promptSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  // Loading state
  if (character === undefined) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="status"
        aria-label="Loading character"
      >
        <div className="h-4 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none mb-6" />
        {/* Hero skeleton — portrait + fields */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10">
          <div className="w-56 shrink-0 mx-auto sm:mx-0 space-y-3">
            <div className="aspect-[3/4] bg-muted rounded-xl animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-12 w-64 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            <div className="h-24 bg-muted rounded-lg animate-pulse motion-reduce:animate-none" />
            <div className="h-24 bg-muted rounded-lg animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-40 bg-muted rounded-xl animate-pulse motion-reduce:animate-none" />
          <div className="h-16 bg-muted rounded-xl animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  // Not found state
  if (character === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h1 className="font-serif text-2xl font-medium mb-2">
            Character not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This character may have been deleted or doesn&apos;t exist.
          </p>
          <Button asChild className="btn-coral">
            <Link href="/dashboard/characters">Back to Characters</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Resolve primary (first) reference image
  const primaryImageId =
    character.primaryImageId ?? character.referenceImages[0];
  const primaryImageUrl =
    primaryImageId ? character.imageUrls[primaryImageId] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/dashboard/characters"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Characters
      </Link>

      {/* Hero: Portrait anchors the character's identity */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Portrait — commanding size, the character's face */}
          <div className="w-56 shrink-0 mx-auto sm:mx-0">
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border/50 bg-muted/30 relative">
              {primaryImageUrl ? (
                <img
                  src={primaryImageUrl}
                  alt={`${character.name} portrait`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                  <div className="size-16 rounded-full border-2 border-dashed border-teal/25 flex items-center justify-center">
                    <User
                      className="size-7 text-muted-foreground/30"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
                    Add a reference image to see your character here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Name + Description + Personality */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Name + save status + delete — all in the character info column */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  ref={nameInputRef}
                  type="text"
                  value={displayName}
                  onChange={e => handleNameChange(e.target.value)}
                  maxLength={100}
                  className="font-serif text-3xl sm:text-4xl font-medium tracking-tight border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
                  placeholder="Character name"
                  aria-label="Character name"
                />
                {saveStatus !== "idle" && (
                  <div
                    className="flex items-center gap-3 text-sm text-muted-foreground mt-1"
                    aria-live="polite"
                  >
                    {saveStatus === "saving" && (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2
                          className="size-3 animate-spin"
                          aria-hidden="true"
                        />
                        Saving...
                      </span>
                    )}
                    {saveStatus === "saved" && (
                      <span className="inline-flex items-center gap-1.5 text-teal">
                        <Check className="size-3" aria-hidden="true" />
                        Saved
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Delete action */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Delete character</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this character?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{character.name}
                      &rdquo; and all its reference images.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting && (
                        <Loader2
                          className="size-4 animate-spin mr-2"
                          aria-hidden="true"
                        />
                      )}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs text-muted-foreground"
              >
                Appearance
              </Label>
              <Textarea
                id="description"
                value={displayDescription}
                onChange={e => handleDescriptionChange(e.target.value)}
                placeholder="How does this character look? e.g. A friendly brown bear with round glasses, a blue knitted scarf, and soft fur..."
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <div className={cn("space-y-2", !hasDescription && "opacity-50")}>
              <Label
                htmlFor="personality"
                className="text-xs text-muted-foreground"
              >
                Personality{" "}
                <span className="text-muted-foreground/60">(optional)</span>
              </Label>
              <Textarea
                id="personality"
                value={displayPersonality}
                onChange={e => handlePersonalityChange(e.target.value)}
                placeholder="What is this character like? e.g. Gentle and curious, speaks softly, tilts head when listening..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="space-y-8">
        {/* Reference Images */}
        <section className="p-5 rounded-xl bg-muted/30 border border-border/50">
          {/* Header — stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-teal" aria-hidden="true" />
              <h2 className="text-sm font-medium text-foreground">
                Reference Images
              </h2>
              {character.referenceImages.length > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  ({character.referenceImages.length})
                </span>
              )}
            </div>

            {/* Action buttons — wrap gracefully */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload reference images"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnyOperationInProgress}
                className="gap-1.5"
              >
                {isUploading ? (
                  <Loader2
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Upload className="size-3.5" aria-hidden="true" />
                )}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateImage}
                disabled={isAnyOperationInProgress || !canGenerateImage}
                className="gap-1.5 bg-teal text-white hover:bg-teal/90"
              >
                {isGeneratingImage ? (
                  <Loader2
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Wand2 className="size-3.5" aria-hidden="true" />
                )}
                {isGeneratingImage
                  ? "Creating portrait..."
                  : character.referenceImages.length > 0
                    ? "Generate Another"
                    : "Generate with AI"}
              </Button>
            </div>
          </div>

          {/* Single status area — shows the most relevant message */}
          {(imageError || uploadError) ? (
            <div
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4 space-y-3"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  className="size-3.5 text-destructive shrink-0"
                  aria-hidden="true"
                />
                <p className="text-xs text-destructive">
                  {uploadError || imageError}
                </p>
              </div>
              {imageSuggestions && (
                <div className="space-y-2 border-t border-destructive/10 pt-3">
                  <p className="text-xs font-medium text-foreground">
                    Suggested changes:
                  </p>
                  <div className="space-y-1.5">
                    {imageSuggestions.description !== displayDescription && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Appearance: </span>
                        <span className="text-foreground">{imageSuggestions.description}</span>
                      </div>
                    )}
                    {imageSuggestions.personality && imageSuggestions.personality !== displayPersonality && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Personality: </span>
                        <span className="text-foreground">{imageSuggestions.personality}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleApplySuggestions}
                    className="gap-1.5 text-xs"
                  >
                    <Check className="size-3" aria-hidden="true" />
                    Apply suggestions
                  </Button>
                </div>
              )}
            </div>
          ) : (isUploading || isAnalyzingUpload || isGeneratingImage) ? (
            <div
              className="flex items-center gap-2 mb-4"
              aria-live="polite"
            >
              <Loader2
                className="size-3.5 animate-spin text-teal"
                aria-hidden="true"
              />
              <p className="text-xs text-teal font-medium">
                {isUploading && "Uploading images..."}
                {isAnalyzingUpload &&
                  "Analyzing image and updating visual description..."}
                {isGeneratingImage &&
                  (hasPromptFragment
                    ? "Creating a portrait using the visual description..."
                    : "Creating a portrait from the character details...")}
              </p>
            </div>
          ) : (!canGenerateImage && !isAnyOperationInProgress && !hasReferenceImages) ? (
            <p className="text-xs text-muted-foreground mb-4">
              Add a name and description to enable AI generation
            </p>
          ) : null}

          {/* Image grid */}
          {character.referenceImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {character.referenceImages.map((storageId) => {
                const url = character.imageUrls[storageId];
                const isPrimary = storageId === primaryImageId;
                return (
                  <div
                    key={storageId}
                    className={cn(
                      "group relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border",
                      isPrimary
                        ? "border-teal/40 ring-1 ring-teal/20"
                        : "border-border/50",
                    )}
                  >
                    {url && (
                      <img
                        src={url}
                        alt={
                          isPrimary
                            ? `${character.name} primary reference`
                            : "Character reference"
                        }
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Primary badge on first image */}
                    {isPrimary && (
                      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm">
                        <Star className="size-2.5" aria-hidden="true" />
                        Primary
                      </span>
                    )}
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() =>
                          updateCharacter({
                            characterId,
                            primaryImageId: storageId as Id<"_storage">,
                          })
                        }
                        disabled={isAnyOperationInProgress}
                        className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
                      >
                        <Star className="size-2.5" aria-hidden="true" />
                        Set primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImageClick(storageId)}
                      disabled={isAnyOperationInProgress}
                      className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:opacity-100 disabled:opacity-0 disabled:pointer-events-none motion-reduce:transition-none"
                      aria-label="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-border/40 bg-muted/20 py-10 text-center">
              <div className="size-12 rounded-full border-2 border-dashed border-teal/20 flex items-center justify-center mx-auto mb-3">
                <ImageIcon
                  className="size-5 text-muted-foreground/30"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload or generate reference images to define your
                character&apos;s look
              </p>
            </div>
          )}
        </section>

        {/* Remove image confirmation — shown when visual description exists */}
        <AlertDialog
          open={pendingRemoveImageId !== null}
          onOpenChange={open => {
            if (!open) setPendingRemoveImageId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this image?</AlertDialogTitle>
              <AlertDialogDescription>
                The visual description may still reference details from this
                image. You&apos;ll want to review and update it after removing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveAndReviewPrompt}>
                Remove &amp; Review
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Visual Description — collapsible */}
        <section
          ref={promptSectionRef}
          className="border border-border/50 rounded-xl overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setPromptExpanded(!promptExpanded)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/20 transition-colors duration-150 motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            aria-expanded={promptExpanded}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Paintbrush
                  className="size-4 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-medium text-foreground">
                  Visual Description
                </h2>
                {hasPromptFragment && !isPromptStale && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal/8 text-teal">
                    Active
                  </span>
                )}
                {isPromptStale && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                    May be outdated
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 ml-6 line-clamp-1">
                {isPromptStale
                  ? "Character details changed since this was last generated"
                  : hasPromptFragment
                    ? "Ensures consistent look across all illustrations"
                    : canGeneratePrompt
                      ? "Generate from your character details for AI consistency"
                      : "Complete the character details above first"}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground shrink-0 ml-2 transition-transform duration-200 motion-reduce:transition-none",
                promptExpanded && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
          {promptExpanded && (
            <div className="px-5 pb-5 border-t border-border/50">
              <div className="pt-5 space-y-3">
                <Button
                  size="sm"
                  onClick={handleGeneratePrompt}
                  disabled={isAnyOperationInProgress || !canGeneratePrompt}
                  className="gap-1.5 bg-teal text-white hover:bg-teal/90"
                >
                  {isGeneratingPrompt ? (
                    <Loader2
                      className="size-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Wand2 className="size-3.5" aria-hidden="true" />
                  )}
                  {isGeneratingPrompt
                    ? "Crafting description..."
                    : hasPromptFragment
                      ? "Regenerate"
                      : "Generate from Details"}
                </Button>

                {/* Stale warning */}
                {isPromptStale && !isGeneratingPrompt && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <AlertCircle
                      className="size-3.5 text-amber-600 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-amber-800">
                      Character details have changed since this was last
                      generated. Regenerate to keep illustrations consistent.
                    </p>
                  </div>
                )}

                {/* Single status area */}
                {promptError ? (
                  <div
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                    role="alert"
                  >
                    <AlertCircle
                      className="size-3.5 text-destructive shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-destructive">{promptError}</p>
                  </div>
                ) : isGeneratingPrompt ? (
                  <div className="flex items-center gap-2" aria-live="polite">
                    <Loader2
                      className="size-3.5 animate-spin text-teal"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-teal font-medium">
                      Reading character details and crafting a visual
                      description...
                    </p>
                  </div>
                ) : !canGeneratePrompt && !isAnyOperationInProgress ? (
                  <p className="text-xs text-muted-foreground">
                    Add a name and appearance above to generate
                  </p>
                ) : null}

                <Textarea
                  value={displayPromptFragment}
                  onChange={e => handlePromptFragmentChange(e.target.value)}
                  placeholder="A friendly bear character with round brown fur, wearing a blue scarf and small round glasses..."
                  rows={4}
                  className="resize-none text-sm"
                  aria-label="Visual description"
                />
                <p className="text-xs text-muted-foreground">
                  Prepended to every AI image prompt for consistent results.
                  Updated automatically when you upload reference images.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
