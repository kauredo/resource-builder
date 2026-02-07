"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from "react-konva";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, RotateCcw, RotateCw, Save } from "lucide-react";
import type { AssetRef } from "@/types";

interface EditorText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  rotation: number;
  width?: number;
}

interface EditorState {
  image: {
    x: number;
    y: number;
    scale: number;
  };
  texts: EditorText[];
}

export interface ImageEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetRef: AssetRef;
  imageUrl: string;
  aspectRatio?: number; // width / height
  title?: string;
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*);base64/);
  const mime = mimeMatch?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function ImageEditorModalImpl({
  open,
  onOpenChange,
  assetRef,
  imageUrl,
  aspectRatio = 1,
  title = "Edit image",
}: ImageEditorModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 560, height: 560 });

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null,
  );
  const [imageState, setImageState] = useState({ x: 0, y: 0, scale: 1 });
  const [texts, setTexts] = useState<EditorText[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef<EditorState[]>([]);
  const historyIndexRef = useRef(0);

  const asset = useQuery(api.assets.getAsset, {
    ownerType: assetRef.ownerType,
    ownerId: assetRef.ownerId as any,
    assetType: assetRef.assetType,
    assetKey: assetRef.assetKey,
  });
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const createFromEdit = useMutation(api.assetVersions.createFromEdit);

  const currentPrompt = asset?.currentVersion?.prompt ?? "Edited asset";

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImageElement(img);
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width } = containerRef.current.getBoundingClientRect();
    const targetWidth = Math.min(640, Math.max(320, width));
    setStageSize({
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    });
  }, [aspectRatio, open]);

  const pushHistory = (state: EditorState) => {
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
    const nextHistory = [...trimmed, state];
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  useEffect(() => {
    if (!open) return;
    const initialState: EditorState = {
      image: { x: 0, y: 0, scale: 1 },
      texts: [],
    };
    setImageState(initialState.image);
    setTexts(initialState.texts);
    pushHistory(initialState);
  }, [open]);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const selectedNode = stage.findOne(`#text-${selectedTextId}`);
    if (selectedNode) {
      transformer.nodes([selectedNode]);
      transformer.getLayer().batchDraw();
    } else {
      transformer.nodes([]);
    }
  }, [selectedTextId, texts]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const applyHistoryState = (state: EditorState) => {
    setImageState(state.image);
    setTexts(state.texts);
  };

  const handleUndo = () => {
    if (!canUndo) return;
    const nextIndex = historyIndex - 1;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    applyHistoryState(historyRef.current[nextIndex]);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const nextIndex = historyIndex + 1;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    applyHistoryState(historyRef.current[nextIndex]);
  };

  const handleAddText = () => {
    const newText: EditorText = {
      id: crypto.randomUUID(),
      text: "New text",
      x: stageSize.width / 2 - 60,
      y: stageSize.height / 2 - 12,
      fontSize: 24,
      color: "#1A1A1A",
      rotation: 0,
      width: 200,
    };
    const nextTexts = [...texts, newText];
    setTexts(nextTexts);
    setSelectedTextId(newText.id);
    pushHistory({ image: imageState, texts: nextTexts });
  };

  const selectedText = texts.find((t) => t.id === selectedTextId) ?? null;

  const updateSelectedText = (updates: Partial<EditorText>) => {
    if (!selectedText) return;
    const nextTexts = texts.map((text) =>
      text.id === selectedText.id ? { ...text, ...updates } : text,
    );
    setTexts(nextTexts);
    pushHistory({ image: imageState, texts: nextTexts });
  };

  const handleImageDragEnd = (evt: any) => {
    const next = { ...imageState, x: evt.target.x(), y: evt.target.y() };
    setImageState(next);
    pushHistory({ image: next, texts });
  };

  const handleImageScaleChange = (value: number[]) => {
    const next = { ...imageState, scale: value[0] };
    setImageState(next);
    pushHistory({ image: next, texts });
  };

  const handleSave = async () => {
    if (!stageRef.current) return;

    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
    const blob = dataUrlToBlob(dataUrl);
    const uploadUrl = await generateUploadUrl();

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: blob,
    });
    const { storageId } = await response.json();

    await createFromEdit({
      ownerType: assetRef.ownerType,
      ownerId: assetRef.ownerId as any,
      assetType: assetRef.assetType,
      assetKey: assetRef.assetKey,
      storageId,
      prompt: currentPrompt,
      params: {
        editState: {
          image: imageState,
          texts,
          aspectRatio,
        },
      },
      sourceVersionId: asset?.currentVersionId,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Add text, reposition the image, and save a new version.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="space-y-4">
            <div
              ref={containerRef}
              className="rounded-xl border bg-muted/20 p-3"
            >
              <Stage
                width={stageSize.width}
                height={stageSize.height}
                ref={stageRef}
                className="bg-white rounded-lg"
                onMouseDown={(e) => {
                  if (e.target === e.target.getStage()) {
                    setSelectedTextId(null);
                  }
                }}
              >
                <Layer>
                  {imageElement && (
                    <KonvaImage
                      image={imageElement}
                      x={imageState.x}
                      y={imageState.y}
                      scaleX={imageState.scale}
                      scaleY={imageState.scale}
                      draggable
                      onDragEnd={handleImageDragEnd}
                    />
                  )}
                  {texts.map((text) => (
                    <Text
                      id={`text-${text.id}`}
                      key={text.id}
                      text={text.text}
                      x={text.x}
                      y={text.y}
                      fontSize={text.fontSize}
                      fill={text.color}
                      rotation={text.rotation}
                      width={text.width}
                      draggable
                      onClick={() => setSelectedTextId(text.id)}
                      onTap={() => setSelectedTextId(text.id)}
                      onDragEnd={(e) => {
                        const nextTexts = texts.map((t) =>
                          t.id === text.id
                            ? { ...t, x: e.target.x(), y: e.target.y() }
                            : t,
                        );
                        setTexts(nextTexts);
                        pushHistory({ image: imageState, texts: nextTexts });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const nextTexts = texts.map((t) =>
                          t.id === text.id
                            ? {
                                ...t,
                                x: node.x(),
                                y: node.y(),
                                rotation: node.rotation(),
                                fontSize: Math.max(10, t.fontSize * scaleX),
                              }
                            : t,
                        );
                        node.scaleX(1);
                        node.scaleY(1);
                        setTexts(nextTexts);
                        pushHistory({ image: imageState, texts: nextTexts });
                      }}
                    />
                  ))}
                  <Transformer ref={transformerRef} rotateEnabled />
                </Layer>
              </Stage>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="gap-1.5"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="gap-1.5"
              >
                <RotateCw className="size-4" aria-hidden="true" />
                Redo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddText}
                className="gap-1.5"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add text
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Image scale
                </Label>
                <Slider
                  value={[imageState.scale]}
                  min={0.4}
                  max={2.5}
                  step={0.05}
                  onValueChange={handleImageScaleChange}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Text</p>
                {selectedText && (
                  <span className="text-xs text-muted-foreground">
                    Selected
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  value={selectedText?.text ?? ""}
                  onChange={(e) => updateSelectedText({ text: e.target.value })}
                  placeholder="Select a text layer"
                  disabled={!selectedText}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Size</Label>
                  <Input
                    type="number"
                    min={10}
                    max={96}
                    value={selectedText?.fontSize ?? 24}
                    onChange={(e) =>
                      updateSelectedText({ fontSize: Number(e.target.value) })
                    }
                    disabled={!selectedText}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <Input
                    type="color"
                    value={selectedText?.color ?? "#1A1A1A"}
                    onChange={(e) =>
                      updateSelectedText({ color: e.target.value })
                    }
                    disabled={!selectedText}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Rotation</Label>
                <Slider
                  value={[selectedText?.rotation ?? 0]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={([rotation]) => updateSelectedText({ rotation })}
                  disabled={!selectedText}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className={cn("btn-coral gap-2", !imageElement && "opacity-70")}
                disabled={!imageElement}
              >
                <Save className="size-4" aria-hidden="true" />
                Save version
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
