/**
 * Google Font loading utilities for browser previews
 *
 * Provides dynamic font loading so style previews show actual fonts.
 */

import { useEffect, useState } from "react";

/**
 * All supported fonts with their Google Fonts API parameters
 * Format: "FontName:wght@weights"
 */
export const GOOGLE_FONT_FAMILIES: Record<string, string> = {
  // Heading fonts
  Nunito: "Nunito:wght@400;600;700",
  Quicksand: "Quicksand:wght@400;500;600;700",
  Poppins: "Poppins:wght@400;500;600;700",
  Merriweather: "Merriweather:wght@400;700",
  "Baloo 2": "Baloo+2:wght@400;500;600;700",
  Fredoka: "Fredoka:wght@400;500;600;700",
  // Legacy alias for old styles that have "Fredoka One" saved
  "Fredoka One": "Fredoka:wght@400;500;600;700",
  Comfortaa: "Comfortaa:wght@400;500;600;700",
  Pacifico: "Pacifico",

  // Body fonts
  "Open Sans": "Open+Sans:wght@400;500;600;700",
  Lato: "Lato:wght@400;700",
  Inter: "Inter:wght@400;500;600;700",
  "Source Sans Pro": "Source+Sans+Pro:wght@400;600;700",
  Rubik: "Rubik:wght@400;500;600;700",
  Roboto: "Roboto:wght@400;500;700",
  "Nunito Sans": "Nunito+Sans:wght@400;600;700",
  "Work Sans": "Work+Sans:wght@400;500;600;700",
};

/**
 * Construct Google Fonts CSS URL for a font
 */
export function getGoogleFontCssUrl(fontName: string): string | null {
  const fontParam = GOOGLE_FONT_FAMILIES[fontName];
  if (!fontParam) return null;

  return `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
}

/**
 * Construct Google Fonts CSS URL for multiple fonts
 */
export function getGoogleFontsCssUrl(fontNames: string[]): string | null {
  const validFonts = fontNames
    .map((name) => GOOGLE_FONT_FAMILIES[name])
    .filter(Boolean);

  if (validFonts.length === 0) return null;

  return `https://fonts.googleapis.com/css2?${validFonts.map((f) => `family=${f}`).join("&")}&display=swap`;
}

// Track which fonts are already loaded to avoid duplicate loading
const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();

/**
 * Load a Google Font by injecting a link element
 */
async function loadFont(fontName: string): Promise<void> {
  // Already loaded
  if (loadedFonts.has(fontName)) {
    return;
  }

  // Currently loading - wait for it
  const existingLoad = loadingFonts.get(fontName);
  if (existingLoad) {
    return existingLoad;
  }

  const url = getGoogleFontCssUrl(fontName);
  if (!url) {
    console.warn(`Unknown font: ${fontName}`);
    return;
  }

  const loadPromise = new Promise<void>((resolve, reject) => {
    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
      loadedFonts.add(fontName);
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;

    link.onload = () => {
      loadedFonts.add(fontName);
      loadingFonts.delete(fontName);
      resolve();
    };

    link.onerror = () => {
      loadingFonts.delete(fontName);
      reject(new Error(`Failed to load font: ${fontName}`));
    };

    document.head.appendChild(link);
  });

  loadingFonts.set(fontName, loadPromise);
  return loadPromise;
}

/**
 * Hook to load a Google Font and return loading state
 *
 * @param fontName - The font name to load (e.g., "Nunito", "Poppins")
 * @returns Whether the font has finished loading
 */
export function useGoogleFont(fontName: string): boolean {
  const [isLoaded, setIsLoaded] = useState(() => loadedFonts.has(fontName));

  useEffect(() => {
    if (!fontName || loadedFonts.has(fontName)) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    loadFont(fontName)
      .then(() => setIsLoaded(true))
      .catch((error) => {
        console.error(error);
        // Still mark as "loaded" to prevent infinite retries
        setIsLoaded(true);
      });
  }, [fontName]);

  return isLoaded;
}

/**
 * Hook to load multiple Google Fonts
 *
 * @param fontNames - Array of font names to load
 * @returns Whether all fonts have finished loading
 */
export function useGoogleFonts(fontNames: string[]): boolean {
  const [allLoaded, setAllLoaded] = useState(() =>
    fontNames.every((name) => loadedFonts.has(name))
  );

  useEffect(() => {
    if (fontNames.length === 0) {
      setAllLoaded(true);
      return;
    }

    if (fontNames.every((name) => loadedFonts.has(name))) {
      setAllLoaded(true);
      return;
    }

    setAllLoaded(false);

    Promise.all(fontNames.map((name) => loadFont(name)))
      .then(() => setAllLoaded(true))
      .catch((error) => {
        console.error(error);
        setAllLoaded(true);
      });
  }, [fontNames]);

  return allLoaded;
}

/**
 * Preload fonts without React hooks (useful for SSR or initialization)
 */
export function preloadFonts(fontNames: string[]): Promise<void[]> {
  return Promise.all(fontNames.map((name) => loadFont(name)));
}
