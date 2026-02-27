# TODO

Priorities only. Higher number = lower priority.

## Priority 1

- [x] **Resource type picker** — replace single CTA with a resource selection flow
- [x] **Type-aware resource detail page** — render based on `resource.type`
- [x] **Type-aware resource edit page** — route to the correct builder per type
- [x] **No-style option** — allow building without a defined style (add a neutral default preset and allow “No style” in wizards)
- [x] **Asset iteration + history** — regenerate a single asset, store versions, and revert per asset (cards, frames, game assets, etc.)
- [x] **Prompt + parameter history** — store prompt/inputs per asset generation for repeatability
- [x] **In-app image editing** — basic edit layer (text overlay, crop, reposition, undo/redo) or document a recommended external tool flow
- [x] **Resume draft resources** — detect drafts and offer “Resume” vs “Start new”
- [x] **Clickable Wizard** — click on any step to resume

## Priority 2

- [x] **Poster builder** — single image + headline + optional subtext
- [x] **Flashcards builder** — front/back text + optional image
- [x] **Worksheet builder** — structured form blocks + minimal images
- [x] **Board game builder** — grid board + tokens (optional) + cards (optional)
- [x] **Card game builder** — make your own deck, UNO-like rules, new game templates
- [x] **Free prompt section** — open-ended promptable resource generator

## Priority 3 — Next Up

- [ ] **Duplicate resource** — copy any existing resource and tweak it (new name, same content/settings, draft state)
- [ ] **Starter library** — pre-built resources for common therapy scenarios (anxiety coping cards, feelings wheels, social skills flashcards, etc.) so therapists don't start from zero. Different from the existing "resource templates" (blank starting points per type) — these are fully built, ready to use or customize.
- [ ] **Behavior/reward charts** — new resource type. Sticker charts, token boards, progress trackers. Extremely common in child therapy (ASD, ADHD, behavior management).

## Priority 4 — New Resource Types

- [ ] **Visual schedules** — daily routine cards/strips for sequencing activities. High demand in ASD and anxiety work.
- [ ] **Certificates/achievement cards** — reward progress milestones. Quick to implement, single-image with text fields.
- [ ] **Coloring pages** — generate outline-only versions of images for kids to color in session. Could extend existing types with an "outline mode" toggle.

## Priority 5 — Workflow & Productivity

- [ ] **Batch export** — select multiple resources from the library and download as a single PDF or ZIP
- [ ] **Resource collections** — group resources into therapy programs or session kits (e.g., "Anxiety Toolkit", "Social Skills Program")
- [ ] **Folder organization** — optional grouping in the library

## Priority 6 — Polish & Stickiness

- [ ] **Favorites/pinning** — quick access to most-used resources from the library
- [ ] **Usage history / recently printed** — track which resources were exported/printed recently, helps therapists find what they used last session
- [ ] **Custom fonts** — upload or pick from a broader font set for their brand
- [ ] **Resource sharing** — generate a read-only link to share resources with colleagues (also a viral growth lever)

## Priority 7 — Marketplace

- [ ] **Resource marketplace** — therapists share/sell their templates to other therapists. Major feature, needs its own design phase.

## Completed (verify if any regressions)

- [x] **Style customization UI** — colors, typography, illustration style, frames
- [x] **Style management page** — list, edit, duplicate, delete, preset seeding
- [x] **Character creator** — create characters, upload images, generate prompt fragments
- [x] **Character in emotion cards** — optional character in emotion cards
