/**
 * Reusable PDF watermark overlay for @react-pdf/renderer.
 *
 * Renders a subtle "Created with Resource Builder" text in the
 * bottom-right corner of a page. Intended for free-plan exports.
 */

import { View, Text } from "@react-pdf/renderer";
import { createElement } from "react";

/**
 * Returns a fixed View element positioned as a centered footer in
 * the bottom page margin, below all content.
 */
export function createWatermarkOverlay() {
  return createElement(
    View,
    {
      fixed: true,
      style: {
        position: "absolute",
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: "center",
      },
    },
    createElement(
      Text,
      {
        style: {
          fontFamily: "Helvetica",
          fontSize: 8.5,
          color: "#000000",
          opacity: 0.2,
          textAlign: "center",
        },
      },
      "Created with Resource Builder",
    ),
  );
}
