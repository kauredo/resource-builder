"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Ensures shared system presets exist. Calls seedSystemPresets once if none found.
 * Renders nothing.
 */
export function PresetGuard() {
  const user = useQuery(api.users.currentUser);
  const userStyles = useQuery(
    api.styles.getUserStyles,
    user?._id ? { userId: user._id } : "skip"
  );
  const seedPresets = useMutation(api.styles.seedSystemPresets);
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (!user?._id || userStyles === undefined || hasSeeded.current) return;

    const hasPresets = userStyles.some((s) => s.isPreset);
    if (!hasPresets) {
      hasSeeded.current = true;
      seedPresets({}).catch(console.error);
    }
  }, [user?._id, userStyles, seedPresets]);

  return null;
}
