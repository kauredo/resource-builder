"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AIWizardState } from "../use-ai-wizard";

interface CertificateReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

export function CertificateReview({ state, onUpdate }: CertificateReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const headline = (content.headline as string) || "";
  const subtext = (content.subtext as string) || "";
  const achievement = (content.achievement as string) || "";
  const recipientPlaceholder = (content.recipientPlaceholder as string) || "";
  const datePlaceholder = (content.datePlaceholder as string) || "";
  const signatoryLabel = (content.signatoryLabel as string) || "";
  const imagePrompt = (content.imagePrompt as string) || "";

  const updateContent = (field: string, value: string) => {
    const updated = { ...content, [field]: value };

    if (field === "imagePrompt") {
      onUpdate({
        generatedContent: updated,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === "certificate_main"
            ? { ...item, prompt: `Decorative certificate background (NO TEXT): ${value}` }
            : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: updated });
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Review the certificate content below. All text is overlaid on the printed PDF — the generated image is a decorative background only.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-name" className="font-medium">
          Resource Name
        </Label>
        <Input
          id="review-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          maxLength={100}
          placeholder="Certificate name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-headline" className="font-medium">
          Headline
        </Label>
        <Input
          id="review-headline"
          value={headline}
          onChange={(e) => updateContent("headline", e.target.value)}
          maxLength={80}
          placeholder="Certificate of Achievement"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-subtext" className="font-medium">
          Subtext <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="review-subtext"
          value={subtext}
          onChange={(e) => updateContent("subtext", e.target.value)}
          maxLength={80}
          placeholder="This certifies that"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-achievement" className="font-medium">
          Achievement <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="review-achievement"
          value={achievement}
          onChange={(e) => updateContent("achievement", e.target.value)}
          maxLength={200}
          placeholder="for demonstrating courage and growth"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="review-recipient" className="font-medium">
            Recipient Label
          </Label>
          <Input
            id="review-recipient"
            value={recipientPlaceholder}
            onChange={(e) => updateContent("recipientPlaceholder", e.target.value)}
            maxLength={40}
            placeholder="Child's Name"
          />
          <p className="text-xs text-muted-foreground">
            Shown below the name line on the PDF.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-date" className="font-medium">
            Date Label
          </Label>
          <Input
            id="review-date"
            value={datePlaceholder}
            onChange={(e) => updateContent("datePlaceholder", e.target.value)}
            maxLength={30}
            placeholder="Date"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-signatory" className="font-medium">
          Signatory <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="review-signatory"
          value={signatoryLabel}
          onChange={(e) => updateContent("signatoryLabel", e.target.value)}
          maxLength={60}
          placeholder="Therapist"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-prompt" className="font-medium">
          Background Image
        </Label>
        <Textarea
          id="review-prompt"
          value={imagePrompt}
          onChange={(e) => updateContent("imagePrompt", e.target.value)}
          maxLength={500}
          placeholder="Borders, flourishes, ribbons, stars — describe the decorative background"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Decorative background only. All certificate text is added by the PDF generator, not baked into the image.
        </p>
      </div>
    </div>
  );
}
