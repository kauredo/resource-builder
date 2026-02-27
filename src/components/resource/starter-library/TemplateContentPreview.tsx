import type { StarterTemplate } from "@/lib/starter-templates";
import type {
  EmotionCardContent,
  FlashcardsContent,
  WorksheetContent,
  PosterContent,
  BoardGameContent,
  CardGameContent,
  BookContent,
  BehaviorChartContent,
  ColoringPagesContent,
} from "@/types";

interface TemplateContentPreviewProps {
  template: StarterTemplate;
}

export function TemplateContentPreview({
  template,
}: TemplateContentPreviewProps) {
  switch (template.type) {
    case "emotion_cards":
      return <EmotionCardsPreview content={template.content as unknown as EmotionCardContent} />;
    case "flashcards":
      return <FlashcardsPreview content={template.content as unknown as FlashcardsContent} />;
    case "worksheet":
      return <WorksheetPreview content={template.content as unknown as WorksheetContent} />;
    case "poster":
      return <PosterPreview content={template.content as unknown as PosterContent} />;
    case "board_game":
      return <BoardGamePreview content={template.content as unknown as BoardGameContent} />;
    case "card_game":
      return <CardGamePreview content={template.content as unknown as CardGameContent} />;
    case "book":
      return <BookPreview content={template.content as unknown as BookContent} />;
    case "behavior_chart":
      return <BehaviorChartPreview content={template.content as unknown as BehaviorChartContent} />;
    case "coloring_pages":
      return <ColoringPagesPreview content={template.content as unknown as ColoringPagesContent} />;
    default:
      return null;
  }
}

function SectionHeader({ count, label }: { count: number; label: string }) {
  return (
    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
      What&apos;s included ({count} {label})
    </h4>
  );
}

function EmotionCardsPreview({ content }: { content: EmotionCardContent }) {
  return (
    <div>
      <SectionHeader count={content.cards.length} label="cards" />
      <div className="flex flex-wrap gap-1.5">
        {content.cards.map((card) => (
          <span
            key={card.emotion}
            className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-foreground"
          >
            {card.emotion}
          </span>
        ))}
      </div>
    </div>
  );
}

