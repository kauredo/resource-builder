"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { generateWorksheetPDF } from "@/lib/pdf-worksheet";
import { Plus, Wand2, Trash2 } from "lucide-react";
import type { StylePreset, WorksheetBlock, WorksheetContent } from "@/types";
import { createWorksheetTemplate } from "@/lib/resource-templates";

const STEP_LABELS = ["Style", "Blocks", "Image", "Export"] as const;
const STEP_TITLES = ["Name & Style", "Blocks", "Header Image", "Export"] as const;

interface WorksheetWizardProps {
  resourceId?: Id<"resources">;
}

export function WorksheetWizard({ resourceId: editResourceId }: WorksheetWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStyleId = searchParams.get("styleId") as Id<"styles"> | null;
  const user = useQuery(api.users.currentUser);
  const draftResources = useQuery(
    api.resources.getResourcesByType,
    user?._id ? { userId: user._id, type: "worksheet" } : "skip",
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
  const generateImage = useAction(api.images.generateStyledImage);

  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<Id<"resources"> | null>(
    null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [state, setState] = useState(() => {
    const template = createWorksheetTemplate();
    return {
      name: template.name,
      styleId: null as Id<"styles"> | null,
      stylePreset: null as StylePreset | null,
      title: template.title,
      blocks: template.blocks,
      headerImagePrompt: template.headerImagePrompt ?? "",
      resourceId: null as Id<"resources"> | null,
      isEditMode: false,
    };
  });

  const assetOwnerId = state.resourceId ?? editResourceId;
  const assets = useQuery(
    api.assets.getAsset,
    assetOwnerId
      ? {
          ownerType: "resource",
          ownerId: assetOwnerId,
          assetType: "worksheet_image",
          assetKey: "worksheet_header",
        }
      : "skip",
  );

  useEffect(() => {
    if (!editResourceId || !existingResource) return;
    // Wait for style to load if the resource has one
    if (existingResource.styleId && !existingStyle) return;
    const content = existingResource.content as WorksheetContent;
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
      title: content.title,
      blocks: content.blocks,
      headerImagePrompt: content.headerImagePrompt ?? "",
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

  const addBlock = (type: WorksheetBlock["type"]) => {
    const newBlock: WorksheetBlock =
      type === "checklist"
        ? { type, items: [""] }
        : type === "lines"
          ? { type, lines: 3 }
          : type === "scale"
            ? { type, scaleLabels: { min: "Low", max: "High" } }
            : { type, text: "" };

    setState((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const updateBlock = (index: number, updates: Partial<WorksheetBlock>) => {
    setState((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block, i) =>
        i === index ? { ...block, ...updates } : block,
      ),
    }));
  };

  const removeBlock = (index: number) => {
    setState((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }));
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

    const content: WorksheetContent = {
      title: state.title,
      blocks: state.blocks,
      headerImagePrompt: state.headerImagePrompt || undefined,
      headerImageAssetKey: "worksheet_header",
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
      type: "worksheet",
      name: state.name,
      description: `Worksheet: ${state.title || state.name}`,
      content,
    });
    return newId;
  }, [user?._id, state, createResource, updateResource, getOrCreatePresetStyle]);

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return state.name.trim().length > 0;
      case 1:
        return state.title.trim().length > 0;
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
    if (!state.headerImagePrompt.trim()) return;
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
        assetType: "worksheet_image",
        assetKey: "worksheet_header",
        prompt: `Worksheet header illustration: ${state.headerImagePrompt}`,
        style: styleArg,
        includeText: false,
        aspect: "4:3",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    const blob = await generateWorksheetPDF({
      content: {
        title: state.title,
        blocks: state.blocks,
        headerImagePrompt: state.headerImagePrompt || undefined,
        headerImageAssetKey: "worksheet_header",
      },
      style: state.stylePreset
        ? { colors: state.stylePreset.colors, typography: state.stylePreset.typography }
        : undefined,
      headerImageUrl: assets?.currentVersion?.url ?? undefined,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.name || "worksheet"}.pdf`;
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
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="status"
        aria-label="Loading"
      >
        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <WizardLayout
      title="Worksheet"
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
      nextLabel={currentStep === 1 ? "Image" : currentStep === 2 ? "Export" : "Continue"}
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
            <Label className="text-base font-medium">Worksheet Name</Label>
            <Input
              value={state.name}
              onChange={(e) => setState((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Coping Skills Worksheet"
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
                Pick a style to keep colors, fonts, and illustrations consistent. Skip to let the AI choose freely.
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
        <div className="space-y-6">
          <div className="space-y-2 max-w-xl">
            <Label>Worksheet Title</Label>
            <Input
              value={state.title}
              onChange={(e) => setState((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Title shown on the worksheet"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["heading", "prompt", "lines", "checklist", "scale", "text"] as WorksheetBlock["type"][]).map((type) => (
              <Button key={type} variant="outline" size="sm" onClick={() => addBlock(type)}>
                <Plus className="size-3.5 mr-1" aria-hidden="true" />
                {type}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {state.blocks.map((block, index) => (
              <div key={index} className="rounded-xl border border-border/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize">{block.type}</p>
                  <Button variant="ghost" size="icon" onClick={() => removeBlock(index)}>
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                {block.type === "checklist" && (
                  <Textarea
                    value={(block.items ?? []).join("\n")}
                    onChange={(e) => updateBlock(index, { items: e.target.value.split("\n") })}
                    placeholder="One item per line"
                    rows={4}
                    aria-label="Checklist items"
                  />
                )}
                {block.type === "scale" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={block.scaleLabels?.min ?? ""}
                      onChange={(e) => updateBlock(index, { scaleLabels: { min: e.target.value, max: block.scaleLabels?.max ?? "" } })}
                      placeholder="Min label"
                      aria-label="Scale minimum label"
                    />
                    <Input
                      value={block.scaleLabels?.max ?? ""}
                      onChange={(e) => updateBlock(index, { scaleLabels: { min: block.scaleLabels?.min ?? "", max: e.target.value } })}
                      placeholder="Max label"
                      aria-label="Scale maximum label"
                    />
                  </div>
                )}
                {(block.type === "heading" || block.type === "prompt" || block.type === "text") && (
                  <Textarea
                    value={block.text ?? ""}
                    onChange={(e) => updateBlock(index, { text: e.target.value })}
                    placeholder="Block text"
                    rows={3}
                    aria-label={`${block.type} text`}
                  />
                )}
                {block.type === "lines" && (
                  <Input
                    type="number"
                    value={block.lines ?? 3}
                    onChange={(e) => updateBlock(index, { lines: Number(e.target.value) })}
                    min={1}
                    max={10}
                    aria-label="Number of lines"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <Label>Header image prompt (optional)</Label>
            <Textarea
              value={state.headerImagePrompt}
              onChange={(e) => setState((prev) => ({ ...prev, headerImagePrompt: e.target.value }))}
              rows={3}
              placeholder="Describe a minimal header illustration"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateImage}
              className="btn-coral gap-2"
              disabled={!state.resourceId || isGenerating || !state.headerImagePrompt.trim()}
            >
              <Wand2 className="size-4" aria-hidden="true" />
              {isGenerating ? "Generating..." : "Generate Image"}
            </Button>
            {state.resourceId && (
              <AssetHistoryDialog
                assetRef={{
                  ownerType: "resource",
                  ownerId: state.resourceId,
                  assetType: "worksheet_image",
                  assetKey: "worksheet_header",
                }}
                triggerLabel="History"
              />
            )}
            {assets?.currentVersion?.url && (
              <Button variant="outline" onClick={() => setIsEditorOpen(true)}>
                Edit
              </Button>
            )}
          </div>
          {assets?.currentVersion?.url && (
            <img
              src={assets.currentVersion.url}
              alt="Worksheet header preview"
              className="h-40 rounded-lg border border-border/60"
            />
          )}

          {assets?.currentVersion?.url && (
            <ImageEditorModal
              open={isEditorOpen}
              onOpenChange={setIsEditorOpen}
              assetRef={{
                ownerType: "resource",
                ownerId: state.resourceId as Id<"resources">,
                assetType: "worksheet_image",
                assetKey: "worksheet_header",
              }}
              imageUrl={assets.currentVersion.url}
              aspectRatio={4 / 3}
              title="Edit worksheet header"
            />
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="rounded-xl border border-border/60 bg-card p-6 max-w-xl">
          <h3 className="font-medium text-foreground">Ready to export</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Generate a print-ready worksheet PDF.
          </p>
          <Button onClick={handleExport} className="btn-coral mt-4">
            Download PDF
          </Button>
        </div>
      )}
    </WizardLayout>
  );
}
