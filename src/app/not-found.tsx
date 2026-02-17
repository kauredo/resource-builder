"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
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
          {/* Sad emotion card */}
          <div className="relative mx-auto mb-8 w-40 h-52">
            <div
              className="absolute inset-0 rounded-2xl shadow-lg flex flex-col overflow-hidden"
              style={{ backgroundColor: "#5390D9" }}
            >
              <div className="flex-1 flex items-center justify-center p-4">
                <Image
                  src="/images/cards/sad.png"
                  alt="Sad emotion card illustration"
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
                  404
                </span>
              </div>
            </div>
            {/* Subtle rotation for visual interest */}
            <div
              className="absolute -inset-2 rounded-2xl bg-coral/10 -z-10 -rotate-3"
              aria-hidden="true"
            />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium mb-3 tracking-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            We couldn&apos;t find what you were looking for. The page may have
            been moved or doesn&apos;t exist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="btn-coral">
              <Link href="/">
                <Home className="size-4" aria-hidden="true" />
                Go home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Go back
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <a
            href="mailto:support@basketballstatsapp.com"
            className="text-foreground underline underline-offset-4 hover:text-coral transition-colors"
          >
            Contact support
          </a>
        </p>
      </footer>
    </div>
  );
}
