# Resource Builder

A web application for therapists/psychologists to create consistent, branded therapy resources (emotion cards, board games, worksheets, etc.) for children and adolescents.

> **Status:** Pre-production / Active Development. No real users yet. Database can be reset freely.

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
│       ├── resources/        # Resource builder
│       └── library/          # Saved resources
├── components/
│   ├── ui/                   # shadcn components
│   ├── style/                # Style picker, editor
│   ├── character/            # Character components
│   └── resource/             # Resource builder components
└── lib/
    ├── utils.ts              # Tailwind class merging (cn)
    ├── style-presets.ts      # Built-in style presets
    └── pdf.ts                # PDF generation

convex/
├── schema.ts                 # Database schema
├── users.ts                  # User queries/mutations
├── styles.ts                 # Style queries/mutations
├── characters.ts             # Character queries/mutations
├── resources.ts              # Resource queries/mutations
└── images.ts                 # Image generation actions
```

## Data Models

### User

- `subscription`: "trial" | "active" | "expired"
- `trialEndsAt`: Trial expiration timestamp
- `stripeCustomerId`: For Stripe integration

### Style

- `colors`: { primary, secondary, accent, background, text }
- `typography`: { headingFont, bodyFont }
- `illustrationStyle`: Text description for AI prompts
- `isPreset`: System presets vs user-created

### Character

- `name`, `description`, `personality`
- `referenceImages`: Stored in Convex
- `promptFragment`: Detailed prompt for AI consistency

### Resource

- `type`: "emotion_cards" | "board_game" | "worksheet" | "poster" | "flashcards"
- `content`: Type-specific content (EmotionCardContent, etc.)
- `images`: Generated images with descriptions and prompts
- `status`: "draft" | "complete"

## Style Presets

1. **Warm & Playful** — Coral, teal, sunny yellow. Soft rounded shapes.
2. **Calm & Minimal** — Sage greens. Simple line art, white space.
3. **Bold & Colorful** — Purple, blue, cyan. High contrast, geometric.
4. **Nature & Earthy** — Olive, tan. Organic shapes, woodland creatures.
5. **Whimsical Fantasy** — Lavender, purple. Dreamy pastels, sparkles.

## Emotion Presets

**Primary:** Happy, Sad, Angry, Scared, Surprised, Disgusted

**Secondary:** Excited, Calm, Worried, Frustrated, Proud, Embarrassed

**Nuanced:** Disappointed, Overwhelmed, Lonely, Confused, Jealous, Hopeful, Grateful, Nervous

## Key Conventions

### Image Generation

- Always include the style's `illustrationStyle` in every prompt
- When using a character, prepend its `promptFragment`
- Store the full prompt used alongside each generated image
- Store descriptions for regeneration capability

### PDF Generation

- Server-side using @react-pdf/renderer
- Support multiple layouts: 4, 6, or 9 cards per page
- Include cut lines for card decks

### Authentication

- No free tier — trial period (14 days) then subscription
- Convex Auth for simplicity
- Stripe for subscription management

## Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Google AI (Gemini)
GOOGLE_AI_API_KEY=
```

## MVP Scope

Focus on **Emotion Cards** resource type first:

1. Style selection/creation
2. Emotion selection from presets + custom
3. Optional character assignment
4. AI image generation per card
5. PDF export with print-ready layout

## User Flows

### Onboarding

Sign up → Welcome → Style wizard (preset/describe/build) → Preview → Optional character → Ready

### Create Emotion Cards

New resource → Name deck → Select emotions → Choose layout → Generate images → Review/regenerate → Export PDF

---

# Project Rules

## Design Context

### Users

Solo therapists and psychologists who work with children and adolescents. They use CBT, play therapy, and integrated/3rd gen therapies. They need to create professional, consistent therapy materials (emotion cards, board games, worksheets) quickly, primarily for printing and in-session use where screens are avoided. They're creative professionals who value both efficiency and the ability to craft personalized resources.

### Brand Personality

**Supportive, Creative, Reliable**

- **Supportive**: The app feels like a helpful creative partner, not a cold tool
- **Creative**: Sparks inspiration and makes resource creation feel enjoyable
- **Reliable**: Just works, delivers consistent quality, earns trust over time

**Emotional Goal**: Playful & Inspiring — therapists should feel creative energy and delight when using the app, with a spark that invites experimentation.

### Aesthetic Direction

**Visual Tone**: Warm, inviting, with subtle playfulness. Professional enough to feel trustworthy, but not sterile. Creative tool energy without being overwhelming.

**References**:

- **Canva**: Approachable creation tool, template-driven, friendly onboarding
- **Framer**: Visual flair, creative polish, attention to micro-interactions
- **Linear**: Minimal, fast, focused, refined details

**Anti-References** (explicitly avoid):

- Clinical/medical software aesthetic (cold, institutional)
- Generic SaaS dashboards (forgettable, corporate)
- Overly childish design (unprofessional, not taken seriously)
- Complex/overwhelming interfaces (cluttered, intimidating)

**AI Slop to Avoid** (dead giveaways of AI-generated design):

