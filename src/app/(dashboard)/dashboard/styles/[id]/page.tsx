"use client";

import { useState, useCallback, useEffect, use, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StyleCharacters } from "@/components/style/StyleCharacters";
import { StyleResources } from "@/components/style/StyleResources";
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
import { useDebouncedSave } from "@/hooks/use-debounced-save";
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
  Paintbrush,
  Layers,
  Users,
  FileStack,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { calculateCardLayout } from "@/lib/card-layout";
import { getCardAspectRatio } from "@/lib/pdf";
import type { StyleFrames, CardLayoutSettings } from "@/types";

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

export default function StyleDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") ?? "overview") as "overview" | "characters" | "resources";
  const user = useQuery(api.users.currentUser);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [framesExpanded, setFramesExpanded] = useState(false);

  // Local state for debounced fields
  const [localName, setLocalName] = useState<string | null>(null);
  const [localIllustrationStyle, setLocalIllustrationStyle] = useState<
    string | null
  >(null);
  const [localFramePromptSuffix, setLocalFramePromptSuffix] = useState<
    string | null
  >(null);

  const styleId = resolvedParams.id as Id<"styles">;
  const style = useQuery(api.styles.getStyleWithFrameUrls, { styleId });
  const styleSummary = useQuery(api.styles.getStyleSummary, { styleId });
  const updateStyle = useMutation(api.styles.updateStyle);
  const duplicateStyle = useMutation(api.styles.duplicateStyle);
  const deleteStyle = useMutation(api.styles.deleteStyle);

  // Load all fonts for previews
  useGoogleFonts([...HEADING_FONTS, ...BODY_FONTS]);

  // Derived values
  const displayName = localName ?? style?.name ?? "";
  const displayIllustrationStyle =
    localIllustrationStyle ?? style?.illustrationStyle ?? "";
  const displayFramePromptSuffix =
    localFramePromptSuffix ?? style?.framePromptSuffix ?? "";

  // Ref to track whether style is a preset (for the save callback)
  const isPresetRef = useRef(style?.isPreset ?? false);
  isPresetRef.current = style?.isPreset ?? false;

  const { saveStatus, debouncedSave } = useDebouncedSave({
    onSave: useCallback(
      async (updates: Record<string, unknown>) => {
        if (isPresetRef.current) return;
        await updateStyle({
          styleId,
          ...updates,
        });
      },
      [styleId, updateStyle],
    ),
  });

  // Non-debounced style change (for immediate updates like color/font selects)
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
      cardLayout?: CardLayoutSettings;
      defaultUseFrames?: {
        border?: boolean;
        fullCard?: boolean;
      };
      framePromptSuffix?: string;
    }) => {
      if (!style || style.isPreset) return;
      debouncedSave(updates);
    },
    [style, debouncedSave],
  );

  // Debounced name change
  const handleNameChange = useCallback(
    (value: string) => {
      setLocalName(value);
      debouncedSave({ name: value });
    },
    [debouncedSave],
  );

  // Debounced illustration style change
  const handleIllustrationStyleChange = useCallback(
    (value: string) => {
      setLocalIllustrationStyle(value);
      debouncedSave({ illustrationStyle: value });
    },
    [debouncedSave],
  );

  // Debounced frame prompt suffix change
  const handleFramePromptSuffixChange = useCallback(
    (value: string) => {
      setLocalFramePromptSuffix(value);
      debouncedSave({ framePromptSuffix: value || undefined });
    },
    [debouncedSave],
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
        <div className="h-4 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none mb-6" />
        <div className="h-12 w-72 bg-muted rounded animate-pulse motion-reduce:animate-none mb-8" />
        <div className="h-64 bg-muted rounded-xl animate-pulse motion-reduce:animate-none mb-8" />
        <div className="space-y-6">
          <div className="h-24 bg-muted rounded-lg animate-pulse motion-reduce:animate-none" />
          <div className="h-20 bg-muted rounded-lg animate-pulse motion-reduce:animate-none" />
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
  const frameCount = [style.frames?.border, style.frames?.fullCard].filter(
    Boolean,
  ).length;

  return (
    <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 py-8", activeTab === "overview" ? "max-w-3xl" : "max-w-5xl")}>
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
                onChange={e => handleNameChange(e.target.value)}
                maxLength={100}
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
                  <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
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
              href={`/dashboard/resources/new?styleId=${styleId}`}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Create Resource
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
                        className="size-4 animate-spin motion-reduce:animate-none mr-2"
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

      {/* Tab Navigation */}
      <nav className="flex gap-1 mb-8 border-b border-border/50" aria-label="Style sections">
        {([
          { key: "overview" as const, label: "Overview", icon: Palette, count: undefined as number | undefined },
          { key: "characters" as const, label: "Characters", icon: Users, count: styleSummary?.characterCount },
          { key: "resources" as const, label: "Resources", icon: FileStack, count: styleSummary?.resourceCount },
        ]).map(({ key, label, icon: Icon, count }) => (
          <Link
            key={key}
            href={`/dashboard/styles/${styleId}${key === "overview" ? "" : `?tab=${key}`}`}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-medium -mb-px border-b-2 transition-colors duration-150 motion-reduce:transition-none rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
              activeTab === key
                ? "border-coral text-coral"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
            aria-current={activeTab === key ? "page" : undefined}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
            {count !== undefined && count > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted tabular-nums">
                {count}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Tab Content */}
      {activeTab === "characters" && user?._id && (
        <StyleCharacters styleId={styleId} userId={user._id} />
      )}

      {activeTab === "resources" && (
        <StyleResources styleId={styleId} />
      )}

      {activeTab === "overview" && (
      <>
      {/* Live Preview - Hero position */}
      <section className="mb-10">
        <StylePreview
          styleId={styleId}
          colors={colors}
          typography={typography}
          frameUrls={style.frameUrls}
          cardLayout={style.cardLayout}
          defaultUseFrames={style.defaultUseFrames}
          onDefaultUseFramesChange={
            style.isPreset
              ? undefined
              : defaultUseFrames => handleStyleChange({ defaultUseFrames })
          }
        />
      </section>

      {/* Style Properties */}
      <div className="space-y-8">
        {/* Color Palette */}
        <section className="p-5 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Palette
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
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
                onChange={value =>
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
                onValueChange={value =>
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
                  {HEADING_FONTS.map(font => (
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
                onValueChange={value =>
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
                  {BODY_FONTS.map(font => (
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

        {/* Card Layout */}
        <CardLayoutSection
          cardLayout={style.cardLayout}
          onChange={cardLayout => handleStyleChange({ cardLayout })}
          disabled={style.isPreset}
        />

        {/* Illustration Style */}
        <section className="p-5 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Paintbrush
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="text-sm font-medium text-foreground">
              Illustration Style
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3 ml-6">
            Describe how AI-generated illustrations should look
          </p>
          <Textarea
            value={displayIllustrationStyle}
            onChange={e => handleIllustrationStyleChange(e.target.value)}
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
              className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/20 transition-colors duration-150 motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
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
                  framesExpanded && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            {framesExpanded && (
              <div className="px-5 pb-5 border-t border-border/50">
                <div className="pt-5 space-y-5">
                  {/* Custom frame prompt */}
                  {!style.isPreset && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Custom Frame Instructions (optional)
                      </Label>
                      <Textarea
                        value={displayFramePromptSuffix}
                        onChange={e =>
                          handleFramePromptSuffixChange(e.target.value)
                        }
                        placeholder="Add specific instructions for AI frame generation, e.g., 'use rounded corners', 'include small stars', 'vintage look'..."
                        className="text-sm min-h-[60px] resize-none"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        These instructions will be added to all frame generation
                        prompts.
                      </p>
                    </div>
                  )}
                  <FrameGenerator
                    styleId={styleId}
                    style={{
                      colors: style.colors,
                      illustrationStyle: style.illustrationStyle,
                    }}
                    frames={style.frames as StyleFrames | undefined}
                    frameUrls={style.frameUrls}
                    framePromptSuffix={style.framePromptSuffix}
                  />
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      </>
      )}

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
              onChange={e => setDuplicateName(e.target.value)}
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
                  className="size-4 animate-spin motion-reduce:animate-none mr-2"
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
          input.onchange = e => onChange((e.target as HTMLInputElement).value);
          input.click();
        }}
        disabled={disabled}
        className="w-full aspect-square rounded-lg border border-border/50 cursor-pointer hover:scale-105 hover:border-coral/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-all duration-150 motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
  styleId,
  colors,
  typography,
  frameUrls,
  cardLayout,
  defaultUseFrames,
  onDefaultUseFramesChange,
}: {
  styleId: Id<"styles">;
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
    fullCard?: string | null;
  };
  cardLayout?: CardLayoutSettings;
  defaultUseFrames?: {
    border?: boolean;
    fullCard?: boolean;
  };
  onDefaultUseFramesChange?: (value: {
    border?: boolean;
    fullCard?: boolean;
  }) => void;
}) {
  const [showText, setShowText] = useState(true);

  // Query for a sample card image (preferring "Happy")
  const sampleImage = useQuery(api.resources.getSampleImageForStyle, {
    styleId,
  });

  // Initialize from saved defaults, update when props change
  const [useBorder, setUseBorder] = useState(defaultUseFrames?.border ?? false);
  const [useFullCard, setUseFullCard] = useState(
    defaultUseFrames?.fullCard ?? false,
  );

  // Sync with external changes
  useEffect(() => {
    setUseBorder(defaultUseFrames?.border ?? false);
    setUseFullCard(defaultUseFrames?.fullCard ?? false);
  }, [defaultUseFrames]);

  // Handle frame toggle changes - update local state and persist
  const handleFrameToggle = (
    frameType: "border" | "fullCard",
    enabled: boolean,
  ) => {
    // Update local state immediately
    if (frameType === "border") setUseBorder(enabled);
    if (frameType === "fullCard") setUseFullCard(enabled);

    // Persist to database if callback provided
    if (onDefaultUseFramesChange) {
      onDefaultUseFramesChange({
        ...defaultUseFrames,
        [frameType]: enabled,
      });
    }
  };

  // Use shared layout calculation for consistency with CardPreview and PDF
  // Pass showText for both labels and descriptions so the toggle hides all text
  const cardDimensions = calculateCardLayout(cardLayout, showText, showText);

  // Use 4 cards per page for a portrait aspect ratio that better represents typical cards
  // (6 cards per page results in nearly square cards due to A4 proportions)
  const cardAspectRatio = getCardAspectRatio(4);

  // Determine what to show
  const showBorder = useBorder && frameUrls?.border && !useFullCard;
  const showFullCard = useFullCard && frameUrls?.fullCard;

  const hasAnyFrame = frameUrls?.border || frameUrls?.fullCard;

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      {/* Card preview - larger and prominent */}
      <div
        className="relative w-56 shrink-0 rounded-xl overflow-hidden shadow-lg transition-colors duration-200 mx-auto sm:mx-0"
        style={{
          backgroundColor: colors.background,
          aspectRatio: cardAspectRatio,
          // CSS border from card layout settings, fallback to subtle border
          borderWidth: cardDimensions.borderWidth || 2,
          borderStyle: "solid",
          borderColor: cardDimensions.borderWidth
            ? cardDimensions.borderColor || colors.text
            : `color-mix(in oklch, ${colors.text} 15%, transparent)`,
        }}
      >
        {/* Image area */}
        <div
          className="absolute inset-x-0 top-0 transition-colors duration-200 overflow-hidden"
          style={{
            backgroundColor: `color-mix(in oklch, ${colors.secondary} 30%, ${colors.background})`,
            height: `${cardDimensions.imageHeightPercent}%`,
          }}
        >
          {/* Show generated card image or static fallback */}
          <img
            src={sampleImage?.url || "/images/cards/happy.png"}
            alt={sampleImage?.emotion || "Happy"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Border frame overlay - z-10 */}
        {showBorder && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <img src={frameUrls!.border!} alt="" className="w-full h-full" />
          </div>
        )}

        {/* Full card template overlay - z-10 */}
        {showFullCard && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <img src={frameUrls!.fullCard!} alt="" className="w-full h-full" />
          </div>
        )}

        {/* Content area - overlaps image, z-20 to be above frames */}
        {cardDimensions.hasContent && (
          <div
            className="absolute inset-x-0 flex flex-col items-center justify-center transition-colors duration-200 z-20"
            style={{
              height: `${cardDimensions.contentHeightPercent}%`,
              bottom: 0,
              top: `${cardDimensions.contentTopPercent}%`,
            }}
          >
            {/* Overlay mode: semi-transparent backdrop */}
            {cardDimensions.isOverlay && (
              <div
                className="absolute inset-0 pointer-events-none transition-colors duration-200"
                style={{
                  background: `linear-gradient(to top, ${colors.background} 60%, transparent)`,
                }}
              />
            )}

            {/* Text content */}
            <div className="relative z-10 text-center px-4">
              <span
                className="font-semibold text-base block leading-tight transition-colors duration-200"
                style={{
                  color: colors.text,
                  fontFamily: `"${typography.headingFont}", system-ui, sans-serif`,
                }}
              >
                {sampleImage?.emotion || "Happy"}
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
          <ToggleRow
            label="Show text"
            checked={showText}
            onChange={setShowText}
          />

          {hasAnyFrame && (
            <>
              <div className="border-t border-border/50 pt-3 mt-3">
                <span className="text-xs text-muted-foreground">
                  Default frames for new resources
                </span>
              </div>

              {frameUrls?.border && (
                <ToggleRow
                  label="Border frame"
                  checked={useBorder}
                  onChange={enabled => handleFrameToggle("border", enabled)}
                  disabled={useFullCard || !onDefaultUseFramesChange}
                />
              )}

              {frameUrls?.fullCard && (
                <ToggleRow
                  label="Full card template"
                  checked={useFullCard}
                  onChange={enabled => handleFrameToggle("fullCard", enabled)}
                  disabled={!onDefaultUseFramesChange}
                />
              )}
            </>
          )}

          {!hasAnyFrame && (
            <p className="text-xs text-muted-foreground">
              Generate frames below to preview them here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
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
        disabled && "opacity-50",
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
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
          checked ? "bg-coral" : "bg-muted",
          disabled && "cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

// Card layout section component
function CardLayoutSection({
  cardLayout,
  onChange,
  disabled,
}: {
  cardLayout?: CardLayoutSettings;
  onChange: (cardLayout: CardLayoutSettings) => void;
  disabled?: boolean;
}) {
  const [localLayout, setLocalLayout] = useState<CardLayoutSettings>({
    textPosition: cardLayout?.textPosition ?? "bottom",
    contentHeight: cardLayout?.contentHeight ?? 25,
    imageOverlap: cardLayout?.imageOverlap ?? 11,
    borderWidth: cardLayout?.borderWidth ?? 0,
    borderColor: cardLayout?.borderColor,
  });

  // Sync with external values
  useEffect(() => {
    setLocalLayout({
      textPosition: cardLayout?.textPosition ?? "bottom",
      contentHeight: cardLayout?.contentHeight ?? 25,
      imageOverlap: cardLayout?.imageOverlap ?? 11,
      borderWidth: cardLayout?.borderWidth ?? 0,
      borderColor: cardLayout?.borderColor,
    });
  }, [cardLayout]);

  // Debounced update
  useEffect(() => {
    const hasChanged =
      localLayout.textPosition !== (cardLayout?.textPosition ?? "bottom") ||
      localLayout.contentHeight !== (cardLayout?.contentHeight ?? 25) ||
      localLayout.imageOverlap !== (cardLayout?.imageOverlap ?? 11) ||
      localLayout.borderWidth !== (cardLayout?.borderWidth ?? 0) ||
      localLayout.borderColor !== cardLayout?.borderColor;

    if (!hasChanged || disabled) return;

    const timeout = setTimeout(() => {
      onChange(localLayout);
    }, 300);

    return () => clearTimeout(timeout);
  }, [localLayout, cardLayout, onChange, disabled]);

  return (
    <section className="p-5 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-medium text-foreground">Card Layout</h2>
      </div>

      <div className="space-y-5">
        {/* Text Position */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Text Position</Label>
          <Select
            value={localLayout.textPosition}
            onValueChange={(value: "bottom" | "overlay" | "integrated") =>
              setLocalLayout(prev => ({ ...prev, textPosition: value }))
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom">Bottom area</SelectItem>
              <SelectItem value="overlay">Overlay on image</SelectItem>
              <SelectItem value="integrated">
                In image (AI-generated)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground max-w-xs">
            {localLayout.textPosition === "bottom" && (
              <>Text appears in a dedicated area below the image.</>
            )}
            {localLayout.textPosition === "overlay" && (
              <>
                Text floats over the image with a fade effect. Image fills
                entire card.
              </>
            )}
            {localLayout.textPosition === "integrated" && (
              <>
                No text overlay shown. The AI will generate the emotion word
                directly into the illustration.
              </>
            )}
          </p>
        </div>

        {/* Content Height - only show if not integrated */}
        {localLayout.textPosition !== "integrated" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Text Area Height
              </Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {localLayout.contentHeight}%
              </span>
            </div>
            <Slider
              value={[localLayout.contentHeight ?? 25]}
              onValueChange={([value]) =>
                setLocalLayout(prev => ({ ...prev, contentHeight: value }))
              }
              min={10}
              max={40}
              step={1}
              disabled={disabled}
              className="w-full max-w-xs"
            />
          </div>
        )}

        {/* Image Overlap - only show for bottom mode (overlay uses full image, integrated has no text area) */}
        {localLayout.textPosition === "bottom" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Image Overlap
              </Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {localLayout.imageOverlap}%
              </span>
            </div>
            <Slider
              value={[localLayout.imageOverlap ?? 11]}
              onValueChange={([value]) =>
                setLocalLayout(prev => ({ ...prev, imageOverlap: value }))
              }
              min={0}
              max={20}
              step={1}
              disabled={disabled}
              className="w-full max-w-xs"
            />
          </div>
        )}

        {/* Border - divider line */}
        <div className="border-t border-border/50 pt-4 mt-4">
          <Label className="text-xs text-muted-foreground mb-3 block">
            Card Border
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            Simple CSS border (alternative to generated frame assets)
          </p>
        </div>

        {/* Border Width */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Border Width
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {localLayout.borderWidth ?? 0}px
            </span>
          </div>
          <Slider
            value={[localLayout.borderWidth ?? 0]}
            onValueChange={([value]) =>
              setLocalLayout(prev => ({ ...prev, borderWidth: value }))
            }
            min={0}
            max={8}
            step={1}
            disabled={disabled}
            className="w-full max-w-xs"
          />
        </div>

        {/* Border Color - only show if border width > 0 */}
        {(localLayout.borderWidth ?? 0) > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Border Color
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={localLayout.borderColor || "#000000"}
                onChange={e =>
                  setLocalLayout(prev => ({
                    ...prev,
                    borderColor: e.target.value,
                  }))
                }
                disabled={disabled}
                className="size-8 rounded cursor-pointer border border-border"
              />
              <Input
                type="text"
                value={localLayout.borderColor || ""}
                onChange={e =>
                  setLocalLayout(prev => ({
                    ...prev,
                    borderColor: e.target.value || undefined,
                  }))
                }
                placeholder="Uses text color"
                disabled={disabled}
                className="w-32 text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
