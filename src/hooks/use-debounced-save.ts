import { useCallback, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved";

interface UseDebouncedSaveOptions<T extends Record<string, unknown>> {
  onSave: (updates: Partial<T>) => Promise<void>;
  delay?: number;
  savedDuration?: number;
}

/**
 * Hook for debounced auto-save with status tracking.
 * Manages local state, debounce timers, and save status in one place.
 */
export function useDebouncedSave<T extends Record<string, unknown>>({
  onSave,
  delay = 500,
  savedDuration = 2000,
}: UseDebouncedSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (updates: Partial<T>) => {
      setSaveStatus("saving");
      try {
        await onSave(updates);
        setSaveStatus("saved");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(
          () => setSaveStatus("idle"),
          savedDuration,
        );
      } catch (error) {
        console.error("Failed to save:", error);
        setSaveStatus("idle");
      }
    },
    [onSave, savedDuration],
  );

  const debouncedSave = useCallback(
    (updates: Partial<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        save(updates);
      }, delay);
    },
    [save, delay],
  );

  return { saveStatus, debouncedSave };
}
