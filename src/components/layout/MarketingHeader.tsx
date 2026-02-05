"use client";

import { useConvexAuth } from "convex/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

export function MarketingHeader() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <header>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50 safe-area-inset-top"
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-default hover:opacity-80"
          >
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-serif text-xl font-medium">
              Resource Builder
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Loading" />
            ) : isAuthenticated ? (
              <Button size="sm" className="btn-coral gap-1.5" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" className="btn-coral" asChild>
                  <Link href="/signup">Start free trial</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
