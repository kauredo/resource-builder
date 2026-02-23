"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  name: string;
  email: string;
}

export function ProfileForm({ name: initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const updateName = useMutation(api.users.updateUserName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === initialName) return;
    setSaving(true);
    try {
      await updateName({ name: trimmed });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isDirty = name.trim() !== initialName;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" value={email} disabled className="opacity-60" />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed.
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="bg-coral text-white hover:bg-coral/90"
        >
          {saved ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Saved
            </>
          ) : saving ? (
            "Saving..."
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}
