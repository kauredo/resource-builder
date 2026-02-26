/**
 * Reusable PDF watermark overlay for @react-pdf/renderer.
 *
 * Renders a subtle "Created with Resource Builder" text in the
 * bottom-right corner of a page. Intended for free-plan exports.
 */

import { View, Text } from "@react-pdf/renderer";
import { createElement } from "react";

/**
 * Returns a View element positioned absolutely in the bottom-right
 * corner of the page with a subtle watermark text.
 */
export function createWatermarkOverlay() {
  return createElement(
    View,
    {
      style: {
        position: "absolute",
        bottom: 18,
        right: 24,
        transform: "rotate(-20deg)",
      },
    },
    createElement(
      Text,
      {
        style: {
          fontFamily: "Helvetica",
          fontSize: 7.5,
          color: "#000000",
          opacity: 0.13,
        },
      },
      "Created with Resource Builder",
    ),
  );
}
