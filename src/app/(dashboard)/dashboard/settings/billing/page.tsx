"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SubscriptionStatus } from "@/components/settings/SubscriptionStatus";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
  const user = useQuery(api.users.currentUser);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Subscription"
        description="Manage your plan and billing."
      >
        <SubscriptionStatus
          subscription={user.subscription}
          trialEndsAt={user.trialEndsAt}
        />
      </SettingsSection>
    </div>
  );
}
