"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionLimits {
  subscription: "free" | "pro";
  limits: { styles: number; characters: number; resourcesPerMonth: number };
  usage: { styles: number; characters: number; resourcesThisMonth: number };
  canCreate: { style: boolean; character: boolean; resource: boolean };
}

interface SubscriptionStatusProps {
  subscription: "free" | "pro";
  email: string;
  name: string;
  dodoCustomerId?: string;
  limits: SubscriptionLimits | null | undefined;
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const percentage = Math.min(100, max > 0 ? (used / max) * 100 : 0);
  const atLimit = used >= max;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={atLimit ? "font-medium text-amber-700" : "text-muted-foreground"}>
          {used}/{max}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${used} of ${max} used`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${
            atLimit ? "bg-amber-500" : "bg-coral"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function SubscriptionStatus({
  subscription,
  email,
  name,
  dodoCustomerId,
  limits,
}: SubscriptionStatusProps) {
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "annual" | null>(null);

  async function handleUpgrade(plan: "monthly" | "annual") {
    if (loadingPlan) return;
    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, plan }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      if (data.payment_link) {
        window.location.href = data.payment_link;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

  function handleManageSubscription() {
    if (!dodoCustomerId) return;
    window.open(
      `/api/customer-portal?customer_id=${encodeURIComponent(dodoCustomerId)}`,
      "_blank",
    );
  }

  if (subscription === "pro") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Pro
          </span>
          <span className="text-sm text-muted-foreground">
            You have full access to all features.
          </span>
        </div>
        {dodoCustomerId && (
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleManageSubscription}
          >
            Manage subscription
          </Button>
        )}
      </div>
    );
  }

  // Free tier
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Free
        </span>
      </div>

      {/* Usage bars */}
      {limits && (
        <div className="space-y-3">
          <UsageBar
            label="Resources this month"
            used={limits.usage.resourcesThisMonth}
            max={limits.limits.resourcesPerMonth}
          />
          <UsageBar
            label="Custom styles"
            used={limits.usage.styles}
            max={limits.limits.styles}
          />
          <UsageBar
            label="Characters"
            used={limits.usage.characters}
            max={limits.limits.characters}
          />
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="rounded-lg border border-coral/20 bg-coral/5 p-4 space-y-3">
        <div>
          <p className="font-medium text-foreground">Upgrade to Pro</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unlimited resources, styles, characters, and clean PDF exports.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-coral text-white hover:bg-coral/90 cursor-pointer"
            onClick={() => handleUpgrade("monthly")}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === "monthly" && (
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none mr-2"
                aria-hidden="true"
              />
            )}
            $19/month
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => handleUpgrade("annual")}
            disabled={loadingPlan !== null}
          >
            {loadingPlan === "annual" && (
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none mr-2"
                aria-hidden="true"
              />
            )}
            $15/month (billed annually)
          </Button>
        </div>
      </div>
    </div>
  );
}
