"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorPaletteEditorProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  onChange: (colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }) => void;
  disabled?: boolean;
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function ColorInput({ label, value, onChange, disabled }: ColorInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (!/^#[0-9A-Fa-f]{6}$/.test(localValue)) {
      setLocalValue(value);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex flex-col gap-1.5">
        {/* Large color swatch */}
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          disabled={disabled}
          className="w-full h-12 rounded-md border border-border/50 cursor-pointer
            hover:border-coral/50 hover:scale-[1.02]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2
            transition-all duration-150 motion-reduce:transition-none motion-reduce:hover:scale-100
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ backgroundColor: localValue }}
          aria-label={`Pick ${label.toLowerCase()} color`}
        >
          <input
            ref={colorInputRef}
            type="color"
            value={localValue}
            onChange={handleColorChange}
            disabled={disabled}
            className="sr-only"
            tabIndex={-1}
          />
        </button>

        {/* Hex value - click to edit */}
        {isEditing ? (
          <Input
            type="text"
            value={localValue.toUpperCase()}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            disabled={disabled}
            className="h-7 text-xs font-mono uppercase text-center px-1"
            maxLength={7}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => !disabled && setIsEditing(true)}
            disabled={disabled}
            className="h-7 text-xs font-mono text-muted-foreground uppercase text-center cursor-pointer
              hover:text-foreground transition-colors duration-150 motion-reduce:transition-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-1 rounded
              disabled:cursor-not-allowed"
          >
            {localValue.toUpperCase()}
          </button>
        )}
      </div>
    </div>
  );
}

export function ColorPaletteEditor({ colors, onChange, disabled }: ColorPaletteEditorProps) {
  const updateColor = (key: keyof typeof colors, value: string) => {
    onChange({
      ...colors,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Live preview FIRST - the star of the show */}
      <div
        className="relative h-32 sm:h-40 overflow-hidden rounded-lg"
        style={{ backgroundColor: colors.background }}
      >
        {/* Organic blob shapes */}
        <div
          className="absolute -bottom-10 -left-10 w-36 h-36 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] transition-colors duration-200"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="absolute -top-6 -right-6 w-28 h-28 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] opacity-85 transition-colors duration-200"
          style={{ backgroundColor: colors.secondary }}
        />
        <div
          className="absolute bottom-6 right-6 w-12 h-12 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] transition-colors duration-200"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-medium transition-colors duration-200"
          style={{ color: colors.text }}
        >
          Happy
        </div>
      </div>

      {/* Color inputs in a more interesting layout */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <ColorInput
          label="Primary"
          value={colors.primary}
          onChange={(v) => updateColor("primary", v)}
          disabled={disabled}
        />
        <ColorInput
          label="Secondary"
          value={colors.secondary}
          onChange={(v) => updateColor("secondary", v)}
          disabled={disabled}
        />
        <ColorInput
          label="Accent"
          value={colors.accent}
          onChange={(v) => updateColor("accent", v)}
          disabled={disabled}
        />
        <ColorInput
          label="Background"
          value={colors.background}
          onChange={(v) => updateColor("background", v)}
          disabled={disabled}
        />
        <ColorInput
          label="Text"
          value={colors.text}
          onChange={(v) => updateColor("text", v)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
