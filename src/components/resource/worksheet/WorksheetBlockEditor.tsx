"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import type { WorksheetBlock } from "@/types";

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  heading: "Heading",
  prompt: "Prompt",
  text: "Text",
  lines: "Lines",
  checklist: "Checklist",
  scale: "Scale",
  drawing_box: "Drawing Box",
  word_bank: "Word Bank",
  matching: "Matching",
  fill_in_blank: "Fill in the Blank",
  multiple_choice: "Multiple Choice",
  image: "Image",
  table: "Table",
};

interface WorksheetBlockEditorProps {
  block: WorksheetBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (blockId: string, updates: Partial<WorksheetBlock>) => void;
  onMove: (blockId: string, direction: "up" | "down") => void;
  onRemove: (blockId: string) => void;
}

export function WorksheetBlockEditor({
  block,
  index,
  totalBlocks,
  onUpdate,
  onMove,
  onRemove,
}: WorksheetBlockEditorProps) {
  const update = (updates: Partial<WorksheetBlock>) =>
    onUpdate(block.id, updates);

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/40">
        <span className="text-sm font-medium text-foreground">
          {BLOCK_TYPE_LABELS[block.type] || block.type}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMove(block.id, "up")}
            disabled={index === 0}
            aria-label="Move block up"
          >
            <ChevronUp className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMove(block.id, "down")}
            disabled={index === totalBlocks - 1}
            aria-label="Move block down"
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(block.id)}
            aria-label="Remove block"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Heading / Prompt / Text */}
        {(block.type === "heading" ||
          block.type === "prompt" ||
          block.type === "text") && (
          <Textarea
            value={block.text ?? ""}
            onChange={(e) => update({ text: e.target.value })}
            placeholder={
              block.type === "heading"
                ? "Section heading"
                : block.type === "prompt"
                  ? "Instructions or question"
                  : "Body text"
            }
            rows={block.type === "heading" ? 1 : 3}
            aria-label={`${BLOCK_TYPE_LABELS[block.type]} text`}
          />
        )}

        {/* Lines */}
        {block.type === "lines" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Number of lines
            </Label>
            <Input
              type="number"
              value={block.lines ?? 3}
              onChange={(e) => update({ lines: Number(e.target.value) })}
              min={1}
              max={20}
              className="max-w-[120px]"
              aria-label="Number of lines"
            />
          </div>
        )}

        {/* Checklist */}
        {block.type === "checklist" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Items (one per line)
            </Label>
            <Textarea
              value={(block.items ?? []).join("\n")}
              onChange={(e) =>
                update({ items: e.target.value.split("\n") })
              }
              placeholder="One item per line"
              rows={4}
              aria-label="Checklist items"
            />
          </div>
        )}

        {/* Scale */}
        {block.type === "scale" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Min label
              </Label>
              <Input
                value={block.scaleLabels?.min ?? ""}
                onChange={(e) =>
                  update({
                    scaleLabels: {
                      min: e.target.value,
                      max: block.scaleLabels?.max ?? "",
                    },
                  })
                }
                placeholder="e.g., Not at all"
                aria-label="Scale minimum label"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Max label
              </Label>
              <Input
                value={block.scaleLabels?.max ?? ""}
                onChange={(e) =>
                  update({
                    scaleLabels: {
                      min: block.scaleLabels?.min ?? "",
                      max: e.target.value,
                    },
                  })
                }
                placeholder="e.g., Very much"
                aria-label="Scale maximum label"
              />
            </div>
          </div>
        )}

        {/* Drawing Box */}
        {block.type === "drawing_box" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Label / instruction
            </Label>
            <Input
              value={block.label ?? ""}
              onChange={(e) => update({ label: e.target.value })}
              placeholder="e.g., Draw how you feel"
              aria-label="Drawing box label"
            />
          </div>
        )}

        {/* Word Bank */}
        {block.type === "word_bank" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Words (one per line)
            </Label>
            <Textarea
              value={(block.words ?? []).join("\n")}
              onChange={(e) =>
                update({ words: e.target.value.split("\n") })
              }
              placeholder="happy&#10;sad&#10;angry&#10;calm"
              rows={4}
              aria-label="Word bank words"
            />
          </div>
        )}

        {/* Matching */}
        {block.type === "matching" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Left items (one per line)
              </Label>
              <Textarea
                value={(block.leftItems ?? []).join("\n")}
                onChange={(e) =>
                  update({ leftItems: e.target.value.split("\n") })
                }
                placeholder="Feeling&#10;Thought"
                rows={4}
                aria-label="Left column items"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Right items (one per line)
              </Label>
              <Textarea
                value={(block.rightItems ?? []).join("\n")}
                onChange={(e) =>
                  update({ rightItems: e.target.value.split("\n") })
                }
                placeholder="Body clue&#10;Coping skill"
                rows={4}
                aria-label="Right column items"
              />
            </div>
          </div>
        )}

        {/* Fill in the Blank */}
        {block.type === "fill_in_blank" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Sentence (use ___ for blanks)
            </Label>
            <Textarea
              value={block.text ?? ""}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="When I feel ___ I can try ___"
              rows={2}
              aria-label="Fill in the blank sentence"
            />
          </div>
        )}

        {/* Multiple Choice */}
        {block.type === "multiple_choice" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Question
              </Label>
              <Input
                value={block.question ?? ""}
                onChange={(e) => update({ question: e.target.value })}
                placeholder="Which is a coping skill?"
                aria-label="Question"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Options (one per line)
              </Label>
              <Textarea
                value={(block.options ?? []).join("\n")}
                onChange={(e) =>
                  update({ options: e.target.value.split("\n") })
                }
                placeholder="Deep breathing&#10;Yelling&#10;Counting to 10"
                rows={4}
                aria-label="Answer options"
              />
            </div>
          </div>
        )}

        {/* Image */}
        {block.type === "image" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Caption (optional)
              </Label>
              <Input
                value={block.caption ?? ""}
                onChange={(e) => update({ caption: e.target.value })}
                placeholder="e.g., My safe place"
                aria-label="Image caption"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Image prompt
              </Label>
              <Textarea
                value={block.imagePrompt ?? ""}
                onChange={(e) => update({ imagePrompt: e.target.value })}
                placeholder="Describe the illustration..."
                rows={2}
                aria-label="Image prompt"
              />
            </div>
          </div>
        )}

        {/* Table */}
        {block.type === "table" && (
          <TableEditor block={block} onUpdate={update} />
        )}
      </div>
    </div>
  );
}