- Sparkles icon (✨) — the #1 AI tell, never use it unless for indicating AI-generated content
- Purple-to-blue gradients
- Cyan/neon accents on dark backgrounds
- Glassmorphism everywhere
- "Hero metrics" layouts (big number cards)
- Identical card grids (3 cards, same structure)
- Gradient text on headings
- Generic fonts (Inter, Roboto)
- Overuse of blur/glow effects
- Cards with rounded corners and soft shadows everywhere
- Overuse of gradients
- Overuse of animations

**Theme**: Light mode only — matches therapy/clinical context and is print-preview friendly.

### Design Principles

1. **Calm Confidence**: The interface should feel quietly capable. Reduce visual noise. Let the therapist's created content be the star, not the UI chrome.

2. **Guided Creativity**: Offer clear paths (presets, templates) while allowing customization. Never make users stare at a blank canvas — always provide a starting point.

3. **Playful Polish**: Small moments of delight in transitions, feedback, and micro-interactions. Not cartoonish, but warm and alive.

4. **Print-First Thinking**: Everything created will likely be printed. Previews should feel tangible. Color choices should work on paper. Consider cut lines and assembly.

5. **Accessible by Default**: WCAG AA compliance. Good contrast ratios, keyboard navigation, screen reader support. Therapists may have their own accessibility needs.

---

## Technical Context

### Stack

- Next.js 15 (App Router)
- Tailwind CSS v4
- shadcn/ui components
- Convex (database + auth)
- Gemini 3 Pro Image (AI generation)
- @react-pdf/renderer (PDF export)

### Key Patterns

- Per-therapist style system (colors, typography, illustration style)
- Character persistence with AI prompt fragments
- Image generation stores prompts for regeneration
- Server-side PDF generation

### Style Presets

1. Warm & Playful — coral, teal, yellow, soft shapes
2. Calm & Minimal — sage greens, line art, white space
3. Bold & Colorful — purple, blue, cyan, geometric
4. Nature & Earthy — olive, tan, woodland creatures
5. Whimsical Fantasy — lavender, pastels, sparkles

---

## Code Conventions

### Components

- **Prefer shadcn/ui components** over raw HTML elements
- Use `<Button>` instead of `<button>` — it includes focus states, cursor styles, disabled states
- Use `<Input>`, `<Label>`, `<Checkbox>`, etc. from `@/components/ui/*`
- Only use raw `<button>` for highly custom interactive elements (chips, cards, toggles)
- When using raw `<button>`, always include:
  - `cursor-pointer` (browsers default to `cursor: default`)
  - `focus-visible:ring-2 focus-visible:ring-{color}` for keyboard focus
  - `transition-colors duration-150` for hover feedback
  - `motion-reduce:transition-none` to respect user preferences

### Interactive Element Checklist

Every clickable element needs:

```
cursor-pointer                           # Visual affordance
focus-visible:outline-none               # Remove default outline
focus-visible:ring-2                     # Custom focus ring
focus-visible:ring-{brand-color}         # Use coral, teal, or primary
focus-visible:ring-offset-2              # Spacing from element
transition-colors duration-150           # Smooth hover
motion-reduce:transition-none            # Accessibility
```

### Styling

- Tailwind CSS v4 utility classes
- Design tokens via CSS variables for theming
- Consistent spacing scale (4px base)
- Use `size-{n}` instead of `w-{n} h-{n}` for square elements

### Accessibility

- All interactive elements keyboard accessible
- ARIA labels on icon-only buttons
- Focus indicators visible (use `focus-visible:`, not `focus:`)
- Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- Respect reduced motion with `motion-reduce:` variants
- Use `aria-pressed` for toggle buttons
- Use `aria-expanded` for collapsible sections

---

## Development Workflow

### Building New UI

For each major page or feature:

1. **`/frontend-design`** — Get aesthetic direction before coding. Establishes visual tone, layout approach, and differentiation.
2. **Build** — Implement with that direction in mind.
3. **`/interface-guidelines`** — Verify interactions, keyboard support, form behavior.
4. **`/critique`** — Holistic design critique. Does it actually work? Is it memorable?

### Polish & Ship

Before considering a feature complete:

1. **`/design-polish`** — Systematic final pass. Spacing, alignment, micro-interactions.
2. **`/design-review`** — Accessibility and visual audit. Catches issues.

### Orchestration

- **`/ui-finesse-workflow`** — Use when starting complex UI work. Reminds you which skill to use when.

### Other Useful Skills

| Skill       | When to Use                                 |
| ----------- | ------------------------------------------- |
| `/bolder`   | Design feels too safe or generic            |
| `/quieter`  | Design is too aggressive or overwhelming    |
| `/simplify` | Too much complexity, needs clarity          |
| `/clarify`  | Interface text is confusing                 |
| `/harden`   | Strengthen against edge cases, i18n, errors |
| `/animate`  | Add strategic motion and micro-interactions |
| `/colorize` | Design is too monochromatic                 |
| `/audit`    | Generate comprehensive issue report         |

### Workflow Summary

```
/frontend-design → Build → /interface-guidelines → /critique → /design-polish → /design-review
```

Skip steps for trivial changes. Use full cycle for major features.
