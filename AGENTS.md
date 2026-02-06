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
├── schema.ts                 # Database schema (source of truth for data models)
├── styles.ts                 # Style queries/mutations
├── characters.ts             # Character queries/mutations
├── characterActions.ts       # AI actions (prompt gen, image analysis)
├── resources.ts              # Resource queries/mutations
├── images.ts                 # Image generation actions
└── frameActions.ts           # Frame asset generation
```

## Key Patterns

- Per-therapist style system (colors, typography, illustration style)
- Character persistence with AI visual descriptions (prompt fragments)
- Image generation stores full prompts for regeneration
- Always include style's `illustrationStyle` in every image prompt
- When using a character, prepend its `promptFragment`
- PDF generation via @react-pdf/renderer with print-ready layouts

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
