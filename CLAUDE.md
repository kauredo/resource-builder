# Resource Builder

A web application for therapists/psychologists to create consistent, branded therapy resources (emotion cards, board games, worksheets, etc.) for children and adolescents.

**Status:** Pre-production / Active Development. No real users yet. Database can be reset freely.

## Quick Start

```bash
npm install
npx convex dev      # Start Convex (separate terminal)
npm run dev         # Start Next.js
```

## Tech Stack

| Layer     | Technology                                        |
| --------- | ------------------------------------------------- |
| Framework | Next.js 15 (App Router)                           |
| Database  | Convex                                            |
| Auth      | Convex Auth                                       |
| Image Gen | Gemini 3 Pro Image (`gemini-3-pro-image-preview`) |
| PDF       | @react-pdf/renderer                               |
| Styling   | Tailwind CSS v4                                   |
| UI        | shadcn/ui                                         |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── (auth)/               # Login, Signup
│   └── (dashboard)/          # Protected app
│       ├── styles/           # Style management
│       ├── characters/       # Character management
│       └── resources/        # Resource builder + library
│           ├── new/          # Resource type picker + per-type routes
│           └── [id]/         # Detail + edit pages
├── components/
│   ├── ui/                   # shadcn components
│   ├── style/                # Style picker, editor
│   ├── character/            # Character components
│   └── resource/
│       ├── ExportModal.tsx   # Unified PDF export modal (settings + preview + download)
│       ├── wizard/           # Shared AI wizard (4-step: Describe → Review → Generate → Export)
│       ├── book/             # Book (custom 5-step wizard)
│       ├── flashcards/       # Flashcards (shared wizard)
│       ├── poster/           # Poster (shared wizard)
│       ├── emotion-cards/    # Emotion cards (shared wizard)
│       ├── card-game/        # Card game (shared wizard)
│       ├── board-game/       # Board game (shared wizard)
│       ├── worksheet/        # Worksheet (shared wizard)
│       ├── free-prompt/      # Free prompt (custom wizard)
│       └── editor/           # ImageEditorModal (Konva-based)
└── lib/
    ├── utils.ts              # Tailwind class merging (cn)
    ├── style-presets.ts      # Built-in style presets
    ├── pdf.ts                # PDF generation (emotion cards, shared utils)
    ├── pdf-image-pages.ts    # Full-page/grid image PDFs (poster, board game)
    ├── pdf-flashcards.ts     # Flashcard PDFs (front/back grid, double-sided)
    ├── pdf-worksheet.ts      # Block-based worksheet PDFs
    ├── pdf-card-game.ts      # Card game PDFs with layered composition
    ├── pdf-book.ts           # Book PDFs (two layouts: picture_book, illustrated_text)
    └── pdf-fonts.ts          # Font registration for @react-pdf

