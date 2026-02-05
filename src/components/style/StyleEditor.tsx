"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPaletteEditor } from "./ColorPaletteEditor";

// Font options - common web-safe and Google Fonts
const HEADING_FONTS = [
  "Nunito",
  "Quicksand",
  "Poppins",
  "Merriweather",
  "Baloo 2",
  "Fredoka One",
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
  onChange,
  disabled,
  autoSaveDelay = 500,
}: StyleEditorProps) {
  // Local state for debounced updates
  const [localName, setLocalName] = useState(name);
  const [localIllustrationStyle, setLocalIllustrationStyle] = useState(illustrationStyle);

  // Sync with external values
  useEffect(() => {
    setLocalName(name);
  }, [name]);

  useEffect(() => {
    setLocalIllustrationStyle(illustrationStyle);
  }, [illustrationStyle]);

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