function TableEditor({
  block,
  onUpdate,
}: {
  block: WorksheetBlock;
  onUpdate: (updates: Partial<WorksheetBlock>) => void;
}) {
  const headers = block.headers ?? ["Column 1", "Column 2"];
  const rows = block.tableRows ?? [headers.map(() => "")];
  const colCount = headers.length;

  const updateHeader = (colIdx: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIdx] = value;
    onUpdate({ headers: newHeaders });
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = rows.map((row) => [...row]);
    newRows[rowIdx][colIdx] = value;
    onUpdate({ tableRows: newRows });
  };

  const addRow = () => {
    onUpdate({ tableRows: [...rows, headers.map(() => "")] });
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    onUpdate({ tableRows: rows.filter((_, i) => i !== rowIdx) });
  };

  const addColumn = () => {
    onUpdate({
      headers: [...headers, `Column ${colCount + 1}`],
      tableRows: rows.map((row) => [...row, ""]),
    });
  };

  const removeColumn = (colIdx: number) => {
    if (colCount <= 2) return;
    onUpdate({
      headers: headers.filter((_, i) => i !== colIdx),
      tableRows: rows.map((row) => row.filter((_, i) => i !== colIdx)),
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">
        Table
      </Label>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {headers.map((header, colIdx) => (
                <th key={colIdx} className="p-1">
                  <div className="flex items-center gap-1">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(colIdx, e.target.value)}
                      className="text-xs font-medium h-8"
                      aria-label={`Column ${colIdx + 1} header`}
                    />
                    {colCount > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeColumn(colIdx)}
                        aria-label={`Remove column ${colIdx + 1}`}
                      >
                        <Trash2 className="size-3" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-1 w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-1">
                    <Input
                      value={cell}
                      onChange={(e) =>
                        updateCell(rowIdx, colIdx, e.target.value)
                      }
                      className="text-xs h-8"
                      placeholder="..."
                      aria-label={`Row ${rowIdx + 1}, ${headers[colIdx]}`}
                    />
                  </td>
                ))}
                <td className="p-1">
                  {rows.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRow(rowIdx)}
                      aria-label={`Remove row ${rowIdx + 1}`}
                    >
                      <Trash2 className="size-3" aria-hidden="true" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addRow} className="gap-1">
          <Plus className="size-3" aria-hidden="true" />
          Row
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={addColumn}
          className="gap-1"
        >
          <Plus className="size-3" aria-hidden="true" />
          Column
        </Button>
      </div>
    </div>
  );
}
