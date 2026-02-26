"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SubscriptionStatus } from "@/components/settings/SubscriptionStatus";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function BillingPage() {
  const user = useQuery(api.users.currentUser);
  const limits = useQuery(api.users.getSubscriptionLimits);
  const searchParams = useSearchParams();
  const router = useRouter();
  const justUpgraded = searchParams.get("upgraded") === "true";

  // Clean up ?upgraded=true from URL once subscription is confirmed active
  useEffect(() => {
    if (justUpgraded && user?.subscription === "pro") {
      router.replace("/dashboard/settings/billing", { scroll: false });
    }
  }, [justUpgraded, user?.subscription, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin motion-reduce:animate-none text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show confirmation banner when returning from checkout */}
      {justUpgraded && user.subscription !== "pro" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status">
          <div className="flex items-center gap-2">
            <Loader2
              className="size-4 animate-spin motion-reduce:animate-none text-amber-600"
              aria-hidden="true"
            />
            <p className="text-sm text-amber-800">
              Processing your payment&hellip; This page will update
              automatically.
            </p>
          </div>
        </div>
      )}

      {justUpgraded && user.subscription === "pro" && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3" role="status">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="size-4 text-green-600"
              aria-hidden="true"
            />
            <p className="text-sm text-green-800">
              You&apos;re all set! Your Pro plan is now active.
            </p>
          </div>
        </div>
      )}

      <SettingsSection
        title="Subscription"
        description="Manage your plan and billing."
      >
        <SubscriptionStatus
          subscription={user.subscription}
          email={user.email}
          name={user.name}
          dodoCustomerId={user.dodoCustomerId}
          limits={limits}
        />
      </SettingsSection>
    </div>
  );
}
