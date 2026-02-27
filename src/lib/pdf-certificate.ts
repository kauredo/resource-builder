/**
 * Certificate PDF generator for @react-pdf/renderer.
 *
 * Renders a landscape A4 page with a full-bleed decorative background image
 * and text overlaid via absolute positioning. A semi-transparent white panel
 * ensures text remains readable over any background.
 *
 * All text (headline, subtext, recipient, achievement, date, signatory) is
 * rendered by the PDF — not baked into the image.
 */

import { Document, Page, View, Image, Text, pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { createWatermarkOverlay } from "./pdf-watermark";
import { getPDFFontFamily } from "./pdf-fonts";

interface CertificatePDFInput {
  imageUrl: string;
  headline: string;
  subtext?: string;
  achievement?: string;
  recipientName?: string;
  recipientPlaceholder?: string;
  date?: string;
  datePlaceholder?: string;
  signatoryLabel?: string;
  /** Style fonts — heading font for headline/recipient, body font for others */
  headingFont?: string;
  bodyFont?: string;
  watermark?: boolean;
}

// A4 landscape dimensions (points)
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;

// Inset from page edge to the text panel
const MARGIN = 72; // ~1 inch for decorative border area

export async function generateCertificatePDF({
  imageUrl,
  headline,
  subtext,
  achievement,
  recipientName,
  recipientPlaceholder = "Child's Name",
  date,
  datePlaceholder = "Date",
  signatoryLabel,
  headingFont,
  bodyFont,
  watermark,
}: CertificatePDFInput): Promise<Blob> {
  const headingFamily = headingFont ? getPDFFontFamily(headingFont) : "Helvetica";
  const bodyFamily = bodyFont ? getPDFFontFamily(bodyFont) : "Helvetica";

  // Defensive: truncate excessively long strings to prevent PDF overflow
  const safeHeadline = (headline || "Certificate").slice(0, 100);
  const safeSubtext = subtext?.slice(0, 100);
  const safeAchievement = achievement?.slice(0, 250);
  const safeRecipient = recipientName?.trim().slice(0, 60);
  const safeDate = date?.trim().slice(0, 30);
  const safeSignatory = signatoryLabel?.slice(0, 60);

  const hasRecipient = !!safeRecipient;
  const hasDate = !!safeDate;

  const page = createElement(
    Page,
    {
      size: "A4",
      orientation: "landscape",
      style: { position: "relative", width: PAGE_WIDTH, height: PAGE_HEIGHT },
    },

    // Full-bleed background image
    createElement(Image, {
      src: imageUrl,
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        objectFit: "cover",
      },
    }),

    // Semi-transparent text backing panel — ensures readability over any background
    createElement(View, {
      style: {
        position: "absolute",
        top: MARGIN,
        left: MARGIN,
        right: MARGIN,
        bottom: MARGIN,
        backgroundColor: "rgba(255, 255, 255, 0.82)",
        borderRadius: 12,
      },
    }),

    // Text overlay container — centered within the panel
    createElement(
      View,
      {
        style: {
          position: "absolute",
          top: MARGIN,
          left: MARGIN,
          right: MARGIN,
          bottom: MARGIN,
          padding: 36,
          justifyContent: "center",
          alignItems: "center",
        },
      },

      // Headline
      createElement(
        Text,
        {
          style: {
            fontFamily: headingFamily,
            fontSize: 36,
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            marginBottom: 8,
            maxWidth: 560,
          },
        },
        safeHeadline,
      ),

      // Subtext
      safeSubtext
        ? createElement(
            Text,
            {
              style: {
                fontFamily: bodyFamily,
                fontSize: 16,
                color: "#444444",
                textAlign: "center",
                marginBottom: 24,
              },
            },
            safeSubtext,
          )
        : null,

      // Recipient name or blank fill-in line
      hasRecipient
        ? createElement(
            Text,
            {
              style: {
                fontFamily: headingFamily,
                fontSize: 28,
                fontWeight: 700,
                color: "#1a1a1a",
                textAlign: "center",
                marginBottom: 4,
                maxWidth: 420,
              },
            },
            safeRecipient,
          )
        : createElement(
            View,
            {
              style: {
                width: 280,
                borderBottomWidth: 1.5,
                borderBottomColor: "#555555",
                marginBottom: 4,
                height: 32,
              },
            },
          ),

      // Recipient label (shown below the line when empty)
      !hasRecipient
        ? createElement(
            Text,
            {
              style: {
                fontFamily: bodyFamily,
                fontSize: 10,
                color: "#777777",
                textAlign: "center",
                marginBottom: 16,
              },
            },
            recipientPlaceholder,
          )
        : createElement(View, { style: { marginBottom: 16 } }),

      // Achievement
      safeAchievement
        ? createElement(
            Text,
            {
              style: {
                fontFamily: bodyFamily,
                fontSize: 14,
                color: "#333333",
                textAlign: "center",
                marginBottom: 24,
                maxWidth: 440,
              },
            },
            safeAchievement,
          )
        : null,

      // Bottom row: date (left) and signatory (right)
      createElement(
        View,
        {
          style: {
            flexDirection: "row",
            justifyContent: safeSignatory ? "space-between" : "center",
            width: "100%",
            maxWidth: 500,
            marginTop: 24,
          },
        },

        // Date column
        createElement(
          View,
          { style: { alignItems: "center", width: 180 } },
          hasDate
            ? createElement(
                Text,
                {
                  style: {
                    fontFamily: bodyFamily,
                    fontSize: 13,
                    color: "#333333",
                    textAlign: "center",
                    marginBottom: 2,
                  },
                },
                safeDate,
              )
            : createElement(
                View,
                {
                  style: {
                    width: 140,
                    borderBottomWidth: 1,
                    borderBottomColor: "#555555",
                    height: 18,
                    marginBottom: 2,
                  },
                },
              ),
          createElement(
            Text,
            {
              style: {
                fontFamily: bodyFamily,
                fontSize: 9,
                color: "#777777",
                textAlign: "center",
              },
            },
            datePlaceholder,
          ),
        ),

        // Signatory column
        safeSignatory
          ? createElement(
              View,
              { style: { alignItems: "center", width: 180 } },
              createElement(
                View,
                {
                  style: {
                    width: 140,
                    borderBottomWidth: 1,
                    borderBottomColor: "#555555",
                    height: 18,
                    marginBottom: 2,
                  },
                },
              ),
              createElement(
                Text,
                {
                  style: {
                    fontFamily: bodyFamily,
                    fontSize: 9,
                    color: "#777777",
                    textAlign: "center",
                  },
                },
                safeSignatory,
              ),
            )
          : null,
      ),
    ),

    watermark ? createWatermarkOverlay() : null,
  );

  const document = createElement(Document, {}, page);
  return await pdf(document).toBlob();
}
