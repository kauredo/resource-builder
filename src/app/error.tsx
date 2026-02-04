"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-default hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-serif text-xl font-medium">Resource Builder</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          {/* Calm emotion card - suggesting "take a breath, it's okay" */}
          <div className="relative mx-auto mb-8 w-40 h-52">
            <div
              className="absolute inset-0 rounded-2xl shadow-lg flex flex-col overflow-hidden"
              style={{ backgroundColor: "#6B9080" }}
            >
              <div className="flex-1 flex items-center justify-center p-4">
                <Image
                  src="/images/cards/calm.png"
                  alt="Calm emotion card illustration"
                  width={112}
                  height={112}
                  className="w-28 h-28 object-contain"
                />
              </div>
              <div className="px-4 pb-4">
                <span
                  className="block text-center text-sm font-semibold tracking-wide"
                  style={{
                    color: "white",
                    textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  }}
                >
                  Oops
                </span>
              </div>
            </div>
            {/* Subtle rotation for visual interest */}
            <div
              className="absolute -inset-2 rounded-2xl bg-teal/10 -z-10 rotate-2"
              aria-hidden="true"
            />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium mb-3 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Don&apos;t worry, these things happen. Let&apos;s try that again or
            head back to safety.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={reset} className="btn-coral">
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="size-4" aria-hidden="true" />
                Go home
              </Link>
            </Button>
          </div>

          {/* Error digest for support */}
          {error.digest && (
            <p className="mt-8 text-xs text-muted-foreground/60">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Problem persists?{" "}
          <a
            href="mailto:support@resourcebuilder.app"
            className="text-foreground underline underline-offset-4 hover:text-coral transition-colors"
          >
            Contact support
          </a>
        </p>
      </footer>
    </div>
  );
}
