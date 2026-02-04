"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylePicker } from "../StylePicker";
import { StylePreset } from "@/types";
import { STYLE_PRESETS } from "@/lib/style-presets";
import { HelpTip } from "@/components/onboarding/HelpTip";
import type { WizardState } from "../EmotionCardsWizard";

interface NameStyleStepProps {
  name: string;
  styleId: Id<"styles"> | null;
  stylePreset: StylePreset | null;
  onUpdate: (updates: Partial<WizardState>) => void;
  initialStyleName?: string | null;
  isFirstTimeUser?: boolean;
}

export function NameStyleStep({
  name,
  styleId,
  stylePreset,
  onUpdate,
  initialStyleName,
  isFirstTimeUser = true,
}: NameStyleStepProps) {
  const user = useQuery(api.users.currentUser);
  const createStyle = useMutation(api.styles.createStyle);
  const hasAppliedInitialStyle = useRef(false);

  // Auto-select initial style from URL param (only once)
  useEffect(() => {
    if (
      initialStyleName &&
      !hasAppliedInitialStyle.current &&
      !styleId &&
      user?._id
    ) {
      const preset = STYLE_PRESETS.find((p) => p.name === initialStyleName);
      if (preset) {
        hasAppliedInitialStyle.current = true;
        // Create style record for the preset
        createStyle({
          userId: user._id,
          name: preset.name,
          isPreset: true,
          colors: preset.colors,
          typography: preset.typography,
          illustrationStyle: preset.illustrationStyle,
        }).then((newStyleId) => {
          onUpdate({ styleId: newStyleId, stylePreset: preset });
        });
      }
    }
  }, [initialStyleName, styleId, user?._id, createStyle, onUpdate]);

  const handleStyleSelect = async (
    selectedStyleId: Id<"styles"> | null,
    preset: StylePreset | null
  ) => {
    if (selectedStyleId) {
      // User selected their own style
      onUpdate({ styleId: selectedStyleId, stylePreset: preset });
    } else if (preset && user?._id) {
      // User selected a preset - create a style record for it
      const newStyleId = await createStyle({
        userId: user._id,
        name: preset.name,
        isPreset: true,
        colors: preset.colors,
        typography: preset.typography,
        illustrationStyle: preset.illustrationStyle,
      });
      onUpdate({ styleId: newStyleId, stylePreset: preset });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]" role="status" aria-label="Loading">
        <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* First-time help tip - only show for new users */}
      {isFirstTimeUser && (
        <HelpTip>
          Think of your style as this deck&apos;s personality — it shapes every
          illustration we create together.
        </HelpTip>
      )}

      {/* Deck Name */}
      <div className="space-y-2">
        <Label htmlFor="deck-name" className="text-base font-medium">
          Deck Name
        </Label>
        <Input
          id="deck-name"
          type="text"
          placeholder="e.g., Primary Feelings, Coping Emotions..."
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="max-w-md text-base"
          autoFocus
        />
        <p className="text-sm text-muted-foreground">
          Give your emotion card deck a descriptive name.
        </p>
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Visual Style
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a style for your emotion cards. This determines colors, fonts, and illustration style.
        </p>
        <StylePicker
          selectedStyleId={styleId}
          selectedPreset={stylePreset}
          onSelect={handleStyleSelect}
          userId={user._id}
        />
      </div>

    </div>
  );
}
