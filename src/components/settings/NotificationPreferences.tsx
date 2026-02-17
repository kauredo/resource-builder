"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "rb-notification-prefs";

interface Preferences {
  resourceComplete: boolean;
  trialReminders: boolean;
  tips: boolean;
}

const defaults: Preferences = {
  resourceComplete: true,
  trialReminders: true,
  tips: true,
};

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const update = (key: keyof Preferences, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id="notif-resource"
            checked={prefs.resourceComplete}
            onCheckedChange={(v) => update("resourceComplete", v === true)}
          />
          <div className="space-y-0.5">
            <Label htmlFor="notif-resource" className="text-sm font-medium">
              Resource completion
            </Label>
            <p className="text-xs text-muted-foreground">
              Notify when a resource finishes generating.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="notif-trial"
            checked={prefs.trialReminders}
            onCheckedChange={(v) => update("trialReminders", v === true)}
          />
          <div className="space-y-0.5">
            <Label htmlFor="notif-trial" className="text-sm font-medium">
              Trial reminders
            </Label>
            <p className="text-xs text-muted-foreground">
              Reminders about your trial status.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="notif-tips"
            checked={prefs.tips}
            onCheckedChange={(v) => update("tips", v === true)}
          />
          <div className="space-y-0.5">
            <Label htmlFor="notif-tips" className="text-sm font-medium">
              Tips & suggestions
            </Label>
            <p className="text-xs text-muted-foreground">
              Helpful tips on getting the most from your resources.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground pt-2">
        Email notifications are coming soon. These preferences are saved locally
        for now.
      </p>
    </div>
  );
}
