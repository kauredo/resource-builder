"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Automatically seeds style presets for users and cleans up duplicates.
 * This ensures all users have exactly 6 default presets with no duplicates.
 * Renders nothing - just handles the seeding logic.
 */
export function PresetSeeder() {
  const user = useQuery(api.users.currentUser);
  const userStyles = useQuery(
    api.styles.getUserStyles,
    user?._id ? { userId: user._id } : "skip"
  );
  const seedPresets = useMutation(api.styles.seedUserPresets);
  const hasSeeded = useRef(false);

  useEffect(() => {
    // Only run once per mount, only if user exists and styles have loaded
    if (!user?._id || userStyles === undefined || hasSeeded.current) return;

    // Check if user needs seeding:
    // - Missing presets (< 6)
    // - Or has duplicates (more presets than unique names)
    const presets = userStyles.filter((s) => s.isPreset);
    const uniqueNames = new Set(presets.map((s) => s.name));
    const needsSeeding = presets.length !== 6 || uniqueNames.size !== presets.length;

    if (needsSeeding) {
      hasSeeded.current = true;
      seedPresets({ userId: user._id }).catch(console.error);
    }
  }, [user?._id, userStyles, seedPresets]);

  return null;
}
