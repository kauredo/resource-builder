"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { StylePreset } from "@/types";
import type { StarterTemplate, StarterTheme } from "@/lib/starter-templates";
import { THEME_LABELS, RESOURCE_TYPE_LABELS } from "@/lib/starter-templates";
import type { ResourceType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TemplateContentPreview } from "./TemplateContentPreview";
import { StylePicker } from "@/components/resource/emotion-cards/StylePicker";

interface TemplatePreviewDialogProps {
  template: StarterTemplate | null;
  onClose: () => void;
  userId: Id<"users">;
}

export function TemplatePreviewDialog({
  template,
  onClose,
  userId,
}: TemplatePreviewDialogProps) {
  const [step, setStep] = useState<"preview" | "style">("preview");
  const [selectedStyleId, setSelectedStyleId] = useState<Id<"styles"> | null>(
    null
  );
  const [selectedPreset, setSelectedPreset] = useState<StylePreset | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const createFromTemplate = useMutation(
    api.starterTemplates.createResourceFromTemplate
  );

  const handleClose = useCallback(() => {
    setStep("preview");
    setSelectedStyleId(null);
    setSelectedPreset(null);
    setIsCreating(false);
    onClose();
  }, [onClose]);

  const handleUseTemplate = () => {
    setStep("style");
  };

  const handleStyleSelect = (
    styleId: Id<"styles"> | null,
    preset: StylePreset | null
  ) => {
    setSelectedStyleId(styleId);
    setSelectedPreset(preset);
  };

  const handleCreate = async () => {
    if (!template || isCreating) return;
    setIsCreating(true);
    try {
      const resourceId = await createFromTemplate({
        userId,
        templateId: template.id,
        styleId: selectedStyleId ?? undefined,
      });
      handleClose();
      router.push(`/dashboard/resources/${resourceId}/edit`);
    } catch {
      toast.error("Failed to create resource from template");
      setIsCreating(false);
    }
  };

  if (!template) return null;

  const typeLabel = RESOURCE_TYPE_LABELS[template.type as Exclude<ResourceType, "free_prompt">] ?? template.type;
  const styleName = selectedPreset?.name ?? template.name;
  const buttonLabel = selectedPreset
    ? `Create with ${styleName.length > 20 ? styleName.slice(0, 20) + "…" : styleName}`
    : `Create ${template.name.length > 25 ? template.name.slice(0, 25) + "…" : template.name}`;

  return (
    <Dialog open={!!template} onOpenChange={(open) => !open && !isCreating && handleClose()}>
      <DialogContent className={cn("max-h-[85vh] overflow-y-auto", step === "style" ? "max-w-2xl" : "max-w-lg")}>
        {/* Crossfade wrapper — each step fades in */}
        <div
          key={step}
          className="animate-in fade-in duration-150 motion-reduce:animate-none"
        >
          {step === "preview" ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {typeLabel}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground capitalize">
                    {THEME_LABELS[template.theme as StarterTheme] ??
                      template.theme}
                  </span>
                </div>
                <DialogTitle className="font-serif text-xl font-medium">
                  {template.name}
                </DialogTitle>
              </DialogHeader>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {template.description}
              </p>

              <div className="border-t border-border/40 my-1" />

              <TemplateContentPreview template={template} />

              <div className="border-t border-border/40 my-1" />

              <div>
                <Button
                  onClick={handleUseTemplate}
                  className="w-full bg-coral text-white hover:bg-coral/90"
                >
                  Use This Template
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  You&apos;ll choose a style and generate images next.
                </p>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl font-medium">
                  Choose a style
                </DialogTitle>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">
                This sets the colours, fonts, and illustration style for{" "}
                <strong>{template.name}</strong>. You can skip this and let the
                AI decide.
              </p>

              <StylePicker
                selectedStyleId={selectedStyleId}
                selectedPreset={selectedPreset}
                onSelect={handleStyleSelect}
                userId={userId}
              />

              <div className="flex flex-col gap-2 mt-2">
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className={cn(
                    "w-full bg-coral text-white hover:bg-coral/90",
                    isCreating && "opacity-70"
                  )}
                >
                  {isCreating ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin motion-reduce:animate-none mr-2"
                        aria-hidden="true"
                      />
                      Creating...
                    </>
                  ) : (
                    buttonLabel
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("preview")}
                  disabled={isCreating}
                  className={cn(
                    "text-xs text-muted-foreground hover:text-foreground cursor-pointer",
                    "transition-colors duration-150 motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded",
                    isCreating && "opacity-50 pointer-events-none"
                  )}
                >
                  Back to template
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
