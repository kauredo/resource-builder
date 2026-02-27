"use client";

import { useConvexAuth } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { PresetGuard } from "@/components/style/PresetGuard";
import { UserDropdown } from "@/components/layout/UserDropdown";
import { LogOut, Loader2, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/resources", label: "Library" },
  { href: "/dashboard/characters", label: "Characters" },
  { href: "/dashboard/styles", label: "Styles" },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin motion-reduce:animate-none text-coral" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ensure shared system presets exist */}
      <PresetGuard />

      {/* Navigation */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-default hover:opacity-80"
            >
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="size-8"
              />
              <span className="font-serif text-xl font-medium">
                Resource Builder
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                    isActive(link.href, link.exact)
                      ? "bg-coral/10 text-coral"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-current={isActive(link.href, link.exact) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* User Dropdown - Desktop */}
              <div className="hidden sm:block">
                <UserDropdown />
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav
          id="mobile-menu"
          className={`md:hidden border-t border-border bg-card/95 backdrop-blur-sm overflow-hidden transition-[max-height,opacity] duration-200 ease-out motion-reduce:transition-none ${
            mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 border-t-0"
          }`}
          aria-label="Mobile navigation"
          aria-hidden={!mobileMenuOpen}
        >
          <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 ${
                    isActive(link.href, link.exact)
                      ? "bg-coral/10 text-coral"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-current={isActive(link.href, link.exact) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 motion-reduce:transition-none ${
                  pathname.startsWith("/dashboard/settings")
                    ? "bg-coral/10 text-coral"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Settings
              </Link>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </nav>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
