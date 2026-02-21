import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";
import { Paintbrush } from "lucide-react";

interface ResourceStyleBadgeProps {
  styleId: Id<"styles">;
  styleName: string;
}

export function ResourceStyleBadge({ styleId, styleName }: ResourceStyleBadgeProps) {
  return (
    <Link
      href={`/dashboard/styles/${styleId}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors duration-150 motion-reduce:transition-none w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
    >
      <Paintbrush className="size-3" aria-hidden="true" />
      {styleName}
    </Link>
  );
}
