/**
 * PDF font registration for @react-pdf/renderer
 *
 * Registers custom Google Fonts for use in PDF generation.
 * Uses static TTF URLs from Google Fonts CDN (fonts.gstatic.com).
 */

import { Font } from "@react-pdf/renderer";

/**
 * Font configuration with TTF URLs for @react-pdf
 *
 * Note: These URLs point to Google Fonts static files.
 * The URLs are relatively stable but may change with font updates.
 */
export const PDF_FONT_CONFIG: Record<
  string,
  {
    family: string;
    fonts: Array<{
      src: string;
      fontWeight?: number | "normal" | "bold";
      fontStyle?: "normal" | "italic";
    }>;
  }
> = {
  Nunito: {
    family: "Nunito",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTQ3j6zbXWjgeg.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTo3j6zbXWjgeg.ttf",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdRM3j6zbXWjgeg.ttf",
        fontWeight: 700,
      },
    ],
  },
  Quicksand: {
    family: "Quicksand",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/quicksand/v31/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkP8o58a-wg.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/quicksand/v31/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkBEo58a-wg.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/quicksand/v31/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkM0v58a-wg.ttf",
        fontWeight: 700,
      },
    ],
  },
  Poppins: {
    family: "Poppins",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrFJA.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6V1g.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7V1g.ttf",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9V1g.ttf",
        fontWeight: 700,
      },
    ],
  },
  Merriweather: {
    family: "Merriweather",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5OeyxNV-bnrw.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNpX837pvjxPA.ttf",
        fontWeight: 700,
      },
    ],
  },
  "Baloo 2": {
    family: "Baloo 2",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/baloo2/v21/wXK0E3kTposypRydzVT08TS3JnAmtdgozapv9Fat7WcN.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/baloo2/v21/wXK0E3kTposypRydzVT08TS3JnAmtdgazKpv9Fat7WcN.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/baloo2/v21/wXK0E3kTposypRydzVT08TS3JnAmtdgoPK1v9Fat7WcN.ttf",
        fontWeight: 700,
      },
    ],
  },
  "Fredoka One": {
    family: "Fredoka One",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/fredokaone/v14/k3kUo8kEI-tA1RRcTZGmTlHGCaen8wf-.ttf",
        fontWeight: 400,
      },
    ],
  },
  Comfortaa: {
    family: "Comfortaa",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/comfortaa/v45/1Pt_g8LJRfWJmhDAuUsSQamb1W0lwk4S4WjMDrMfIA.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/comfortaa/v45/1Pt_g8LJRfWJmhDAuUsSQamb1W0lwk4S4TbNDrMfIA.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/comfortaa/v45/1Pt_g8LJRfWJmhDAuUsSQamb1W0lwk4S4Y7KDrMfIA.ttf",
        fontWeight: 700,
      },
    ],
  },
  Pacifico: {
    family: "Pacifico",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ96A4sijpFu_.ttf",
        fontWeight: 400,
      },
    ],
  },
  "Open Sans": {
    family: "Open Sans",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVI.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsiZ0B4gaVI.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsgH1x4gaVI.ttf",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVI.ttf",
        fontWeight: 700,
      },
    ],
  },
  Lato: {
    family: "Lato",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHvxk.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVew8.ttf",
        fontWeight: 700,
      },
    ],
  },
  Inter: {
    family: "Inter",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.ttf",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.ttf",
        fontWeight: 700,
      },
    ],
  },
  "Source Sans Pro": {
    family: "Source Sans Pro",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/sourcesanspro/v22/6xK3dSBYKcSV-LCoeQqfX1RYOo3aPA.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rAkw.ttf",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vAkw.ttf",
        fontWeight: 700,
      },
    ],
  },
  Rubik: {
    family: "Rubik",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0U1dYPFkZVO.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFWUI1dYPFkZVO.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFsa01dYPFkZVO.ttf",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFiK01dYPFkZVO.ttf",
        fontWeight: 700,
      },
    ],
  },
  Roboto: {
    family: "Roboto",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5g.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmEU9vAw.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlvAw.ttf",
        fontWeight: 700,
      },
    ],
  },
  "Nunito Sans": {
    family: "Nunito Sans",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4GVilntF8kA_Ykqw.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4G1ClntF8kA_Ykqw.ttf",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4G7SlntF8kA_Ykqw.ttf",
        fontWeight: 700,
      },
    ],
  },
  "Work Sans": {
    family: "Work Sans",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/worksans/v19/QGY_z_wNahGAdqQ43RhVcIgYT2Xz5u32K0nXNig.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/worksans/v19/QGY_z_wNahGAdqQ43RhVcIgYT2Xz5u32K3fXNig.ttf",
        fontWeight: 500,
      },
      {
        src: "https://fonts.gstatic.com/s/worksans/v19/QGY_z_wNahGAdqQ43RhVcIgYT2Xz5u32K5vQNig.ttf",
        fontWeight: 600,
      },
      {
        src: "https://fonts.gstatic.com/s/worksans/v19/QGY_z_wNahGAdqQ43RhVcIgYT2Xz5u32K6LQNig.ttf",
        fontWeight: 700,
      },
    ],
  },
};

// Track registered fonts to avoid duplicate registration
const registeredFonts = new Set<string>();

/**
 * Register a font with @react-pdf/renderer
 *
 * @param fontName - The font name to register
 * @returns Whether the font was successfully registered
 */
export function registerFont(fontName: string): boolean {
  // Already registered
  if (registeredFonts.has(fontName)) {
    return true;
  }

  const config = PDF_FONT_CONFIG[fontName];
  if (!config) {
    console.warn(`Unknown PDF font: ${fontName}`);
    return false;
  }

  try {
    Font.register(config);
    registeredFonts.add(fontName);
    return true;
  } catch (error) {
    console.error(`Failed to register font ${fontName}:`, error);
    return false;
  }
}

/**
 * Register multiple fonts with @react-pdf/renderer
 */
export function registerFonts(fontNames: string[]): void {
  fontNames.forEach((name) => registerFont(name));
}

/**
 * Get the PDF font family name for a font
 *
 * Falls back to Helvetica if the font is not available.
 *
 * @param fontName - The font name
 * @returns The font family to use in PDF styles
 */
export function getPDFFontFamily(fontName: string): string {
  // Check if font exists in our config
  if (PDF_FONT_CONFIG[fontName]) {
    // Ensure it's registered
    registerFont(fontName);
    return PDF_FONT_CONFIG[fontName].family;
  }

  // Fallback to Helvetica (built-in PDF font)
  return "Helvetica";
}

/**
 * Check if a font is available for PDF rendering
 */
export function isPDFFontAvailable(fontName: string): boolean {
  return fontName in PDF_FONT_CONFIG;
}
