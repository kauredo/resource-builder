"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { StyleCard } from "@/components/style/StyleCard";
import {
  Plus,
  Palette,
  FileStack,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { StyleFrames } from "@/types";

export default function DashboardPage() {
  const user = useQuery(api.users.currentUser);
  const styles = useQuery(
    api.styles.getUserStyles,
    user?._id ? { userId: user._id } : "skip",
  );
  const resources = useQuery(
    api.resources.getUserResources,
    user?._id ? { userId: user._id, limit: 6 } : "skip"
  );

  // Calculate trial days remaining
  const trialDaysRemaining = user?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((user.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  const isResourcesLoading = resources === undefined;
  const hasResources = (resources?.length ?? 0) > 0;
  const hasStyles = (styles?.length ?? 0) > 0;
  const customStyles = styles?.filter((s) => !s.isPreset) ?? [];

  return (
    <>
      {/* Welcome modal for first-time users */}
      <WelcomeModal
        userName={user?.name}
        hasResources={hasResources ?? false}
        userId={user?._id}
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
                className="text-coral hover:underline underline-offset-4 transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                Upgrade
              </Link>
            </p>
          )}
        </div>

        {/* Recent Resources — primary workspace */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Recent resources
            </h2>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" className="btn-coral gap-1.5">
                <Link href="/dashboard/resources/new">
                  <Plus className="size-3.5" aria-hidden="true" />
                  Create Resource
                </Link>
              </Button>
              <Link
                href="/dashboard/resources"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors duration-150 motion-reduce:transition-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                View all
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {isResourcesLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              aria-hidden="true"
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/50 bg-card p-4 animate-pulse motion-reduce:animate-none"
                >
                  <div className="h-32 rounded-xl bg-muted mb-4" />
                  <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : !hasResources ? (
            <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30">
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="size-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
                  <FileStack className="size-6 text-coral/70" aria-hidden="true" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  Ready to create your first resource?
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
                  Pick a style and build print-ready materials in minutes.
                </p>
                <Button asChild className="btn-coral gap-2">
                  <Link href="/dashboard/resources/new">
                    <Plus className="size-4" aria-hidden="true" />
                    Create Resource
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    id={resource._id}
                    name={resource.name}
                    type={resource.type}
                    status={resource.status}
                    itemCount={resource.assetCount ?? resource.images.length}
                    updatedAt={resource.updatedAt}
                    thumbnailUrl={resource.thumbnailUrl}
                  />
                ))}
            </div>
          )}
        </section>

        {/* Your Styles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Your styles
            </h2>
            <Link
              href="/dashboard/styles"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors duration-150 motion-reduce:transition-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {styles === undefined ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              aria-hidden="true"
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <div className="h-3 bg-muted animate-pulse motion-reduce:animate-none" />
                  <div className="px-4 py-5 border border-t-0 border-border/50 rounded-b-lg bg-card">
                    <div className="h-5 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
                    <div className="h-4 w-40 bg-muted rounded animate-pulse motion-reduce:animate-none mb-8" />
                    <div className="flex gap-2">
                      <div className="h-4 w-14 bg-muted rounded animate-pulse motion-reduce:animate-none" />
                      <div className="h-4 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !hasStyles ? (
            <Link
              href="/dashboard/styles"
              className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-4 rounded-xl border border-coral/20 bg-coral/5 px-5 py-4 transition-[border-color] duration-200 ease-out hover:border-coral/40 motion-reduce:transition-none">
                <div className="size-10 rounded-xl bg-coral/15 flex items-center justify-center shrink-0">
                  <Palette className="size-5 text-coral" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">Create your first style</p>
                  <p className="text-sm text-muted-foreground">Define colors, typography, and illustration style for consistent resources.</p>
                </div>
                <ArrowRight className="size-4 text-coral shrink-0" aria-hidden="true" />
              </div>
            </Link>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(customStyles.length > 0 ? customStyles : styles)
                .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
                .slice(0, 6)
                .map((style) => (
                  <StyleCard
                    key={style._id}
                    id={style._id}
                    name={style.name}
                    isPreset={style.isPreset}
                    colors={style.colors}
                    typography={style.typography}
                    illustrationStyle={style.illustrationStyle}
                    frames={style.frames as StyleFrames | undefined}
                    updatedAt={style.updatedAt ?? style.createdAt}
                  />
                ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