convex/
├── schema.ts                 # Database schema (source of truth for data models)
├── styles.ts                 # Style queries/mutations
├── characters.ts             # Character queries/mutations
├── characterActions.ts       # AI actions (prompt gen, image analysis)
├── resources.ts              # Resource queries/mutations
├── contentGeneration.ts      # AI content generation (per-type system prompts)
├── images.ts                 # Image generation actions (Gemini)
├── assets.ts                 # Asset queries (images with version history)
├── assetVersions.ts          # Asset version management (pruning, pinning)
└── frameActions.ts           # Frame asset generation
```

## Key Patterns

- Per-therapist style system (colors, typography, illustration style)
- Character persistence with AI visual descriptions (prompt fragments)
- Image generation stores full prompts for regeneration
- Always include style's `illustrationStyle` in every image prompt
- When using a character, prepend its `promptFragment`
- PDF generation via @react-pdf/renderer with print-ready layouts

## Resource Types

8 resource types, each with a wizard, detail page, and PDF export:

| Type | Wizard | Content Model | PDF | Export Settings |
|------|--------|---------------|-----|-----------------|
| Poster | Shared AI | Single image | `pdf-image-pages.ts` (full page) | None |
| Flashcards | Shared AI | Array of cards (front text + image) | `pdf-flashcards.ts` | Cards per page (4/6/9) |
| Emotion Cards | Shared AI | Array of emotions (label + image) | `pdf.ts` | Cards per page, labels, descriptions, cut lines |
| Card Game | Shared AI | Array of cards (text + image) | `pdf-card-game.ts` | Cards per page, include card backs |
| Board Game | Shared AI | Board + cards + pieces | `pdf-image-pages.ts` | None |
| Worksheet | Shared AI | Blocks (text, image, fill-in) | `pdf-worksheet.ts` | Orientation (portrait/landscape) |
| Free Prompt | Custom | Single image with free prompt | `pdf-image-pages.ts` | None |
| Book | Custom | Multi-page narrative (cover + pages) | `pdf-book.ts` | Format (book/booklet) |

### Shared AI Wizard (`resource/wizard/`)

4-step flow used by most types: **Describe → Review → Generate → Export**

- `AIWizard.tsx` — orchestrator with `WizardLayout` chrome
- `use-ai-wizard.ts` — state hook: content generation, `ImageItem[]` tracking, resource CRUD
- `WizardDescribeStep.tsx` — per-type placeholder map, style/character pickers
- `WizardGenerateStep.tsx` — batch image generation with progress (3 at a time)
- `WizardExportStep.tsx` — per-type PDF download + mark complete
- `review/` — per-type review components (e.g., `FlashcardsReview.tsx`)

Adding a new type to the shared wizard: add to `use-ai-wizard.ts` validTypes, add system prompt to `contentGeneration.ts`, create `{Type}Review.tsx`, add export branch to `WizardExportStep.tsx`.

### Custom Book Wizard (`resource/book/`)

4-step flow: **Setup → Content → Generate → Export**

Custom because books need two creation modes (AI-generated vs therapist-written) and a multi-page editor with reorder/add/remove — neither fits the shared wizard.

- `BookWizard.tsx` — 4-step orchestrator
- `use-book-wizard.ts` — state hook: pages, cover, layout, creation mode, imageItems
- `BookSetupStep.tsx` — layout choice (picture_book / illustrated_text), cover toggle, style/character
- `BookContentStep.tsx` — AI mode (describe + generate + edit inline) or manual mode (write pages), includes cover editor, page editors with reorder/add/remove
- `BookGenerateStep.tsx` — batch image generation with progress
- `BookExportStep.tsx` — PDF download
- `BookDetail.tsx` — detail page: cover + page list with per-image PromptEditor, Edit, History

### Book Data Model (`src/types/index.ts`)

```
BookContent {
  bookType: string          // "social story", "CBT workbook", etc.
  layout: "picture_book" | "illustrated_text"
  cover?: BookCover         // title, subtitle, imagePrompt, imageAssetKey
  pages: BookPage[]         // id, text, imagePrompt, imageAssetKey, characterId
  characters?: CharacterSelection
}
```

Asset types: `book_page_image`, `book_cover_image`
Image aspects: cover `3:4` (portrait), pages `4:3` (landscape)

### Export Modal (`resource/ExportModal.tsx`)

Unified PDF export experience used by all 8 detail pages. Single "Export" button opens a Dialog with:
- **Settings panel** (left, ~280px) — resource-specific controls, optional
- **PDF preview** (right, flex-1) — live `PDFPreview` re-rendered on "Update Preview"
- **Footer** — Download (coral) + Close

Each detail page passes a `buildPdfBlob` callback that reads from local `exportSettings` state. Settings are initialized from `content.layout` (or defaults) when the modal opens. The `onDownloaded` callback handles marking the resource as complete.

Settings sub-components (named exports from `ExportModal.tsx`):
- `EmotionCardsSettings` — cardsPerPage (4/6/9), showLabels, showDescriptions, showCutLines
- `FlashcardsSettings` — cardsPerPage (4/6/9)
- `CardGameSettings` — cardsPerPage (4/6/9), includeCardBacks
- `BookSettings` — format (book/booklet)
- `WorksheetSettings` — orientation (portrait/landscape)

Types without settings (Poster, Free Prompt, Board Game) pass no `settingsPanel`, rendering a single-column preview-only modal.

---

# Working Principles

- **I'm the product owner** — I make the decisions, you make them happen
- **Push back if I'm overcomplicating** — tell me if I'm going down a bad path
- **Be honest about limitations** — adjust expectations rather than disappoint
- **Quality bar is high** — not just working, but something I'm proud to show people
- **Keep me in control** — stop at key decisions, present options instead of just picking

---

# Design Context

## Users

Solo therapists and psychologists who work with children and adolescents. They use CBT, play therapy, and integrated/3rd gen therapies. They need to create professional, consistent therapy materials quickly, primarily for printing and in-session use where screens are avoided. They're creative professionals who value both efficiency and personalization.

## Brand Personality

**Supportive, Creative, Reliable**

- **Supportive**: Helpful creative partner, not a cold tool
- **Creative**: Sparks inspiration, makes resource creation enjoyable
- **Reliable**: Just works, consistent quality, earns trust

**Emotional Goal**: Playful & Inspiring — therapists should feel creative energy and delight.

## Aesthetic Direction

**Visual Tone**: Warm, inviting, with subtle playfulness. Professional but not sterile.

**References**: Canva (approachable), Framer (polish), Linear (minimal, fast)

**Anti-References**: Clinical/medical software, generic SaaS dashboards, overly childish design, complex/overwhelming interfaces

**AI Slop to Avoid**:

- Sparkles icon — never use unless indicating AI-generated content
- Purple-to-blue gradients
- Cyan/neon accents on dark backgrounds
- Glassmorphism everywhere
- "Hero metrics" layouts (big number cards)
- Identical card grids (3 cards, same structure)
- Gradient text on headings
- Generic fonts (Inter, Roboto)
- Overuse of blur/glow effects, gradients, animations
- Cards with rounded corners and soft shadows everywhere

**Theme**: Light mode only — matches therapy/clinical context and is print-preview friendly.

## Design Principles

1. **Calm Confidence**: Quietly capable. Reduce visual noise. Let the therapist's content be the star.
2. **Guided Creativity**: Clear paths (presets, templates) while allowing customization. Never a blank canvas.
3. **Playful Polish**: Small moments of delight. Not cartoonish, but warm and alive.
4. **Print-First Thinking**: Everything will likely be printed. Previews should feel tangible.
5. **Accessible by Default**: WCAG AA. Good contrast, keyboard nav, screen reader support.

---

# Code Conventions

## Components

- **Prefer shadcn/ui** (`<Button>`, `<Input>`, `<Label>`, `<Checkbox>`, etc.) over raw HTML
- Only use raw `<button>` for highly custom interactive elements (chips, cards, toggles)
- Raw `<button>` must include: `cursor-pointer`, focus ring, `transition-colors duration-150`, `motion-reduce:transition-none`

## Interactive Element Checklist

Every clickable element needs:

```
cursor-pointer
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-{brand-color}       # coral, teal, or primary
focus-visible:ring-offset-2
transition-colors duration-150
motion-reduce:transition-none
```

## Styling

- Tailwind CSS v4 utility classes
- OKLCH colors — use `color-mix(in oklch, ...)` not hex concatenation
- Consistent spacing scale (4px base)
- `size-{n}` instead of `w-{n} h-{n}` for square elements

## Accessibility

- All interactive elements keyboard accessible
- ARIA labels on icon-only buttons
- `focus-visible:` not `focus:`
- WCAG AA contrast (4.5:1 text, 3:1 UI)
- `motion-reduce:` variants
- `aria-pressed` for toggles, `aria-expanded` for collapsibles

---

# Development Workflow

**For major UI features:**
`/frontend-design` → Build → `/interface-guidelines` → `/critique` → `/design-polish` → `/design-review`

Always use `/frontend-design` before building new UI components. Skip steps for trivial changes.

| Skill       | When to Use                                 |
| ----------- | ------------------------------------------- |
| `/bolder`   | Design feels too safe or generic            |
| `/quieter`  | Design is too aggressive or overwhelming    |
| `/simplify` | Too much complexity, needs clarity          |
| `/clarify`  | Interface text is confusing                 |
| `/harden`   | Strengthen against edge cases, i18n, errors |
| `/animate`  | Add strategic motion and micro-interactions |
