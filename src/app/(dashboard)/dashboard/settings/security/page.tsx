"use client";

import { SettingsSection } from "@/components/settings/SettingsSection";
import { PasswordForm } from "@/components/settings/PasswordForm";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Change password"
        description="Update the password you use to sign in."
      >
        <PasswordForm />
      </SettingsSection>
    </div>
  );
}