function FlashcardsPreview({ content }: { content: FlashcardsContent }) {
  return (
    <div>
      <SectionHeader count={content.cards.length} label="cards" />
      <ol className="space-y-3">
        {content.cards.map((card, i) => (
          <li key={card.id ?? i} className="text-sm">
            <span className="text-muted-foreground/60 text-xs mr-1.5">
              {i + 1}.
            </span>
            <span className="font-medium text-foreground">
              {card.frontText}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 ml-4">
              {card.backText}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function WorksheetPreview({ content }: { content: WorksheetContent }) {
  const uniqueTypes = [...new Set(content.blocks.map((b) => b.type))].filter(
    (t) => t !== "heading" && t !== "text"
  );
  const typeNames = uniqueTypes
    .map((t) => t.replaceAll("_", " "))
    .slice(0, 3)
    .join(", ");
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        What&apos;s included ({typeNames})
      </h4>
      <ol className="space-y-1.5">
        {content.blocks.map((block) => {
          const label = block.type === "drawing_box" ? "drawing_box" : block.type;
          let detail = block.text || "";
          if (block.type === "checklist" && block.items) {
            detail = block.items.join(", ");
          }
          if (block.type === "scale" && block.scaleLabels) {
            detail = `${block.text ?? "Scale"} (${block.scaleLabels.min} → ${block.scaleLabels.max})`;
          }
          if (block.type === "lines") {
            detail = `${block.lines ?? 1} lines`;
          }
          if (block.type === "drawing_box") {
            detail = "";
          }
          return (
            <li key={block.id} className="text-sm flex items-start gap-2">
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground capitalize shrink-0 mt-0.5">
                {label.replaceAll("_", " ")}
              </span>
              {detail && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {detail}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PosterPreview({ content }: { content: PosterContent }) {
  return (
    <div>
      <SectionHeader count={1} label="poster" />
      <div className="rounded-lg border border-border/40 p-4 bg-muted/20 text-center">
        <p className="font-serif font-medium text-foreground text-base">
          {content.headline}
        </p>
        {content.subtext && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {content.subtext}
          </p>
        )}
      </div>
    </div>
  );
}

function BoardGamePreview({ content }: { content: BoardGameContent }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        What&apos;s included
      </h4>
      <ul className="space-y-1.5 text-sm">
        <li className="text-muted-foreground">
          {content.grid.rows}&times;{content.grid.cols} board (
          {content.grid.rows * content.grid.cols} spaces)
        </li>
        {content.tokens && (
          <li className="text-muted-foreground">
            {content.tokens.length} tokens:{" "}
            {content.tokens.map((t) => t.name).join(", ")}
          </li>
        )}
        {content.cards && (
          <li className="text-muted-foreground">
            {content.cards.length} action cards
          </li>
        )}
      </ul>
      {content.cards && content.cards.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground/70 mb-2">
            Sample cards:
          </p>
          <ol className="space-y-2">
            {content.cards.slice(0, 3).map((card, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-foreground">
                  {card.title}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {card.text}
                </p>
              </li>
            ))}
            {content.cards.length > 3 && (
              <li className="text-xs text-muted-foreground/60">
                +{content.cards.length - 3} more cards...
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
}

function CardGamePreview({ content }: { content: CardGameContent }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        What&apos;s included
      </h4>
      <ul className="space-y-1.5 text-sm text-muted-foreground mb-3">
        <li>{content.cards.length} unique cards</li>
        <li>{content.backgrounds.length} card backgrounds</li>
        {content.icons.length > 0 && <li>{content.icons.length} icons</li>}
      </ul>
      {content.rules && (
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Rules:
          </p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {content.rules}
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground/70 mb-2">Cards:</p>
      <ol className="space-y-1.5">
        {content.cards.map((card) => (
          <li key={card.id} className="text-sm">
            <span className="font-medium text-foreground">{card.title}</span>
            <span className="text-xs text-muted-foreground ml-1.5">
              {card.primaryText.content.length > 60
                ? card.primaryText.content.slice(0, 60) + "..."
                : card.primaryText.content}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BookPreview({ content }: { content: BookContent }) {
  const pageCount = content.pages.length;
  return (
    <div>
      <SectionHeader count={pageCount} label="pages" />
      {content.cover && (
        <div className="rounded-lg border border-border/40 p-3 bg-muted/20 mb-3">
          <p className="font-serif font-medium text-foreground text-sm">
            {content.cover.title}
          </p>
          {content.cover.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {content.cover.subtitle}
            </p>
          )}
        </div>
      )}
      <ol className="space-y-2">
        {content.pages.map((page, i) => (
          <li key={page.id} className="text-sm">
            <span className="text-muted-foreground/60 text-xs mr-1.5">
              {i + 1}.
            </span>
            <span className="text-muted-foreground">
              {page.text.length > 100
                ? page.text.slice(0, 100) + "..."
                : page.text}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const FORMAT_LABELS: Record<string, string> = {
  sticker_chart: "Sticker Chart",
  token_board: "Token Board",
  progress_tracker: "Progress Tracker",
};

function BehaviorChartPreview({ content }: { content: BehaviorChartContent }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        What&apos;s included ({FORMAT_LABELS[content.chartFormat] || content.chartFormat})
      </h4>
      <ul className="space-y-1.5 text-sm text-muted-foreground mb-3">
        <li>{content.behaviors.length} behaviors</li>
        {content.chartFormat === "sticker_chart" && content.columns && (
          <li>{content.columns} tracking columns</li>
        )}
        {content.chartFormat === "token_board" && content.totalSlots && (
          <li>{content.totalSlots} {content.tokenName || "token"} slots</li>
        )}
        {content.chartFormat === "progress_tracker" && content.levels && (
          <li>{content.levels.length} levels</li>
        )}
        <li>Reward: {content.reward.name}</li>
      </ul>
      <p className="text-xs text-muted-foreground/70 mb-2">Behaviors:</p>
      <ol className="space-y-1.5">
        {content.behaviors.map((b, i) => (
          <li key={b.id || i} className="text-sm">
            <span className="font-medium text-foreground">{b.name}</span>
            {b.description && (
              <span className="text-xs text-muted-foreground ml-1.5">
                — {b.description}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ColoringPagesPreview({ content }: { content: ColoringPagesContent }) {
  return (
    <div>
      <SectionHeader count={content.pages.length} label="pages" />
      <ol className="space-y-2">
        {content.pages.map((page, i) => (
          <li key={page.id} className="text-sm">
            <span className="text-muted-foreground/60 text-xs mr-1.5">
              {i + 1}.
            </span>
            <span className="font-medium text-foreground">{page.title}</span>
            {page.description && (
              <p className="text-xs text-muted-foreground mt-0.5 ml-4">
                {page.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
