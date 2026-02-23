"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { AIWizardState, ImageItem } from "../use-ai-wizard";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type {
  CardGameBackground,
  CardGameIcon,
  CardGameCardEntry,
  CardGameTextSettings,
  CardTextHAlign,
  CardTextVAlign,
  CharacterPlacement,
  ShowTextMode,
} from "@/types";

// Available PDF fonts (sourced from pdf-fonts.ts)
const AVAILABLE_FONTS = [
  "Nunito",
  "Fredoka",
  "Poppins",
  "Baloo 2",
  "Quicksand",
  "Comfortaa",
  "Pacifico",
  "Rubik",
  "Open Sans",
  "Lato",
  "Work Sans",
  "Nunito Sans",
];

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Math.random().toString(36).slice(2, 10)}`;

interface CardGameReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

export function CardGameReview({ state, onUpdate }: CardGameReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const rules = (content.rules as string) || "";
  const deckName = (content.deckName as string) || "";
  const backgrounds = (content.backgrounds as CardGameBackground[]) || [];
  const icons = (content.icons as CardGameIcon[]) || [];
  const cardBack = content.cardBack as
    | { imagePrompt: string; imageAssetKey: string }
    | undefined;
  const textSettings = (content.textSettings as CardGameTextSettings) || {
    fontFamily: "Fredoka",
    defaultFontSize: 48,
    defaultColor: "#FFFFFF",
    defaultOutlineWidth: 3,
    defaultOutlineColor: "#333333",
    defaultHAlign: "center" as const,
    defaultVAlign: "center" as const,
  };
  const cards = (content.cards as CardGameCardEntry[]) || [];
  const characterPlacement =
    (content.characterPlacement as CharacterPlacement) || "backgrounds";
  const showTextMode = (content.showText as ShowTextMode) || "numbers_only";

  // Resolve character IDs for "resource" mode
  const resourceCharacterIds =
    state.characterSelection?.mode === "resource" &&
    state.characterSelection.characterIds.length > 0
      ? state.characterSelection.characterIds.map((id) => id as Id<"characters">)
      : undefined;

  // Helper to update content and sync imageItems
  const updateContent = useCallback(
    (newContent: Record<string, unknown>) => {
      const newBgs = (newContent.backgrounds as CardGameBackground[]) || [];
      const newIcons = (newContent.icons as CardGameIcon[]) || [];
      const newCardBack = newContent.cardBack as
        | { imagePrompt: string; imageAssetKey: string }
        | undefined;

      const rawPlacement =
        (newContent.characterPlacement as string) || "";
      const placement: CharacterPlacement =
        (["backgrounds", "icons", "both", "none"] as const).includes(
          rawPlacement as CharacterPlacement,
        )
          ? (rawPlacement as CharacterPlacement)
          : "backgrounds";
      const charIdsForBg =
        placement === "backgrounds" || placement === "both"
          ? resourceCharacterIds
          : undefined;
      const charIdsForIcon =
        placement === "icons" || placement === "both"
          ? resourceCharacterIds
          : undefined;

      const imageItems: ImageItem[] = [];

      newBgs.forEach((bg) => {
        const bgPrompt = bg.imagePrompt || `Card background for ${bg.label}`;
        imageItems.push({
          assetKey: bg.imageAssetKey || `card_bg:${bg.id}`,
          assetType: "card_bg",
          prompt:
            `CARD BACKGROUND for a printable card game. ${bgPrompt}. ` +
            "This image is ONLY the card itself — fill the entire image edge-to-edge with the design, no borders, margins, padding, or surrounding space. " +
            "Keep the center area relatively clear and simple so that icons and text can be overlaid on top. " +
            (charIdsForBg ? "If a character is included, place them along the edges or corners of the card — NOT in the center. The center must stay clear for overlay elements. " : "") +
            "Do NOT use a white background — the image IS the full card background. Use a 3:4 portrait aspect ratio.",
          label: bg.label || "Background",
          characterIds: charIdsForBg,
          includeText: false,
          aspect: "3:4",
          group: "Backgrounds",
          status: "pending",
        });
      });

      newIcons.forEach((icon) => {
        imageItems.push({
          assetKey: icon.imageAssetKey || `card_icon:${icon.id}`,
          assetType: "card_icon",
          prompt: icon.imagePrompt || `Card icon: ${icon.label}`,
          label: icon.label || "Icon",
          characterIds: charIdsForIcon,
          includeText: false,
          aspect: "1:1",
          greenScreen: true,
          group: "Icons",
          status: "pending",
        });
      });

      if (newCardBack?.imagePrompt) {
        imageItems.push({
          assetKey: newCardBack.imageAssetKey || "card_back",
          assetType: "card_back",
          prompt:
            `CARD BACK design for a printable card game. ${newCardBack.imagePrompt}. ` +
            "Fill the entire image edge-to-edge with the design, no borders, margins, or surrounding space. " +
            "This is the back face of a playing card. Use a 3:4 portrait aspect ratio.",
          label: "Card Back",
          includeText: false,
          aspect: "3:4",
          group: "Card Back",
          status: "pending",
        });
      }

      onUpdate({ generatedContent: newContent, imageItems });
    },
    [onUpdate, resourceCharacterIds],
  );

  const updateField = (field: string, value: unknown) => {
    const newContent = { ...content, [field]: value };
    // Rebuild imageItems when backgrounds/icons/cardBack/characterPlacement change
    if (
      field === "backgrounds" ||
      field === "icons" ||
      field === "cardBack" ||
      field === "characterPlacement"
    ) {
      updateContent(newContent);
    } else {
      onUpdate({ generatedContent: newContent });
    }
  };

  // --- Background helpers ---
  const updateBackground = (
    index: number,
    field: keyof CardGameBackground,
    value: string,
  ) => {
    const updated = [...backgrounds];
    updated[index] = { ...updated[index], [field]: value };
    updateField("backgrounds", updated);
  };

  const addBackground = () => {
    const id = makeId();
    const newBg: CardGameBackground = {
      id,
      label: "",
      color: "#888888",
      imagePrompt: "",
      imageAssetKey: `card_bg:${id}`,
    };
    updateField("backgrounds", [...backgrounds, newBg]);
  };

  const removeBackground = (index: number) => {
    updateField(
      "backgrounds",
      backgrounds.filter((_, i) => i !== index),
    );
  };

  // --- Icon helpers ---
  const updateIcon = (
    index: number,
    field: keyof CardGameIcon,
    value: string,
  ) => {
    const updated = [...icons];
    updated[index] = { ...updated[index], [field]: value };
    updateField("icons", updated);
  };

  const addIcon = () => {
    const id = makeId();
    const newIcon: CardGameIcon = {
      id,
      label: "",
      imagePrompt: "",
      imageAssetKey: `card_icon:${id}`,
    };
    updateField("icons", [...icons, newIcon]);
  };

  const removeIcon = (index: number) => {
    updateField(
      "icons",
      icons.filter((_, i) => i !== index),
    );
  };

  // --- Card back helpers ---
  const toggleCardBack = () => {
    if (cardBack) {
      updateField("cardBack", undefined);
    } else {
      updateField("cardBack", {
        imagePrompt: "Decorative card back with a repeating pattern",
        imageAssetKey: "card_back",
      });
    }
  };

  // --- Text settings helpers ---
  const updateTextSetting = (
    field: keyof CardGameTextSettings,
    value: string | number,
  ) => {
    updateField("textSettings", { ...textSettings, [field]: value });
  };

  // --- Card helpers ---
  const updateCard = (
    index: number,
    updates: Partial<CardGameCardEntry>,
  ) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ generatedContent: { ...content, cards: updated } });
  };

  const addCard = () => {
    const newCard: CardGameCardEntry = {
      id: makeId(),
      title: "",
      count: 1,
      backgroundId: backgrounds[0]?.id || "",
      primaryText: { content: "" },
    };
    onUpdate({
      generatedContent: { ...content, cards: [...cards, newCard] },
    });
  };

  const removeCard = (index: number) => {
    onUpdate({
      generatedContent: {
        ...content,
        cards: cards.filter((_, i) => i !== index),
      },
    });
  };

  // Summary
  const totalCards = cards.reduce((sum, c) => sum + c.count, 0);
  const assetsToGenerate =
    backgrounds.length + icons.length + (cardBack ? 1 : 0);

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Review and edit the AI-generated card game. Cards are composed from
        backgrounds + icons + text overlays — only {assetsToGenerate} image
        {assetsToGenerate !== 1 ? "s" : ""} to generate for {totalCards} total
        cards.
      </p>

      {/* Game Info */}
      <section className="space-y-4">
        <SectionHeader title="Game Info" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="review-name" className="font-medium">
              Game Name
            </Label>
            <Input
              id="review-name"
              value={state.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              maxLength={100}
              placeholder="Game name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-deck" className="font-medium">
              Deck Name
            </Label>
            <Input
              id="review-deck"
              value={deckName}
              onChange={(e) =>
                onUpdate({
                  generatedContent: { ...content, deckName: e.target.value },
                })
              }
              maxLength={100}
              placeholder="Deck name"
            />
          </div>
        </div>
        <div className="space-y-2 max-w-xl">
          <Label htmlFor="review-rules" className="font-medium">
            Rules
          </Label>
          <Textarea
            id="review-rules"
            value={rules}
            onChange={(e) =>
              onUpdate({
                generatedContent: { ...content, rules: e.target.value },
              })
            }
            placeholder="Game rules"
            rows={3}
          />
        </div>
      </section>

      {/* Generation Settings */}
      <section className="space-y-4">
        <SectionHeader title="Generation Settings" />
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {resourceCharacterIds && (
              <div className="space-y-1">
                <Label htmlFor="char-placement" className="text-xs">
                  Character appears in
                </Label>
                <Select
                  value={characterPlacement}
                  onValueChange={(v) =>
                    updateField(
                      "characterPlacement",
                      v as CharacterPlacement,
                    )
                  }
                >
                  <SelectTrigger id="char-placement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backgrounds">
                      Backgrounds only
                    </SelectItem>
                    <SelectItem value="icons">Icons only</SelectItem>
                    <SelectItem value="both">
                      Backgrounds & Icons
                    </SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="show-text" className="text-xs">
                Show text on cards
              </Label>
              <Select
                value={showTextMode}
                onValueChange={(v) =>
                  updateField("showText", v as ShowTextMode)
                }
              >
                <SelectTrigger id="show-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numbers_only">Numbers only</SelectItem>
                  <SelectItem value="all">All text</SelectItem>
                  <SelectItem value="none">No text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Backgrounds */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title={`Backgrounds (${backgrounds.length})`} />
          <Button
            variant="outline"
            size="sm"
            onClick={addBackground}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Background
          </Button>
        </div>
        <div className="space-y-3">
          {backgrounds.map((bg, index) => (
            <div
              key={bg.id}
              className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="size-5 rounded border border-border/60"
                    style={{ backgroundColor: bg.color }}
                  />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {bg.label || `Background ${index + 1}`}
                  </span>
                </div>
                {backgrounds.length > 1 && (
                  <DeleteButton
                    onClick={() => removeBackground(index)}
                    label={`Remove background ${index + 1}`}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`bg-${index}-label`} className="text-xs">
                    Label
                  </Label>
                  <Input
                    id={`bg-${index}-label`}
                    value={bg.label}
                    onChange={(e) =>
                      updateBackground(index, "label", e.target.value)
                    }
                    placeholder="e.g., Red"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`bg-${index}-color`} className="text-xs">
                    Color
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id={`bg-${index}-color`}
                      value={bg.color}
                      onChange={(e) =>
                        updateBackground(index, "color", e.target.value)
                      }
                      className="size-9 rounded border border-border/60 cursor-pointer"
                    />
                    <Input
                      value={bg.color}
                      onChange={(e) =>
                        updateBackground(index, "color", e.target.value)
                      }
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`bg-${index}-prompt`} className="text-xs">
                  Image Prompt
                </Label>
                <Textarea
                  id={`bg-${index}-prompt`}
                  value={bg.imagePrompt}
                  onChange={(e) =>
                    updateBackground(index, "imagePrompt", e.target.value)
                  }
                  placeholder="Describe the card background"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Icons */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title={`Icons (${icons.length})`} />
          <Button
            variant="outline"
            size="sm"
            onClick={addIcon}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Icon
          </Button>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Icons are generated on a green screen and made transparent
          automatically.
        </p>
        <div className="space-y-3">
          {icons.map((icon, index) => (
            <div
              key={icon.id}
              className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {icon.label || `Icon ${index + 1}`}
                </span>
                <DeleteButton
                  onClick={() => removeIcon(index)}
                  label={`Remove icon ${index + 1}`}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`icon-${index}-label`} className="text-xs">
                  Label
                </Label>
                <Input
                  id={`icon-${index}-label`}
                  value={icon.label}
                  onChange={(e) =>
                    updateIcon(index, "label", e.target.value)
                  }
                  placeholder="e.g., Skip"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`icon-${index}-prompt`} className="text-xs">
                  Image Prompt
                </Label>
                <Textarea
                  id={`icon-${index}-prompt`}
                  value={icon.imagePrompt}
                  onChange={(e) =>
                    updateIcon(index, "imagePrompt", e.target.value)
                  }
                  placeholder="Describe the icon (no background needed)"
                  rows={2}
                />
              </div>
            </div>
          ))}
          {icons.length === 0 && (
            <p className="text-sm text-muted-foreground/60 italic">
              No icons — cards will use text only over backgrounds.
            </p>
          )}
        </div>
      </section>

      {/* Card Back */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Card Back" />
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCardBack}
            className="gap-1.5"
          >
            {cardBack ? "Remove" : "Add Card Back"}
          </Button>
        </div>
        {cardBack && (
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="card-back-prompt" className="text-xs">
                Image Prompt
              </Label>
              <Textarea
                id="card-back-prompt"
                value={cardBack.imagePrompt}
                onChange={(e) =>
                  updateField("cardBack", {
                    ...cardBack,
                    imagePrompt: e.target.value,
                  })
                }
                placeholder="Describe the card back design"
                rows={2}
              />
            </div>
          </div>
        )}
      </section>

      {/* Text Settings */}
      <section className="space-y-4">
        <SectionHeader title="Text Settings" />
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="ts-font" className="text-xs">
                Font
              </Label>
              <Select
                value={textSettings.fontFamily}
                onValueChange={(v) => updateTextSetting("fontFamily", v)}
              >
                <SelectTrigger id="ts-font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FONTS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ts-size" className="text-xs">
                Font Size
              </Label>
              <Input
                id="ts-size"
                type="number"
                min={12}
                max={120}
                value={textSettings.defaultFontSize}
                onChange={(e) =>
                  updateTextSetting(
                    "defaultFontSize",
                    parseInt(e.target.value) || 48,
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ts-color" className="text-xs">
                Text Color
              </Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="ts-color"
                  value={textSettings.defaultColor}
                  onChange={(e) =>
                    updateTextSetting("defaultColor", e.target.value)
                  }
                  className="size-9 rounded border border-border/60 cursor-pointer"
                />
                <Input
                  value={textSettings.defaultColor}
                  onChange={(e) =>
                    updateTextSetting("defaultColor", e.target.value)
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ts-outline-w" className="text-xs">
                Outline Width
              </Label>
              <Input
                id="ts-outline-w"
                type="number"
                min={0}
                max={10}
                value={textSettings.defaultOutlineWidth}
                onChange={(e) =>
                  updateTextSetting(
                    "defaultOutlineWidth",
                    parseInt(e.target.value) || 0,
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ts-outline-c" className="text-xs">
                Outline Color
              </Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="ts-outline-c"
                  value={textSettings.defaultOutlineColor}
                  onChange={(e) =>
                    updateTextSetting("defaultOutlineColor", e.target.value)
                  }
                  className="size-9 rounded border border-border/60 cursor-pointer"
                />
                <Input
                  value={textSettings.defaultOutlineColor}
                  onChange={(e) =>
                    updateTextSetting("defaultOutlineColor", e.target.value)
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Default Position</Label>
            <PositionSelector
              hAlign={textSettings.defaultHAlign}
              vAlign={textSettings.defaultVAlign}
              onChange={(h, v) => {
                updateField("textSettings", {
                  ...textSettings,
                  defaultHAlign: h,
                  defaultVAlign: v,
                });
              }}
            />
          </div>
        </div>
      </section>

      {/* Card Types */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title={`Card Types (${cards.length} types, ${totalCards} total)`}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addCard}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Card
          </Button>
        </div>
        <div className="space-y-2">
          {cards.map((card, index) => (
            <CardRow
              key={card.id}
              card={card}
              index={index}
              backgrounds={backgrounds}
              icons={icons}
              onUpdate={(updates) => updateCard(index, updates)}
              onRemove={() => removeCard(index)}
              canRemove={cards.length > 1}
            />
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Total Cards</dt>
            <dd className="font-medium text-lg tabular-nums">{totalCards}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Unique Types</dt>
            <dd className="font-medium text-lg tabular-nums">
              {cards.length}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Assets to Generate</dt>
            <dd className="font-medium text-lg tabular-nums">
              {assetsToGenerate}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

// --- Sub-components ---

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      {title}
    </h3>
  );
}

function DeleteButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      aria-label={label}
    >
      <Trash2 className="size-3.5" aria-hidden="true" />
    </button>
  );
}

function PositionSelector({
  hAlign,
  vAlign,
  onChange,
}: {
  hAlign: CardTextHAlign;
  vAlign: CardTextVAlign;
  onChange: (h: CardTextHAlign, v: CardTextVAlign) => void;
}) {
  const hOptions: CardTextHAlign[] = ["left", "center", "right"];
  const vOptions: CardTextVAlign[] = ["top", "center", "bottom"];

  return (
    <div className="inline-grid grid-cols-3 gap-0.5 rounded-lg border border-border/60 p-0.5">
      {vOptions.map((v) =>
        hOptions.map((h) => {
          const active = h === hAlign && v === vAlign;
          return (
            <button
              key={`${v}-${h}`}
              type="button"
              onClick={() => onChange(h, v)}
              className={`size-7 rounded cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-1 ${
                active
                  ? "bg-coral text-white"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
              aria-label={`${v} ${h}`}
              aria-pressed={active}
            >
              <span className="sr-only">
                {v} {h}
              </span>
              <div
                className={`size-2 rounded-full mx-auto ${
                  active ? "bg-white" : "bg-foreground/40"
                }`}
              />
            </button>
          );
        }),
      )}
    </div>
  );
}

