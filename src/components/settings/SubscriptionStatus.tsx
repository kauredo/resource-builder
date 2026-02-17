"use client";

import { Button } from "@/components/ui/button";

interface SubscriptionStatusProps {
  subscription: "trial" | "active" | "expired";
  trialEndsAt?: number;
}

export function SubscriptionStatus({
  subscription,
  trialEndsAt,
}: SubscriptionStatusProps) {
  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-4">
      {subscription === "trial" && (
        <>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Trial
            </span>
            <span className="text-sm text-muted-foreground">
              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            When your trial ends, you&apos;ll still be able to view your
            resources but won&apos;t be able to create new ones.
          </p>
          <Button className="bg-coral text-white hover:bg-coral/90">
            Upgrade now
          </Button>
        </>
      )}

      {subscription === "active" && (
        <>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Active
            </span>
            <span className="text-sm text-muted-foreground">Pro plan</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You have full access to all features.
          </p>
        </>
      )}

      {subscription === "expired" && (
        <>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              Expired
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your trial has ended. Upgrade to continue creating new resources.
          </p>
          <Button className="bg-coral text-white hover:bg-coral/90">
            Upgrade now
          </Button>
        </>
      )}
    </div>
  );
}
