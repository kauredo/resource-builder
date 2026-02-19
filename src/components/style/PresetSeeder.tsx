"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { STYLE_PRESETS } from "@/lib/style-presets";

// Bump this when presets change to force re-seeding for all users
const PRESET_VERSION = 2;

/**
 * Automatically seeds style presets for users and keeps them up to date.
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
    if (!user?._id || userStyles === undefined || hasSeeded.current) return;

    const presets = userStyles.filter((s) => s.isPreset);
    const uniqueNames = new Set(presets.map((s) => s.name));
    const expectedNames = new Set(STYLE_PRESETS.map((p) => p.name));

    // Seed if: missing canonical presets, has duplicates, or version changed
    const hasDuplicates = uniqueNames.size !== presets.length;
    const missingPresets = [...expectedNames].some((name) => !uniqueNames.has(name));
    const lastVersion = Number(localStorage.getItem(`preset-v-${user._id}`) ?? "0");
    const needsSeeding = hasDuplicates || missingPresets || lastVersion < PRESET_VERSION;

    if (needsSeeding) {
      hasSeeded.current = true;
      seedPresets({ userId: user._id })
        .then(() => localStorage.setItem(`preset-v-${user._id}`, String(PRESET_VERSION)))
        .catch(console.error);
    }
  }, [user?._id, userStyles, seedPresets]);

  return null;
}
