"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Download, Pencil, Trash2, Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export function DetailPageSkeleton() {
  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
            <div className="h-9 w-24 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            <div className="h-9 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            <div className="size-9 bg-muted rounded animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="aspect-[4/3] bg-muted animate-pulse motion-reduce:animate-none" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DetailPageHeaderProps {
  resourceId: Id<"resources">;
  resourceName: string;
  subtitle: React.ReactNode;
  onExport: () => void;
  exportDisabled?: boolean;
  deleteTitle: string;
  onDelete: () => void;
  isDeleting: boolean;
}

export function DetailPageHeader({
  resourceId,
  resourceName,
  subtitle,
  onExport,
  exportDisabled,
  deleteTitle,
  onDelete,
  isDeleting,
}: DetailPageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/dashboard/resources"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-150 mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Resources
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
            {resourceName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="btn-coral gap-1.5 cursor-pointer"
            disabled={exportDisabled}
            onClick={onExport}
          >
            <Download className="size-4" aria-hidden="true" />
            Export
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/resources/${resourceId}/edit`}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this resource and its assets.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
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
        </div>
      </div>
    </div>
  );
}
