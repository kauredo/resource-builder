# Resource Builder

A web application for therapists and psychologists to create consistent, branded therapy resources for children and adolescents. Create emotion cards, board games, worksheets, and more with AI-powered image generation.

## Features

- **Style System** — Define your brand with colors, typography, and illustration style
- **Character Persistence** — Create characters that maintain visual consistency across resources
- **AI Image Generation** — Generate custom illustrations using Gemini
- **Print-Ready PDFs** — Export resources with cut lines and professional layouts
- **Emotion Card Builder** — Select from preset emotions or add custom ones

## Tech Stack

| Layer     | Technology              |
| --------- | ----------------------- |
| Framework | Next.js 15 (App Router) |
| Database  | Convex                  |
| Auth      | Convex Auth             |
| Image Gen | Gemini 3 Pro Image      |
| PDF       | @react-pdf/renderer     |
| Styling   | Tailwind CSS v4         |
| UI        | shadcn/ui + Radix       |

## Getting Started

### Prerequisites

- Node.js 18+
- A Convex account
- Google AI API key (for Gemini)

### Installation

```bash
# Install dependencies
npm install

# Start Convex backend (run in separate terminal)
npx convex dev

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env.local` file:

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your-api-key
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── (auth)/               # Login, Signup
│   └── (dashboard)/          # Protected app routes
├── components/
│   ├── ui/                   # shadcn components
│   ├── onboarding/           # Welcome modal, help tips
│   └── resource/             # Resource builders (emotion cards, etc.)
└── lib/                      # Utilities and API clients

convex/
├── schema.ts                 # Database schema
├── users.ts                  # User queries/mutations
├── styles.ts                 # Style management
├── characters.ts             # Character management
└── resources.ts              # Resource queries/mutations
```

## Style Presets

Five built-in style presets to get started:

1. **Warm & Playful** — Coral, teal, sunny yellow with soft shapes
2. **Calm & Minimal** — Sage greens, line art, white space
3. **Bold & Colorful** — Purple, blue, cyan with geometric shapes
4. **Nature & Earthy** — Olive, tan, woodland creatures
5. **Whimsical Fantasy** — Lavender, pastels, dreamy aesthetic

## Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## License

Private project.
