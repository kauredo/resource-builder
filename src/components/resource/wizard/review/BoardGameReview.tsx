"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AIWizardState } from "../use-ai-wizard";

interface BoardGameReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

interface GridData {
  rows: number;
  cols: number;
  cells: Array<{ label?: string }>;
}

interface TokenData {
  name: string;
  color?: string;
}

interface CardData {
  title: string;
  text: string;
}

export function BoardGameReview({
  state,
  onUpdate,
}: BoardGameReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const grid = (content.grid as GridData) || { rows: 5, cols: 5, cells: [] };
  const boardImagePrompt = (content.boardImagePrompt as string) || "";
  const tokens = (content.tokens as TokenData[]) || [];
  const cards = (content.cards as CardData[]) || [];

  const updateField = (field: string, value: unknown) => {
    const updated = { ...content, [field]: value };

    if (field === "boardImagePrompt") {
      onUpdate({
        generatedContent: updated,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === "board_main"
            ? {
                ...item,
                prompt: `Board game illustration: ${value as string}`,
              }
            : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: updated });
    }
  };

  const updateCell = (index: number, label: string) => {
    const newCells = [...grid.cells];
    newCells[index] = { ...newCells[index], label };
    updateField("grid", { ...grid, cells: newCells });
  };

  const updateGridSize = (field: "rows" | "cols", value: number) => {
    const clamped = Math.max(3, Math.min(10, value));
    const newGrid = { ...grid, [field]: clamped };
    const totalCells = newGrid.rows * newGrid.cols;
    // Extend or truncate cells
    const newCells = Array.from({ length: totalCells }, (_, i) =>
      i < grid.cells.length ? grid.cells[i] : { label: "" },
    );
    updateField("grid", { ...newGrid, cells: newCells });
  };

  const updateToken = (index: number, field: keyof TokenData, value: string) => {
    const updated = [...tokens];
    updated[index] = { ...updated[index], [field]: value };
    updateField("tokens", updated);
  };

  const updateGameCard = (index: number, field: keyof CardData, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    updateField("cards", updated);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review and edit the AI-generated board game before generating images.
      </p>

      <div className="space-y-2 max-w-md">
        <Label htmlFor="review-name" className="font-medium">
          Game Name
        </Label>
        <Input
          id="review-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Board game name"
        />
      </div>

      {/* Grid size */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Board Grid
        </h3>
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Rows</Label>
            <Input
              type="number"
              min={3}
              max={10}
              value={grid.rows}
              onChange={(e) =>
                updateGridSize("rows", parseInt(e.target.value) || 5)
              }
              className="w-20"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Columns</Label>
            <Input
              type="number"
              min={3}
              max={10}
              value={grid.cols}
              onChange={(e) =>
                updateGridSize("cols", parseInt(e.target.value) || 5)
              }
              className="w-20"
            />
          </div>
        </div>

        {/* Grid preview with editable labels */}
        <div
          className="grid gap-1 max-w-lg"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          }}
        >
          {grid.cells.slice(0, grid.rows * grid.cols).map((cell, i) => (
            <input
              key={i}
              value={cell.label || ""}
              onChange={(e) => updateCell(i, e.target.value)}
              placeholder={String(i + 1)}
              aria-label={`Cell ${i + 1}`}
              className="w-full text-center text-[10px] px-0.5 py-1 border border-border/50 rounded bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-1 transition-colors duration-150 motion-reduce:transition-none"
            />
          ))}
        </div>
      </div>

      {/* Board image prompt */}
      <div className="space-y-2 max-w-xl">
        <Label htmlFor="review-board-prompt" className="font-medium">
          Board Image Prompt
        </Label>
        <Textarea
          id="review-board-prompt"
          value={boardImagePrompt}
          onChange={(e) => updateField("boardImagePrompt", e.target.value)}
          placeholder="Describe the board background illustration"
          rows={3}
        />
      </div>

      {/* Tokens */}
      {tokens.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Tokens ({tokens.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tokens.map((token, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-card p-2"
              >
                <input
                  type="color"
                  value={token.color || "#FF6B6B"}
                  onChange={(e) =>
                    updateToken(index, "color", e.target.value)
                  }
                  className="size-6 rounded cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-1"
                />
                <Input
                  value={token.name}
                  onChange={(e) =>
                    updateToken(index, "name", e.target.value)
                  }
                  placeholder="Token name"
                  className="text-sm h-7"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game cards */}
      {cards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Game Cards ({cards.length})
          </h3>
          <div className="space-y-2">
            {cards.map((card, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/60 bg-card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                <div className="space-y-1">
                  <Label htmlFor={`board-card-${index}-title`} className="text-xs">Title</Label>
                  <Input
                    id={`board-card-${index}-title`}
                    value={card.title}
                    onChange={(e) =>
                      updateGameCard(index, "title", e.target.value)
                    }
                    placeholder="Card title"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`board-card-${index}-text`} className="text-xs">Instructions</Label>
                  <Input
                    id={`board-card-${index}-text`}
                    value={card.text}
                    onChange={(e) =>
                      updateGameCard(index, "text", e.target.value)
                    }
                    placeholder="Card instructions"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
