"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPaletteEditor } from "./ColorPaletteEditor";
import { useGoogleFonts } from "@/lib/fonts";
import type { CardLayoutSettings } from "@/types";

// Font options - common web-safe and Google Fonts
const HEADING_FONTS = [
  "Nunito",
  "Quicksand",
  "Poppins",
  "Merriweather",
  "Baloo 2",
  "Fredoka",
  "Comfortaa",
  "Pacifico",
];

const BODY_FONTS = [
  "Open Sans",
  "Lato",
  "Inter",
  "Source Sans Pro",
  "Rubik",
  "Roboto",
  "Nunito Sans",
  "Work Sans",
];

interface StyleEditorProps {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  illustrationStyle: string;
  cardLayout?: CardLayoutSettings;
  onChange: (updates: {
    name?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography?: {
      headingFont: string;
      bodyFont: string;
    };
    illustrationStyle?: string;
    cardLayout?: CardLayoutSettings;
  }) => void;
  disabled?: boolean;
  /** Auto-save delay in ms (0 to disable) */
  autoSaveDelay?: number;
}

export function StyleEditor({
  name,
  colors,
  typography,
  illustrationStyle,
  cardLayout,
  onChange,
  disabled,
  autoSaveDelay = 500,
}: StyleEditorProps) {
  // Local state for debounced updates
  const [localName, setLocalName] = useState(name);
  const [localIllustrationStyle, setLocalIllustrationStyle] = useState(illustrationStyle);
  const [localCardLayout, setLocalCardLayout] = useState<CardLayoutSettings>({
    textPosition: cardLayout?.textPosition ?? "bottom",
    contentHeight: cardLayout?.contentHeight ?? 25,
    imageOverlap: cardLayout?.imageOverlap ?? 11,
  });

  // Load Google Fonts for previews
  const allFonts = [...HEADING_FONTS, ...BODY_FONTS];
  useGoogleFonts(allFonts);

  // Sync with external values
  useEffect(() => {
    setLocalName(name);
  }, [name]);

  useEffect(() => {
    setLocalIllustrationStyle(illustrationStyle);
  }, [illustrationStyle]);

  useEffect(() => {
    setLocalCardLayout({
      textPosition: cardLayout?.textPosition ?? "bottom",
      contentHeight: cardLayout?.contentHeight ?? 25,
      imageOverlap: cardLayout?.imageOverlap ?? 11,
    });
  }, [cardLayout]);

  // Debounced name update
  useEffect(() => {
    if (localName === name || autoSaveDelay === 0) return;

    const timeout = setTimeout(() => {
      onChange({ name: localName });
    }, autoSaveDelay);

    return () => clearTimeout(timeout);
  }, [localName, name, onChange, autoSaveDelay]);

  // Debounced illustration style update
  useEffect(() => {
    if (localIllustrationStyle === illustrationStyle || autoSaveDelay === 0) return;

    const timeout = setTimeout(() => {
      onChange({ illustrationStyle: localIllustrationStyle });
    }, autoSaveDelay);

    return () => clearTimeout(timeout);
  }, [localIllustrationStyle, illustrationStyle, onChange, autoSaveDelay]);

  // Debounced card layout update
  useEffect(() => {
    const hasChanged =
      localCardLayout.textPosition !== (cardLayout?.textPosition ?? "bottom") ||
      localCardLayout.contentHeight !== (cardLayout?.contentHeight ?? 25) ||
      localCardLayout.imageOverlap !== (cardLayout?.imageOverlap ?? 11);

    if (!hasChanged || autoSaveDelay === 0) return;

    const timeout = setTimeout(() => {
      onChange({ cardLayout: localCardLayout });
    }, autoSaveDelay);

    return () => clearTimeout(timeout);
  }, [localCardLayout, cardLayout, onChange, autoSaveDelay]);

  const handleColorsChange = useCallback(
    (newColors: typeof colors) => {
      onChange({ colors: newColors });
    },
    [onChange]
  );

  const handleTypographyChange = useCallback(
    (key: "headingFont" | "bodyFont", value: string) => {
      onChange({
        typography: {
          ...typography,
          [key]: value,
        },
      });
    },
    [onChange, typography]
  );

  return (
    <div className="space-y-8">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="style-name" className="text-sm font-medium">
          Style Name
        </Label>
        <Input
          id="style-name"
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          disabled={disabled}
          placeholder="My Custom Style"
          className="max-w-md"
        />
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Color Palette</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define the colors used in your illustrations and cards
          </p>
        </div>
        <ColorPaletteEditor
          colors={colors}
          onChange={handleColorsChange}
          disabled={disabled}
        />
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Typography</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose fonts for headings and body text on cards
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="heading-font" className="text-sm">
              Heading Font
            </Label>
            <Select
              value={typography.headingFont}
              onValueChange={(value) => handleTypographyChange("headingFont", value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {HEADING_FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: `"${font}", sans-serif` }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div
              className="pt-2 pb-3 px-3 bg-muted/30 rounded-md"
            >
              <p
                className="text-xl font-medium"
                style={{ fontFamily: `"${typography.headingFont}", sans-serif` }}
              >
                The quick brown fox
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="body-font" className="text-sm">
              Body Font
            </Label>
            <Select
              value={typography.bodyFont}
              onValueChange={(value) => handleTypographyChange("bodyFont", value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {BODY_FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: `"${font}", sans-serif` }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div
              className="pt-2 pb-3 px-3 bg-muted/30 rounded-md"
            >
              <p
                className="text-sm text-muted-foreground"
                style={{ fontFamily: `"${typography.bodyFont}", sans-serif` }}
              >
                Jumps over the lazy dog
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Layout */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Card Layout</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Control how text is positioned on your cards
          </p>
        </div>

        <div className="space-y-6">
          {/* Text Position */}
          <div className="space-y-2">
            <Label className="text-sm">Text Position</Label>
            <Select
              value={localCardLayout.textPosition}
              onValueChange={(value: "bottom" | "overlay" | "integrated") =>
                setLocalCardLayout((prev) => ({ ...prev, textPosition: value }))
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom">
                  <span className="flex flex-col items-start">
                    <span>Bottom area</span>
                    <span className="text-xs text-muted-foreground">Text in dedicated space below image</span>
                  </span>
                </SelectItem>
                <SelectItem value="overlay">
                  <span className="flex flex-col items-start">
                    <span>Overlay</span>
                    <span className="text-xs text-muted-foreground">Text overlaps the image</span>
                  </span>
                </SelectItem>
                <SelectItem value="integrated">
                  <span className="flex flex-col items-start">
                    <span>Integrated</span>
                    <span className="text-xs text-muted-foreground">Text included in generated image</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Height - only show if not integrated */}
          {localCardLayout.textPosition !== "integrated" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Text Area Height</Label>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {localCardLayout.contentHeight}%
                </span>
              </div>
              <Slider
                value={[localCardLayout.contentHeight ?? 25]}
                onValueChange={([value]) =>
                  setLocalCardLayout((prev) => ({ ...prev, contentHeight: value }))
                }
                min={10}
                max={40}
                step={1}
                disabled={disabled}
                className="w-full max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of card height for the text area
              </p>
            </div>
          )}

          {/* Image Overlap - only show if not integrated */}
          {localCardLayout.textPosition !== "integrated" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Image Overlap</Label>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {localCardLayout.imageOverlap}%
                </span>
              </div>
              <Slider
                value={[localCardLayout.imageOverlap ?? 11]}
                onValueChange={([value]) =>
                  setLocalCardLayout((prev) => ({ ...prev, imageOverlap: value }))
                }
                min={0}
                max={20}
                step={1}
                disabled={disabled}
                className="w-full max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                How much the text area overlaps the image
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Illustration Style */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Illustration Style</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Describe how AI-generated illustrations should look
          </p>
        </div>
        <Textarea
          value={localIllustrationStyle}
          onChange={(e) => setLocalIllustrationStyle(e.target.value)}
          disabled={disabled}
          placeholder="Describe the visual style: shapes, colors, mood, artistic influences..."
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Include details about shapes (rounded, geometric), mood (playful, calm),
          artistic style (cartoon, watercolor), and any specific elements to include or avoid.
        </p>
      </div>
    </div>
  );
}
