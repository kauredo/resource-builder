import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./convex-client-provider";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://resourcebuilder.app";

export const metadata: Metadata = {
  title: {
    default: "Resource Builder | Therapy Materials Made Beautiful",
    template: "%s | Resource Builder",
  },
  description:
    "Create consistent, branded therapy resources for children and adolescents. AI-powered emotion cards, worksheets, and more — designed for print.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Resource Builder | Therapy Materials Made Beautiful",
    description:
      "Create consistent, branded therapy resources for children and adolescents. AI-powered emotion cards, worksheets, and more — designed for print.",
    url: siteUrl,
    siteName: "Resource Builder",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resource Builder | Therapy Materials Made Beautiful",
    description:
      "Create consistent, branded therapy resources for children and adolescents. AI-powered emotion cards, worksheets, and more — designed for print.",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5", // Warm cream background
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Resource Builder",
              url: siteUrl,
              description:
                "Create consistent, branded therapy resources for children and adolescents. AI-powered emotion cards, worksheets, and more — designed for print.",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description: "Free plan — 2 resources/month, 1 style, 1 character",
                },
                {
                  "@type": "Offer",
                  price: "19",
                  priceCurrency: "USD",
                  description: "Pro monthly — unlimited resources, styles, and characters",
                },
                {
                  "@type": "Offer",
                  price: "180",
                  priceCurrency: "USD",
                  description: "Pro annual — $15/month, billed yearly",
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
