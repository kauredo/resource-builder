"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WizardLayout } from "@/components/resource/wizard/WizardLayout";
import { StylePicker } from "@/components/resource/emotion-cards/StylePicker";
import { DraftResumeDialog } from "@/components/resource/DraftResumeDialog";
import { AssetHistoryDialog } from "@/components/resource/AssetHistoryDialog";
import { ImageEditorModal } from "@/components/resource/editor/ImageEditorModal";
import { generateImagePagesPDF } from "@/lib/pdf-image-pages";
import { Wand2 } from "lucide-react";
import type { FreePromptContent, StylePreset } from "@/types";
import { toast } from "sonner";

const STEP_LABELS = ["Style", "Prompt", "Generate", "Export"] as const;
const STEP_TITLES = ["Name & Style", "Prompt", "Generate", "Export"] as const;

interface FreePromptWizardProps {
  resourceId?: Id<"resources">;
}

export function FreePromptWizard({ resourceId: editResourceId }: FreePromptWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStyleId = searchParams.get("styleId") as Id<"styles"> | null;
  const user = useQuery(api.users.currentUser);
  const draftResources = useQuery(
    api.resources.getResourcesByType,
    user?._id ? { userId: user._id, type: "free_prompt" } : "skip",
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

  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<Id<"resources"> | null>(
    null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [state, setState] = useState({
    name: "",
    styleId: null as Id<"styles"> | null,
    stylePreset: null as StylePreset | null,
    prompt: "",
    aspect: "1:1" as "1:1" | "3:4" | "4:3",
    resourceId: null as Id<"resources"> | null,
    isEditMode: false,
  });

  const assetOwnerId = state.resourceId ?? editResourceId;
  const asset = useQuery(
    api.assets.getAsset,
    assetOwnerId
      ? {
          ownerType: "resource",
          ownerId: assetOwnerId,
          assetType: "free_prompt_image",
          assetKey: "prompt_main",
        }
      : "skip",
  );

  const createResource = useMutation(api.resources.createResource);
  const updateResource = useMutation(api.resources.updateResource);
  const getOrCreatePresetStyle = useMutation(api.styles.getOrCreatePresetStyle);
  const generateImage = useAction(api.images.generateStyledImage);

  useEffect(() => {
    if (!editResourceId || !existingResource) return;
    // Wait for style to load if the resource has one
    if (existingResource.styleId && !existingStyle) return;
    const content = existingResource.content as FreePromptContent;
    setState({
      name: existingResource.name,
      styleId: existingResource.styleId ?? null,
      stylePreset: existingStyle
        ? {
            name: existingStyle.name,
            colors: existingStyle.colors,
            typography: existingStyle.typography,
            illustrationStyle: existingStyle.illustrationStyle,
          }
        : null,
      prompt: content.prompt,
      aspect: content.output.aspect,
      resourceId: existingResource._id,
      isEditMode: true,
    });
  }, [editResourceId, existingResource, existingStyle]);

  // Initialize from URL styleId param (e.g., from style detail page "Create Resource")
  const hasInitializedFromUrl = useRef(false);
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

  useEffect(() => {
    if (!user?._id || editResourceId || state.resourceId) return;
    if (draftResources === undefined) return;
    if (showResumeDialog) return;

    const drafts = draftResources.filter((r) => r.status === "draft");
    if (drafts.length === 0) return;
    const latest = drafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    setResumeDraftId(latest._id);
    setShowResumeDialog(true);
  }, [user?._id, editResourceId, state.resourceId, draftResources, showResumeDialog]);

  const handleStyleSelect = (
    selectedStyleId: Id<"styles"> | null,
    preset: StylePreset | null,
  ) => {
    setState((prev) => ({ ...prev, styleId: selectedStyleId, stylePreset: preset }));
  };

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
      setState((prev) => ({ ...prev, styleId }));
    }

    const content: FreePromptContent = {
      prompt: state.prompt,
      output: { type: "single_image", aspect: state.aspect },
      imageAssetKey: "prompt_main",
    };

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
      type: "free_prompt",
      name: state.name,
      description: "Free prompt",
      content,
    });
    return newId;
  }, [user?._id, state, createResource, updateResource, getOrCreatePresetStyle]);

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return state.name.trim().length > 0;
      case 1:
        return state.prompt.trim().length > 0;
      case 2:
        return !!asset?.currentVersion?.url;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      if (currentStep === 0 && !state.resourceId) {
        const resourceId = await saveDraft();
        if (resourceId) setState((prev) => ({ ...prev, resourceId }));
      }
      if (state.resourceId && currentStep > 0) {
        await saveDraft();
      }
      setCurrentStep((prev) => Math.min(prev + 1, STEP_LABELS.length - 1));
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const handleCancel = () => {
    if (state.isEditMode && state.resourceId) {
      router.push(`/dashboard/resources/${state.resourceId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGenerateImage = async () => {
    if (!state.resourceId) return;
    setIsGenerating(true);
    try {
      const styleArg = state.stylePreset
        ? {
            colors: {
              primary: state.stylePreset.colors.primary,
              secondary: state.stylePreset.colors.secondary,
              accent: state.stylePreset.colors.accent,
            },
            illustrationStyle: state.stylePreset.illustrationStyle,
          }
        : undefined;

      await generateImage({
        ownerType: "resource",
        ownerId: state.resourceId,
        assetType: "free_prompt_image",
        assetKey: "prompt_main",
        prompt: state.prompt,
        style: styleArg,
        includeText: false,
        aspect: state.aspect,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!asset?.currentVersion?.url) return;
    const blob = await generateImagePagesPDF({
      images: [asset.currentVersion.url],
      layout: "full_page",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.name || "free-prompt"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (state.resourceId) {
      await updateResource({ resourceId: state.resourceId, status: "complete" });
    }
  };

  const isLoading =
    !user || (editResourceId && !existingResource);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading">
        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <WizardLayout
      title="Free Prompt"
      stepLabels={[...STEP_LABELS]}
      stepTitles={[...STEP_TITLES]}
      currentStep={currentStep}
      onStepClick={(step) => setCurrentStep(step)}
      onBack={handleBack}
      onNext={handleNext}
      onCancel={handleCancel}
      canGoNext={canGoNext()}
      isNavigating={isNavigating}
      isEditMode={state.isEditMode}
      nextLabel={currentStep === 1 ? "Generate" : currentStep === 2 ? "Export" : "Continue"}
    >
      <DraftResumeDialog
        open={showResumeDialog}
        onResume={() => {
          if (resumeDraftId) router.push(`/dashboard/resources/${resumeDraftId}/edit`);
        }}
        onStartFresh={() => setShowResumeDialog(false)}
      />

      {currentStep === 0 && (
        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="text-base font-medium">Resource Name</Label>
            <Input
              value={state.name}
              onChange={(e) => setState((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Calm Scene"
              className="max-w-md text-base"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium">Visual Style <span className="text-muted-foreground font-normal">(optional)</span></Label>
            {state.isEditMode ? (
              <p className="text-sm text-muted-foreground">
                {state.stylePreset
                  ? `Style is locked after creation (${state.stylePreset.name}).`
                  : "No style — the AI chooses colors and illustrations freely."}
              </p>
            ) : (
              <>
              <p className="text-sm text-muted-foreground mb-4">
                Pick a style to keep colors and illustrations consistent. Skip to let the AI choose freely.
              </p>
              <StylePicker
                selectedStyleId={state.styleId}
                selectedPreset={state.stylePreset}
                onSelect={handleStyleSelect}
                userId={user._id}
              />
              </>
            )}
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-4 max-w-xl">
          <Label>Prompt</Label>
          <Textarea
            value={state.prompt}
            onChange={(e) => setState((prev) => ({ ...prev, prompt: e.target.value }))}
            rows={5}
            placeholder="Describe the image you want"
          />
          <div className="space-y-2">
            <Label>Aspect ratio</Label>
            <div className="flex gap-2">
              {(["1:1", "3:4", "4:3"] as const).map((ratio) => (
                <Button
                  key={ratio}
                  variant={state.aspect === ratio ? "default" : "outline"}
                  onClick={() => setState((prev) => ({ ...prev, aspect: ratio }))}
                >
                  {ratio}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <Button
            onClick={handleGenerateImage}
            className="btn-coral gap-2"
            disabled={isGenerating || !state.resourceId}
          >
            <Wand2 className="size-4" aria-hidden="true" />
            {isGenerating ? "Generating..." : "Generate image"}
          </Button>
          {assetOwnerId && (
            <AssetHistoryDialog
              assetRef={{
                ownerType: "resource",
                ownerId: assetOwnerId,
                assetType: "free_prompt_image",
                assetKey: "prompt_main",
              }}
              triggerLabel="History"
            />
          )}
          {asset?.currentVersion?.url && (
            <div className="space-y-2">
              <img src={asset.currentVersion.url} alt="Preview" className="rounded-lg border border-border/60 max-w-md" />
              <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
                Edit image
              </Button>
            </div>
          )}

          {asset?.currentVersion?.url && (
            <ImageEditorModal
              open={isEditorOpen}
              onOpenChange={setIsEditorOpen}
              assetRef={{
                ownerType: "resource",
                ownerId: assetOwnerId as Id<"resources">,
                assetType: "free_prompt_image",
                assetKey: "prompt_main",
              }}
              imageUrl={asset.currentVersion.url}
              title="Edit image"
              aspectRatio={state.aspect === "1:1" ? 1 : state.aspect === "3:4" ? 3 / 4 : 4 / 3}
            />
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="rounded-xl border border-border/60 bg-card p-6 max-w-xl">
          <h3 className="font-medium text-foreground">Ready to export</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Generate a print-ready PDF with your prompt and image.
          </p>
          <Button onClick={handleExport} className="btn-coral mt-4" disabled={!asset?.currentVersion?.url}>
            Download PDF
          </Button>
        </div>
      )}
    </WizardLayout>
  );
}
