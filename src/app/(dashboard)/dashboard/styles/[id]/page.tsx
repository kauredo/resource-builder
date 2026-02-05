"use client";

import { useState, useCallback, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { FrameGenerator } from "@/components/style/FrameGenerator";
import { useGoogleFonts } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Lock,
  Copy,
  Trash2,
  Loader2,
  Check,
  Plus,
  ChevronDown,
  Palette,
  Type,
  Sparkles,
} from "lucide-react";
import type { StyleFrames } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Font options
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

export default function StyleDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [framesExpanded, setFramesExpanded] = useState(false);

  // Local state for debounced fields
  const [localName, setLocalName] = useState<string | null>(null);
  const [localIllustrationStyle, setLocalIllustrationStyle] = useState<
    string | null
  >(null);

  const styleId = resolvedParams.id as Id<"styles">;
  const style = useQuery(api.styles.getStyleWithFrameUrls, { styleId });
  const updateStyle = useMutation(api.styles.updateStyle);
  const duplicateStyle = useMutation(api.styles.duplicateStyle);
  const deleteStyle = useMutation(api.styles.deleteStyle);

  // Load all fonts for previews
  useGoogleFonts([...HEADING_FONTS, ...BODY_FONTS]);

  // Derived values
  const displayName = localName ?? style?.name ?? "";
  const displayIllustrationStyle =
    localIllustrationStyle ?? style?.illustrationStyle ?? "";

  const handleStyleChange = useCallback(
    async (updates: {
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
    }) => {
      if (!style || style.isPreset) return;

      setSaveStatus("saving");
      try {
        await updateStyle({
          styleId,
          ...updates,
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to update style:", error);
        setSaveStatus("idle");
      }
    },
    [style, styleId, updateStyle]
  );

  // Debounced name change
  const handleNameChange = useCallback(
    (value: string) => {
      setLocalName(value);
      const timeout = setTimeout(() => {
        handleStyleChange({ name: value });
      }, 500);
      return () => clearTimeout(timeout);
    },
    [handleStyleChange]
  );

  // Debounced illustration style change
  const handleIllustrationStyleChange = useCallback(
    (value: string) => {
      setLocalIllustrationStyle(value);
      const timeout = setTimeout(() => {
        handleStyleChange({ illustrationStyle: value });
      }, 500);
      return () => clearTimeout(timeout);
    },
    [handleStyleChange]
  );

  const handleDuplicate = async () => {
    if (!style) return;

    setIsDuplicating(true);
    try {
      const newName = duplicateName.trim() || `${style.name} (Copy)`;
      const newStyleId = await duplicateStyle({
        styleId,
        newName,
      });
      router.push(`/dashboard/styles/${newStyleId}`);
    } catch (error) {
      console.error("Failed to duplicate style:", error);
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!style || style.isPreset) return;

    setIsDeleting(true);
    try {
      await deleteStyle({ styleId });
      router.push("/dashboard/styles");
    } catch (error) {
      console.error("Failed to delete style:", error);
      setIsDeleting(false);
    }
  };

  const openDuplicateDialog = () => {
    if (style) {
      setDuplicateName(`${style.name} (Copy)`);
      setShowDuplicateDialog(true);
    }
  };

  // Loading state
  if (style === undefined) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="status"
        aria-label="Loading style"
      >
        <div className="h-4 w-16 bg-muted rounded animate-pulse mb-6" />
        <div className="h-12 w-72 bg-muted rounded animate-pulse mb-8" />
        <div className="h-64 bg-muted rounded-xl animate-pulse mb-8" />
        <div className="space-y-6">
          <div className="h-24 bg-muted rounded-lg animate-pulse" />
          <div className="h-20 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Not found state
  if (style === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h1 className="font-serif text-2xl font-medium mb-2">
            Style not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This style may have been deleted or doesn&apos;t exist.
          </p>
          <Button asChild className="btn-coral">
            <Link href="/dashboard/styles">Back to Styles</Link>
          </Button>
        </div>
      </div>
    );
  }

  const colors = style.colors;
  const typography = style.typography;
  const frameCount = [
    style.frames?.border,
    style.frames?.textBacking,
    style.frames?.fullCard,
  ].filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/dashboard/styles"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Styles
      </Link>

      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {style.isPreset ? (
              <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
                {style.name}
              </h1>
            ) : (
              <Input
                type="text"
                value={displayName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="font-serif text-3xl sm:text-4xl font-medium tracking-tight border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent max-w-md"
                placeholder="Style name"
              />
            )}
            {style.isPreset && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                <Lock className="size-3" aria-hidden="true" />
                Preset
              </span>
            )}
          </div>
          {saveStatus !== "idle" && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              {saveStatus === "saving" && (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
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

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={openDuplicateDialog}
            className="gap-1.5"
          >
            <Copy className="size-3.5" aria-hidden="true" />
            {style.isPreset ? "Customize" : "Duplicate"}
          </Button>
          <Button asChild size="sm" className="btn-coral gap-1.5">
            <Link
              href={`/dashboard/resources/new/emotion-cards?styleId=${styleId}`}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Use Style
            </Link>
          </Button>
          {!style.isPreset && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this style?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &ldquo;{style.name}&rdquo; and
                    all its frame assets.
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
          )}
        </div>
      </div>

      {/* Preset notice */}
      {style.isPreset && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50 mb-8">
          <Lock
            className="size-4 text-muted-foreground mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              This is a preset style
            </p>
            <p className="text-muted-foreground mt-0.5">
              Click &ldquo;Customize&rdquo; to create an editable copy with your
              own colors and fonts.
            </p>
          </div>
        </div>
      )}

      {/* Live Preview - Hero position */}
      <section className="mb-10">
        <StylePreview
          colors={colors}
          typography={typography}
          frameUrls={style.frameUrls}
        />
      </section>

      {/* Style Properties */}
      <div className="space-y-8">
        {/* Color Palette */}
        <section className="p-5 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-medium text-foreground">
              Color Palette
            </h2>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {(
              [
                ["primary", "Primary"],
                ["secondary", "Secondary"],
                ["accent", "Accent"],
                ["background", "Background"],
                ["text", "Text"],
              ] as const
            ).map(([key, label]) => (
              <ColorSwatch
                key={key}
                label={label}
                value={colors[key]}
                onChange={(value) =>
                  handleStyleChange({ colors: { ...colors, [key]: value } })
                }
                disabled={style.isPreset}
              />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="p-5 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Type className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-medium text-foreground">Typography</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="heading-font"
                className="text-xs text-muted-foreground"
              >
                Heading Font
              </Label>
              <Select
                value={typography.headingFont}
                onValueChange={(value) =>
                  handleStyleChange({
                    typography: { ...typography, headingFont: value },
                  })
                }
                disabled={style.isPreset}
              >
                <SelectTrigger id="heading-font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEADING_FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: `"${font}", sans-serif` }}>
                        {font}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="body-font"
                className="text-xs text-muted-foreground"
              >
                Body Font
              </Label>
              <Select
                value={typography.bodyFont}
                onValueChange={(value) =>
                  handleStyleChange({
                    typography: { ...typography, bodyFont: value },
                  })
                }
                disabled={style.isPreset}
              >
                <SelectTrigger id="body-font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BODY_FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: `"${font}", sans-serif` }}>
                        {font}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Illustration Style */}
        <section className="p-5 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-sm font-medium text-foreground">
              Illustration Style
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3 ml-6">
            Describe how AI-generated illustrations should look
          </p>
          <Textarea
            value={displayIllustrationStyle}
            onChange={(e) => handleIllustrationStyleChange(e.target.value)}
            disabled={style.isPreset}
            placeholder="Describe the visual style..."
            rows={3}
            className="resize-none text-sm"
          />
        </section>

        {/* Frame Assets - Collapsible, only for custom styles */}
        {!style.isPreset && (
          <section className="border border-border/50 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setFramesExpanded(!framesExpanded)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-inset"
            >
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  Frame Assets
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {frameCount > 0
                    ? `${frameCount} frame${frameCount !== 1 ? "s" : ""} generated`
                    : "Decorative frames for your cards"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  framesExpanded && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
            {framesExpanded && (
              <div className="px-5 pb-5 border-t border-border/50">
                <div className="pt-5">
                  <FrameGenerator
                    styleId={styleId}
                    style={{
                      colors: style.colors,
                      illustrationStyle: style.illustrationStyle,
                    }}
                    frames={style.frames as StyleFrames | undefined}
                    frameUrls={style.frameUrls}
                  />
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Duplicate Dialog */}
      <AlertDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {style.isPreset
                ? "Customize this preset"
                : "Duplicate this style"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {style.isPreset
                ? "Create an editable copy with your own name."
                : "Create a copy you can modify independently."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="New style name"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicate}
              disabled={isDuplicating || !duplicateName.trim()}
              className="btn-coral"
            >
              {isDuplicating && (
                <Loader2
                  className="size-4 animate-spin mr-2"
                  aria-hidden="true"
                />
              )}
              {style.isPreset ? "Create" : "Duplicate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Compact color swatch component
function ColorSwatch({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          const input = document.createElement("input");
          input.type = "color";
          input.value = value;
          input.onchange = (e) =>
            onChange((e.target as HTMLInputElement).value);
          input.click();
        }}
        disabled={disabled}
        className="w-full aspect-square rounded-lg border border-border/50 cursor-pointer hover:scale-105 hover:border-coral/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{ backgroundColor: value }}
        aria-label={`Change ${label.toLowerCase()} color`}
      />
      <div className="text-center">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-[10px] font-mono text-muted-foreground/70 uppercase">
          {value}
        </div>
      </div>
    </div>
  );
}

// Style preview component - shows card preview with frame toggles
function StylePreview({
  colors,
  typography,
  frameUrls,
}: {
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
  frameUrls?: {
    border?: string | null;
    textBacking?: string | null;
    fullCard?: string | null;
  };
}) {
  const [showText, setShowText] = useState(true);
  const [useBorder, setUseBorder] = useState(false);
  const [useTextBacking, setUseTextBacking] = useState(false);
  const [useFullCard, setUseFullCard] = useState(false);

  // Determine what to show
  const showBorder = useBorder && frameUrls?.border && !useFullCard;
  const showTextBacking =
    useTextBacking && frameUrls?.textBacking && showText && !useFullCard;
  const showFullCard = useFullCard && frameUrls?.fullCard;

  const hasAnyFrame =
    frameUrls?.border || frameUrls?.textBacking || frameUrls?.fullCard;

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      {/* Card preview - larger and prominent */}
      <div
        className="relative w-56 shrink-0 rounded-xl overflow-hidden border-2 shadow-lg transition-colors duration-200 mx-auto sm:mx-0"
        style={{
          backgroundColor: colors.background,
          borderColor: `color-mix(in oklch, ${colors.text} 15%, transparent)`,
          aspectRatio: "3 / 4",
        }}
      >
        {/* Image area - 75% */}
        <div
          className="absolute inset-x-0 top-0 transition-colors duration-200"
          style={{
            backgroundColor: `color-mix(in oklch, ${colors.secondary} 30%, ${colors.background})`,
            height: "75%",
          }}
        >
          {/* Decorative illustration placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Simple happy face using style colors */}
              <div
                className="w-20 h-20 rounded-full transition-colors duration-200"
                style={{ backgroundColor: colors.primary }}
              />
              <div
                className="absolute top-5 left-4 w-3 h-3 rounded-full transition-colors duration-200"
                style={{ backgroundColor: colors.background }}
              />
              <div
                className="absolute top-5 right-4 w-3 h-3 rounded-full transition-colors duration-200"
                style={{ backgroundColor: colors.background }}
              />
              <div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 w-8 h-4 rounded-b-full transition-colors duration-200"
                style={{ backgroundColor: colors.background }}
              />
              {/* Accent */}
              <div
                className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-sm rotate-45 transition-colors duration-200"
                style={{ backgroundColor: colors.accent }}
              />
            </div>
          </div>
        </div>

        {/* Border frame overlay - z-10 */}
        {showBorder && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <img
              src={frameUrls!.border!}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Full card template overlay - z-10 */}
        {showFullCard && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <img
              src={frameUrls!.fullCard!}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content area - overlaps image, z-20 to be above frames */}
        {showText && (
          <div
            className="absolute inset-x-0 flex flex-col items-center justify-center transition-colors duration-200 z-20"
            style={{
              height: "25%",
              bottom: 0,
              top: "64%",
            }}
          >
            {/* Text backing */}
            {showTextBacking && (
              <div
                className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ aspectRatio: "2 / 1" }}
              >
                <img
                  src={frameUrls!.textBacking!}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Text content */}
            <div className="relative text-center px-4">
              <span
                className="font-semibold text-base block leading-tight transition-colors duration-200"
                style={{
                  color: colors.text,
                  fontFamily: `"${typography.headingFont}", system-ui, sans-serif`,
                }}
              >
                Happy
              </span>
              <span
                className="text-xs mt-1 block leading-tight transition-colors duration-200"
                style={{
                  color: colors.text,
                  opacity: 0.7,
                  fontFamily: `"${typography.bodyFont}", system-ui, sans-serif`,
                }}
              >
                Feeling good inside
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preview options */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Preview Options
        </h3>
        <div className="space-y-3">
          <ToggleRow label="Show text" checked={showText} onChange={setShowText} />

          {hasAnyFrame && (
            <>
              <div className="border-t border-border/50 pt-3 mt-3">
                <span className="text-xs text-muted-foreground">
                  Frame overlays
                </span>
              </div>

              {frameUrls?.border && (
                <ToggleRow
                  label="Border frame"
                  checked={useBorder}
                  onChange={setUseBorder}
                  disabled={useFullCard}
                />
              )}

              {frameUrls?.textBacking && (
                <ToggleRow
                  label="Text backing"
                  checked={useTextBacking}
                  onChange={setUseTextBacking}
                  disabled={!showText || useFullCard}
                />
              )}

              {frameUrls?.fullCard && (
                <ToggleRow
                  label="Full card template"
                  checked={useFullCard}
                  onChange={setUseFullCard}
                />
              )}
            </>
          )}

          {!hasAnyFrame && !styleIsPreset() && (
            <p className="text-xs text-muted-foreground">
              Generate frames below to preview them here.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  function styleIsPreset() {
    // Check if we're viewing a preset (no frame generation available)
    return false;
  }
}

// Toggle row component
function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        disabled && "opacity-50"
      )}
    >
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
          checked ? "bg-coral" : "bg-muted",
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
