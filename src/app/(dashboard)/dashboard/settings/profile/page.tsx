"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { AvatarPicker } from "@/components/settings/AvatarPicker";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const user = useQuery(api.users.currentUserWithAvatar);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin motion-reduce:animate-none text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsSection title="Avatar" description="Choose how you appear in the app.">
        <AvatarPicker
          userId={user._id}
          avatarUrl={user.avatarUrl}
          avatarCharacterId={user.avatarCharacterId}
        />
      </SettingsSection>

      <SettingsSection title="Profile" description="Your personal information.">
        <ProfileForm name={user.name} email={user.email} />
      </SettingsSection>
    </div>
  );
}
