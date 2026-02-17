"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-coral" aria-label="Loading" />
      </div>
    );
  }

  // If authenticated, show nothing while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-coral" aria-label="Redirecting to dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-teal/5" />

        {/* Floating shapes - subtle emotion card hints */}
        <div className="absolute top-1/4 -left-16 w-32 h-40 rounded-2xl bg-coral/10 rotate-12 blur-sm" />
        <div className="absolute top-1/3 -right-12 w-28 h-36 rounded-2xl bg-teal/10 -rotate-6 blur-sm" />
        <div className="absolute bottom-1/4 left-1/4 w-24 h-32 rounded-2xl bg-primary/5 rotate-3 blur-sm" />

        {/* Soft circles */}
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-coral/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-48 h-48 rounded-full bg-teal/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="w-full px-6 py-4 relative">
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
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center relative">
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
