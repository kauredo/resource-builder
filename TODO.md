# TODO

Features and improvements to implement after Emotion Cards MVP is complete.

## Style System

- [ ] **Style customization UI** — Allow users to customize presets and save as their own style
  - Color pickers for primary, secondary, accent, background, text
  - Typography selection (heading font, body font)
  - Illustration style description textarea
  - "Customize" button on preset cards opens editor pre-filled
  - Save creates new style with `isPreset: false`

- [ ] **Style management page** (`/styles`) — Dedicated page to view, edit, delete custom styles

## Resource Types

- [ ] **Board games** — Game boards with custom illustrations
- [ ] **Worksheets** — Fillable therapy worksheets
- [ ] **Posters** — Printable posters with affirmations/reminders
- [ ] **Flashcards** — General purpose flashcard decks

## Characters

- [ ] **Character creator** — UI to create persistent characters with reference images
- [ ] **Character in emotion cards** — Use character instead of generic child illustrations

## Wizard UX

- [ ] **Resume draft resources** — Allow users to continue incomplete resources after page refresh
  - Query existing draft resources on wizard mount
  - Offer to resume or start fresh
  - Restore wizard state from saved draft data

## Infrastructure

- [ ] **Stripe integration** — Subscription management after trial
- [ ] **Usage tracking** — Track image generations for billing

