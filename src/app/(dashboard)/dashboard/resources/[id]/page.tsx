"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { EmotionCardsDetail } from "@/components/resource/emotion-cards/EmotionCardsDetail";
import { PosterDetail } from "@/components/resource/poster/PosterDetail";
import { FlashcardsDetail } from "@/components/resource/flashcards/FlashcardsDetail";
import { WorksheetDetail } from "@/components/resource/worksheet/WorksheetDetail";
import { BoardGameDetail } from "@/components/resource/board-game/BoardGameDetail";
import { CardGameDetail } from "@/components/resource/card-game/CardGameDetail";
import { FreePromptDetail } from "@/components/resource/free-prompt/FreePromptDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResourceDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const resourceId = resolvedParams.id as Id<"resources">;
  const resource = useQuery(api.resources.getResource, { resourceId });

  if (resource === undefined) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="status"
        aria-label="Loading resource"
      >
        <div className="mb-8" aria-hidden="true">
          <div className="h-4 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="h-9 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="size-9 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </div>
        <div className="h-4 w-40 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4" aria-hidden="true" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="p-3">
                <div className="h-4 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (resource === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h1 className="font-serif text-2xl font-medium mb-2">
            Resource not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This resource may have been deleted or doesn&apos;t exist.
          </p>
          <Button asChild className="btn-coral">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  switch (resource.type) {
    case "emotion_cards":
      return <EmotionCardsDetail resourceId={resourceId} />;
    case "poster":
      return <PosterDetail resourceId={resourceId} />;
    case "flashcards":
      return <FlashcardsDetail resourceId={resourceId} />;
    case "worksheet":
      return <WorksheetDetail resourceId={resourceId} />;
    case "board_game":
      return <BoardGameDetail resourceId={resourceId} />;
    case "card_game":
      return <CardGameDetail resourceId={resourceId} />;
    case "free_prompt":
      return <FreePromptDetail resourceId={resourceId} />;
    default:
      return null;
  }
}
