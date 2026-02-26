import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy | Resource Builder",
  description:
    "How Resource Builder protects your therapy materials, client data, and account information. AI image generation, data storage, and your rights.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full px-6 py-4 border-b border-border">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-default hover:opacity-80"
        >
          <Image src="/logo.png" alt="" width={32} height={32} className="size-8" />
          <span className="font-serif text-xl font-medium">Resource Builder</span>
        </Link>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium mb-2 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: February 26, 2026
        </p>

        <div className="prose prose-neutral max-w-none [&_h2]:font-serif [&_h2]:text-xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-muted-foreground [&_ul]:space-y-1">
          <h2>What We Collect</h2>
          <p>When you use Resource Builder, we collect:</p>
          <ul>
            <li>Account information (name, email address)</li>
            <li>Content you create (styles, characters, resources)</li>
            <li>Generated images and illustrations</li>
            <li>Usage data (pages visited, features used)</li>
            <li>Payment information (processed and stored by Dodo Payments — we do not store card details)</li>
          </ul>

          <h2>How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide and maintain the service</li>
            <li>Generate AI illustrations based on your style preferences</li>
            <li>Process payments and manage your subscription</li>
            <li>Send transactional emails (password resets, account notifications)</li>
            <li>Improve the service through anonymized analytics</li>
          </ul>

          <h2>Third-Party Services</h2>
          <p>We share specific data with the following services to operate Resource Builder:</p>
          <ul>
            <li><strong>Convex</strong> — Database and file storage. Stores all account data, content, and generated images.</li>
            <li><strong>Google Gemini</strong> — AI image generation. Receives style descriptions and character prompts to create illustrations. We recommend not including identifiable client information in prompts.</li>
            <li><strong>Dodo Payments</strong> — Payment processing (merchant of record). Receives your name, email, and payment details to process subscriptions and handle billing.</li>
            <li><strong>AhaSend</strong> — Transactional email. Receives your email address to send password resets and account notifications.</li>
          </ul>
          <p>We do not sell your data to third parties.</p>

          <h2>Data Storage</h2>
          <p>
            Your data is stored using Convex, a cloud database platform hosted in the United States. All data is encrypted in transit via HTTPS. Payment data is stored and processed by Dodo Payments — we never store credit card numbers or payment credentials on our servers.
          </p>

          <h2>Your Rights</h2>
          <p>You can:</p>
          <ul>
            <li>Access and export your data at any time</li>
            <li>Update your account information in Settings</li>
            <li>Delete your account and all associated data</li>
            <li>Request a copy of your data by contacting us</li>
            <li>Object to or restrict certain data processing</li>
          </ul>
          <p>
            We respond to all data requests within 30 days. For EU residents, you also have the right to lodge a complaint with your local data protection authority.
          </p>

          <h2>Children&apos;s Data</h2>
          <p>
            Resource Builder creates materials <em>for</em> children, but the service itself is for adult professionals. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us.
          </p>

          <h2>Data Deletion</h2>
          <p>
            When you delete your account, we permanently remove all your data including styles, characters, resources, and generated images. This action cannot be undone. Payment records may be retained by Dodo Payments as required by law.
          </p>

          <h2>Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of significant changes via email at least 30 days before they take effect.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about your privacy? Email us at{" "}
            <a
              href="mailto:support@resourcebuilder.app"
              className="text-foreground underline underline-offset-4 hover:text-coral transition-colors"
            >
              support@resourcebuilder.app
            </a>
          </p>
        </div>
      </main>

      <footer className="w-full px-6 py-4 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors underline underline-offset-4">
            Terms of Service
          </Link>
          {" · "}
          <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-4">
            Home
          </Link>
        </p>
      </footer>
    </div>
  );
}
