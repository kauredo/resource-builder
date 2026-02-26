import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service | Resource Builder",
  description:
    "Terms of service for Resource Builder. Content ownership, AI-generated illustrations, free plan, and acceptable use for therapy professionals.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: February 26, 2026
        </p>

        <div className="prose prose-neutral max-w-none [&_h2]:font-serif [&_h2]:text-xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-muted-foreground [&_ul]:space-y-1">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Resource Builder, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service. You must be at least 18 years old to create an account.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Resource Builder is a web application that helps therapists and psychologists create branded therapy materials including emotion cards, worksheets, board games, books, and other resources for use in clinical settings.
          </p>

          <h2>3. Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information when creating an account.
          </p>

          <h2>4. Plans & Pricing</h2>
          <p>
            Resource Builder offers two plans:
          </p>
          <ul>
            <li><strong>Free plan</strong> — 2 resources per month, 1 custom style (plus 5 presets), 1 character. PDF exports include a subtle watermark.</li>
            <li><strong>Pro plan</strong> — $19/month (or $15/month billed annually at $180/year). Unlimited resources, styles, and characters. Clean, watermark-free exports.</li>
          </ul>
          <p>
            All payments are processed by Dodo Payments, our merchant of record. Dodo Payments handles billing, sales tax, and payment compliance on our behalf. Subscriptions renew automatically at the end of each billing period. You can cancel anytime from your billing settings — access continues until the end of your current billing period. No partial refunds are issued for unused time. We will provide at least 30 days notice via email before any price increases to existing subscribers.
          </p>

          <h2>5. Content Ownership</h2>
          <p>
            You retain ownership of the therapy materials you create using Resource Builder. We do not claim any rights over your content. We may use anonymized usage patterns (such as which features are most popular) to improve the service — this never includes your therapy content, illustrations, or any identifiable information.
          </p>

          <h2>6. AI-Generated Content</h2>
          <p>
            Resource Builder uses Google Gemini to generate illustrations. Your style descriptions and character prompts are sent to this service to create images. AI-generated content may occasionally be inaccurate or unsuitable — you are responsible for reviewing all generated content before use in clinical settings. Copyright protection for AI-generated images may vary by jurisdiction.
          </p>

          <h2>7. Acceptable Use</h2>
          <p>
            You agree not to use Resource Builder to create content that is harmful, illegal, or violates the rights of others. We reserve the right to terminate accounts that violate this policy.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            Resource Builder is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service or materials created with it. Our total liability is limited to the fees you paid in the 12 months preceding the claim.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. We will notify you of material changes via email at least 30 days before they take effect. Continued use of the service after changes constitutes acceptance of the updated terms.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions about these terms? Email us at{" "}
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
          <Link href="/privacy" className="hover:text-foreground transition-colors underline underline-offset-4">
            Privacy Policy
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
