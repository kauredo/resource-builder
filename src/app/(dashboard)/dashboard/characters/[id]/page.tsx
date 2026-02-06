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
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CharacterDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);

  // Local state for debounced fields
  const [localName, setLocalName] = useState<string | null>(null);
  const [localDescription, setLocalDescription] = useState<string | null>(null);
  const [localPersonality, setLocalPersonality] = useState<string | null>(null);
  const [localPromptFragment, setLocalPromptFragment] = useState<string | null>(
    null
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
    api.characterActions.generateReferenceImage
  );
  const generatePromptFragment = useAction(
    api.characterActions.generatePromptFragment
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
      [characterId, updateCharacter]
    ),
  });

  // Derived values
  const displayName = localName ?? character?.name ?? "";
  const displayDescription = localDescription ?? character?.description ?? "";
  const displayPersonality = localPersonality ?? character?.personality ?? "";
  const displayPromptFragment =
    localPromptFragment ?? character?.promptFragment ?? "";

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

  // Debounced field handlers
  const handleNameChange = useCallback(
    (value: string) => {
      setLocalName(value);
      debouncedSave({ name: value });
    },
    [debouncedSave]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setLocalDescription(value);
      debouncedSave({ description: value });
    },
    [debouncedSave]
  );

  const handlePersonalityChange = useCallback(
    (value: string) => {
      setLocalPersonality(value);
      debouncedSave({ personality: value });
    },
    [debouncedSave]
  );

  const handlePromptFragmentChange = useCallback(
    (value: string) => {
      setLocalPromptFragment(value);
      debouncedSave({ promptFragment: value });
    },
    [debouncedSave]
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

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await addReferenceImage({ characterId, storageId });
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      await generateReferenceImage({ characterId });
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const result = await generatePromptFragment({ characterId });
      setLocalPromptFragment(result.promptFragment);
      setPromptExpanded(true);
    } catch (error) {
      console.error("Failed to generate prompt:", error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleRemoveImage = async (storageId: string) => {
    try {
      await removeReferenceImage({
        characterId,
        storageId: storageId as Id<"_storage">,
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
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
  const primaryImageUrl =
    character.referenceImages.length > 0
      ? character.imageUrls[character.referenceImages[0]]
      : null;

  const hasPromptFragment = displayPromptFragment.trim().length > 0;

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
              {/* Primary badge when portrait is populated */}
              {primaryImageUrl && (
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm">
                  <Star className="size-2.5" aria-hidden="true" />
                  Primary
                </span>
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  maxLength={100}
                  className="font-serif text-3xl sm:text-4xl font-medium tracking-tight border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
                  placeholder="Character name"
                  aria-label="Character name"
                />
                {saveStatus !== "idle" && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1" aria-live="polite">
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
                Description
              </Label>
              <Textarea
                id="description"
                value={displayDescription}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Describe the character's appearance and key traits..."
                rows={3}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Visual details help AI generate consistent illustrations
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="personality"
                className="text-xs text-muted-foreground"
              >
                Personality
              </Label>
              <Textarea
                id="personality"
                value={displayPersonality}
                onChange={(e) => handlePersonalityChange(e.target.value)}
                placeholder="Describe the character's personality, mannerisms, and emotional range..."
                rows={3}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Personality traits influence how emotions are expressed
              </p>
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
              <ImageIcon
                className="size-4 text-teal"
                aria-hidden="true"
              />
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
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload reference image"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
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
                disabled={isGeneratingImage}
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
                {isGeneratingImage ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
          </div>

          {/* Image grid */}
          {character.referenceImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {character.referenceImages.map((storageId, index) => {
                const url = character.imageUrls[storageId];
                const isPrimary = index === 0;
                return (
                  <div
                    key={storageId}
                    className={cn(
                      "group relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border",
                      isPrimary
                        ? "border-teal/40 ring-1 ring-teal/20"
                        : "border-border/50"
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
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(storageId)}
                      className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:opacity-100 motion-reduce:transition-none"
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

        {/* AI Prompt Fragment — collapsible */}
        <section className="border border-border/50 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setPromptExpanded(!promptExpanded)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-inset motion-reduce:transition-none"
            aria-expanded={promptExpanded}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Paintbrush
                  className="size-4 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-medium text-foreground">
                  AI Prompt Fragment
                </h2>
                {hasPromptFragment && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal/8 text-teal">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 ml-6 line-clamp-1">
                {hasPromptFragment
                  ? "Visual description used to keep this character consistent"
                  : "Generate a visual prompt to ensure consistency across illustrations"}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground shrink-0 ml-2 transition-transform duration-200 motion-reduce:transition-none",
                promptExpanded && "rotate-180"
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
                  disabled={isGeneratingPrompt}
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
                    ? "Generating..."
                    : "Generate from Description"}
                </Button>
                <Textarea
                  value={displayPromptFragment}
                  onChange={(e) => handlePromptFragmentChange(e.target.value)}
                  placeholder="A friendly bear character with round brown fur, wearing a blue scarf and small round glasses..."
                  rows={4}
                  className="resize-none text-sm"
                  aria-label="AI prompt fragment"
                />
                <p className="text-xs text-muted-foreground">
                  This text is prepended to all image generation prompts for
                  this character
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
