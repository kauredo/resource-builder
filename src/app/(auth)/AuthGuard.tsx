"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function AuthGuard({
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
        <Loader2 className="size-8 animate-spin motion-reduce:animate-none text-coral" aria-label="Loading" />
      </div>
    );
  }

  // If authenticated, show nothing while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin motion-reduce:animate-none text-coral" aria-label="Redirecting to dashboard" />
      </div>
    );
  }

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
            className="size-8"
          />
          <span className="font-serif text-xl font-medium">Resource Builder</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
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
