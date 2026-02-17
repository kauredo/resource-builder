"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
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
        title="Delete account"
        description="Permanently delete your account and all associated data. This cannot be undone."
      >
        <DeleteAccountDialog email={user.email} />
      </SettingsSection>
    </div>
  );
}
