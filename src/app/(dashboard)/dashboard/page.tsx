"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // Calculate trial days remaining
  const trialDaysRemaining = user?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((user.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section - Much larger, more dominant */}
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
            <span className="mx-1">·</span>
            <Link
              href="/dashboard/settings/billing"
              className="text-coral hover:underline underline-offset-4"
            >
              Upgrade
            </Link>
          </p>
        )}
      </div>

      {/* Hero Action - Create Emotion Cards (3x larger, different treatment) */}
      <section className="mb-12">
        <Link href="/dashboard/resources/new/emotion-cards" className="block group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coral/5 via-coral/10 to-teal/5 border border-coral/20 p-8 sm:p-10 transition-all hover:border-coral/40 hover:shadow-lg">
            {/* Decorative cards in background */}
            <div className="absolute -right-8 -top-8 sm:right-4 sm:top-4 opacity-20 group-hover:opacity-30 transition-opacity" aria-hidden="true">
              <div className="flex gap-2 rotate-12">
                <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-xl bg-coral/40" />
                <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-xl bg-teal/40 -mt-4" />
                <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-xl bg-primary/20 mt-2" />
              </div>
            </div>

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-coral/20 flex items-center justify-center mb-5 group-hover:bg-coral/30 group-hover:scale-105 transition-transform duration-200 ease-out">
                <Plus className="size-7 text-coral" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-2">
                Create Emotion Cards
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Generate a beautiful deck of emotion cards for your therapy sessions.
                AI illustrations that match your style.
              </p>
              <span className="inline-flex items-center gap-2 text-coral font-medium group-hover:gap-3 transition-all duration-200 ease-out">
                Start creating
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Secondary Actions - Smaller, different layout */}
      <section className="mb-12">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Also available
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/styles" className="group">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-teal/40 hover:bg-teal/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center shrink-0 group-hover:bg-teal/20 transition-colors">
                <Palette className="size-5 text-teal" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium group-hover:text-teal transition-colors">Manage Styles</h3>
                <p className="text-sm text-muted-foreground truncate">
                  Colors, fonts, illustration styles
                </p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/characters" className="group">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Users className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium group-hover:text-primary transition-colors">Create Characters</h3>
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
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Empty State */}
        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileStack className="size-6 text-muted-foreground/60" aria-hidden="true" />
            </div>
            <h3 className="font-medium text-foreground/80 mb-1">No resources yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs">
              Your emotion card decks and other materials will appear here.
            </p>
            <Button asChild size="sm" className="btn-coral">
              <Link href="/dashboard/resources/new/emotion-cards">
                <Plus className="size-4" aria-hidden="true" />
                Create your first deck
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