function CardRow({
  card,
  index,
  backgrounds,
  icons,
  onUpdate,
  onRemove,
  canRemove,
}: {
  card: CardGameCardEntry;
  index: number;
  backgrounds: CardGameBackground[];
  icons: CardGameIcon[];
  onUpdate: (updates: Partial<CardGameCardEntry>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      {/* Compact row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors duration-150 motion-reduce:transition-none"
          aria-expanded={expanded}
          aria-label={`Expand card ${index + 1}`}
        >
          {expanded ? (
            <ChevronDown className="size-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4" aria-hidden="true" />
          )}
        </button>

        <Input
          value={card.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Card title"
          className="h-8 text-sm flex-1 min-w-0"
          aria-label={`Card ${index + 1} title`}
        />

        <Input
          value={card.primaryText.content}
          onChange={(e) =>
            onUpdate({
              primaryText: { ...card.primaryText, content: e.target.value },
            })
          }
          placeholder="Text"
          className="h-8 text-sm w-20"
          aria-label={`Card ${index + 1} text`}
        />

        <Select
          value={card.backgroundId}
          onValueChange={(v) => onUpdate({ backgroundId: v })}
        >
          <SelectTrigger className="h-8 w-28 text-xs" aria-label={`Card ${index + 1} background`}>
            <SelectValue placeholder="Background" />
          </SelectTrigger>
          <SelectContent>
            {backgrounds.map((bg) => (
              <SelectItem key={bg.id} value={bg.id}>
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-3 rounded-sm border border-border/60 shrink-0"
                    style={{ backgroundColor: bg.color }}
                  />
                  {bg.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={card.iconId || "__none__"}
          onValueChange={(v) =>
            onUpdate({ iconId: v === "__none__" ? undefined : v })
          }
        >
          <SelectTrigger className="h-8 w-28 text-xs" aria-label={`Card ${index + 1} icon`}>
            <SelectValue placeholder="No icon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {icons.map((icon) => (
              <SelectItem key={icon.id} value={icon.id}>
                {icon.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={1}
          max={20}
          value={card.count}
          onChange={(e) =>
            onUpdate({ count: parseInt(e.target.value) || 1 })
          }
          className="h-8 text-sm w-16 text-center tabular-nums"
          aria-label={`Card ${index + 1} count`}
        />

        {canRemove && (
          <DeleteButton
            onClick={onRemove}
            label={`Remove card type ${index + 1}`}
          />
        )}
      </div>

      {/* Expanded: per-card text overrides */}
      {expanded && (
        <div className="border-t border-border/40 px-4 py-3 bg-muted/20 space-y-3">
          <p className="text-xs text-muted-foreground">
            Per-card text overrides (leave blank to use global defaults)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Font Size</Label>
              <Input
                type="number"
                min={12}
                max={120}
                value={card.primaryText.fontSize ?? ""}
                onChange={(e) =>
                  onUpdate({
                    primaryText: {
                      ...card.primaryText,
                      fontSize: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    },
                  })
                }
                placeholder="Default"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Color</Label>
              <Input
                value={card.primaryText.color ?? ""}
                onChange={(e) =>
                  onUpdate({
                    primaryText: {
                      ...card.primaryText,
                      color: e.target.value || undefined,
                    },
                  })
                }
                placeholder="Default"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">H Align</Label>
              <Select
                value={card.primaryText.hAlign || ""}
                onValueChange={(v) =>
                  onUpdate({
                    primaryText: {
                      ...card.primaryText,
                      hAlign: (v || undefined) as CardTextHAlign | undefined,
                    },
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">V Align</Label>
              <Select
                value={card.primaryText.vAlign || ""}
                onValueChange={(v) =>
                  onUpdate({
                    primaryText: {
                      ...card.primaryText,
                      vAlign: (v || undefined) as CardTextVAlign | undefined,
                    },
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Icon scale */}
          {card.iconId && (
            <div className="space-y-1 max-w-xs">
              <Label className="text-xs">Icon Scale (0.1–1.0)</Label>
              <Input
                type="number"
                min={0.1}
                max={1.0}
                step={0.1}
                value={card.iconScale ?? 0.4}
                onChange={(e) =>
                  onUpdate({
                    iconScale: parseFloat(e.target.value) || 0.4,
                  })
                }
                className="h-8 text-xs"
              />
            </div>
          )}

          {/* Secondary text */}
          <div className="space-y-1">
            <Label className="text-xs">Secondary Text (optional)</Label>
            <Input
              value={card.secondaryText?.content ?? ""}
              onChange={(e) =>
                onUpdate({
                  secondaryText: e.target.value
                    ? {
                        ...(card.secondaryText || {}),
                        content: e.target.value,
                      }
                    : undefined,
                })
              }
              placeholder="e.g., 'Next player draws 2 cards'"
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
