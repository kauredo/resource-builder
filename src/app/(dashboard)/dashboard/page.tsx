"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import {
  Plus,
  Palette,
  Users,
  FileStack,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const user = useQuery(api.users.currentUser);
  const resources = useQuery(
    api.resources.getUserResources,
    user?._id ? { userId: user._id } : "skip"
  );

  // Calculate trial days remaining
  const trialDaysRemaining = user?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((user.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  const hasResources = resources && resources.length > 0;

  return (
    <>
      {/* Welcome modal for first-time users */}
      <WelcomeModal
        userName={user?.name}
        hasResources={hasResources ?? false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-3 tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-lg text-muted-foreground">
            What will you create today?
          </p>
          {/* Trial status - subtle inline mention */}
          {user?.subscription === "trial" && trialDaysRemaining > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              <Clock className="size-3.5 inline-block mr-1.5 text-muted-foreground/70" aria-hidden="true" />
              <span>{trialDaysRemaining} days left in trial</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <Link
                href="/dashboard/settings/billing"
                className="text-coral hover:underline underline-offset-4 transition-colors duration-150"
              >
                Upgrade
              </Link>
            </p>
          )}
        </div>

        {/* Hero Action - Create Emotion Cards */}
        <section className="mb-12">
          <Link
            href="/dashboard/resources/new/emotion-cards"
            className="block group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coral/5 via-coral/10 to-teal/5 border border-coral/20 p-8 sm:p-10 transition-all duration-200 ease-out hover:border-coral/40 hover:shadow-lg motion-reduce:transition-none">
              {/* Decorative cards in background */}
              <div className="absolute -right-8 -top-8 sm:right-4 sm:top-4 opacity-20 group-hover:opacity-30 transition-opacity duration-200 motion-reduce:transition-none" aria-hidden="true">
                <div className="flex gap-2 rotate-12">
                  <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-xl bg-coral/40" />
                  <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-xl bg-teal/40 -mt-4" />
                  <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-xl bg-primary/20 mt-2" />
                </div>
              </div>

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-coral/20 flex items-center justify-center mb-5 group-hover:bg-coral/30 group-hover:scale-105 transition-all duration-200 ease-out motion-reduce:group-hover:scale-100 motion-reduce:transition-none">
                  <Plus className="size-7 text-coral" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-2">
                  Create Emotion Cards
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Generate a beautiful deck of emotion cards for your therapy sessions.
                  AI illustrations that match your style.
                </p>
                <span className="inline-flex items-center gap-2 text-coral font-medium group-hover:gap-3 transition-all duration-200 ease-out motion-reduce:group-hover:gap-2 motion-reduce:transition-none">
                  Start creating
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Secondary Actions */}
        <section className="mb-12">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Also available
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/styles"
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-teal/40 hover:bg-teal/5 transition-colors duration-150 motion-reduce:transition-none">
                <div className="size-12 rounded-xl bg-teal/10 flex items-center justify-center shrink-0 group-hover:bg-teal/20 transition-colors duration-150 motion-reduce:transition-none">
                  <Palette className="size-5 text-teal" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium group-hover:text-teal transition-colors duration-150">Manage Styles</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    Colors, fonts, illustration styles
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/characters"
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors duration-150 motion-reduce:transition-none">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors duration-150 motion-reduce:transition-none">
                  <Users className="size-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium group-hover:text-primary transition-colors duration-150">Create Characters</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    Consistent characters for materials
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Resources */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Recent resources
            </h2>
            <Link
              href="/dashboard/resources"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Empty State */}
          {!hasResources ? (
            <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30">
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="size-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
                  <FileStack className="size-6 text-coral/70" aria-hidden="true" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  Ready to create your first deck?
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
                  Choose a style, pick emotions, and AI generates matching
                  illustrations — all in a few minutes.
                </p>
                <Button asChild className="btn-coral gap-2">
                  <Link href="/dashboard/resources/new/emotion-cards">
                    <Plus className="size-4" aria-hidden="true" />
                    Create Emotion Cards
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card">
              {/* TODO: List actual resources when they exist */}
              <div className="p-6 text-center text-muted-foreground">
                Your resources will appear here.
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
