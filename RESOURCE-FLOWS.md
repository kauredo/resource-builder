# Resource Flows

Complete documentation of each resource type's creation flow, data model, and final output.

---

## Shared Infrastructure

All resources share these systems:

```mermaid
block-beta
  columns 4
  block:styles["Styles"]:1
    s1["Colors"]
    s2["Typography"]
    s3["Illustration style"]
    s4["Frames"]
  end
  block:chars["Characters"]:1
    c1["Name"]
    c2["promptFragment"]
    c3["Description"]
    c4["Per-item mode"]
  end
  block:assets["Assets"]:1
    a1["Versioning"]
    a2["History"]
    a3["Pinning"]
    a4["Pruning (max 10)"]
  end
  block:tags["Tags"]:1
    t1["string[] per resource"]
    t2["Normalize + dedup"]
  end

  style styles fill:#f9d5c7,stroke:#e67e5a
  style chars fill:#c7e8f0,stroke:#5ab5cc
  style assets fill:#d5e8d4,stroke:#82b366
  style tags fill:#e8e0f0,stroke:#9673b9
```

**How they connect:**
- **Styles** → applied to all image generation prompts + PDF color/font rendering
- **Characters** → `promptFragment` prepended to image prompts for visual consistency
- **Assets** → every generated image stored with full prompt for regeneration
- **Tags** → lightweight organization on each resource

### Two Wizard Patterns

```mermaid
flowchart LR
  subgraph ai["AIWizard (unified 4-step)"]
    direction TB
    A0[Describe] --> A1[Review] --> A2[Generate] --> A3[Export]
  end

  subgraph custom["Custom Wizards"]
    direction TB
    B0[Type-specific steps]
    B1[Bespoke per resource]
  end

  Poster --> ai
  Flashcards --> ai
  CardGame["Card Game"] --> ai
  BoardGame["Board Game"] --> ai

  EmotionCards["Emotion Cards (5 steps)"] --> custom
  Worksheet["Worksheet (4 steps)"] --> custom
  FreePrompt["Free Prompt (4 steps)"] --> custom
```

---

## 1. Emotion Cards

The most mature resource type. Custom 5-step wizard with frame support.

**Purpose:** Deck of illustrated emotion cards for therapy sessions — children identify and discuss feelings using visual aids.

### Creation Flow

```mermaid
flowchart TD
  S1["Step 1: Name & Style
  Deck name + visual style
  (locked after creation)"]

  S2["Step 2: Emotion Selection
  Pick from 20 emotions across 3 tiers:
  Primary (6) · Secondary (6) · Nuanced (8)"]

  S3["Step 3: Options
  Character (optional, single for all cards)
  Layout: 4/6/9 per page, labels, descriptions
  Frames: border / fullCard / none"]

  S4["Step 4: Generate & Review
  Batch generation (3 concurrent)
  1 image per emotion · 1:1 square · Gemini 3 Pro
  Can regenerate/edit individual cards"]

  S5["Step 5: Export
  Toggle cut lines · Download PDF
  Resource marked complete"]

  S1 --> S2 --> S3 --> S4 --> S5
```

### Card Anatomy

```
+-------------------------+
|                         |
|                         |
|    AI-generated         |    75% of card height
|    illustration         |    1:1 aspect ratio
|    (emotion scene)      |
|                         |
|                         |
+-------------------------+
|  Happy                  |    Label (heading font)
|  Feeling good           |    Description (body font)
+-------------------------+

Optional frame overlays:
+- - - - - - - - - - - - +    Border frame (decorative edges)
|  +-------------------+  |        OR
|  |     content       |  |    Full-card frame (template
|  +-------------------+  |    with transparent center)
+- - - - - - - - - - - - +
```

### Final PDF Output

```
A4 Page (example: 6 cards per page, 2x3 grid)
+---------------------------------------+
|  +-----------+  +-----------+         |
|  |  Happy    |  |   Sad     |         |
|  |  [img]    |  |  [img]    |         |
|  |  label    |  |  label    |         |
|  +-----------+  +-----------+         |
|  +-----------+  +-----------+         |
|  |  Angry    |  | Scared    |         |
|  |  [img]    |  |  [img]    |         |
|  |  label    |  |  label    |         |
|  +-----------+  +-----------+         |
|  +-----------+  +-----------+         |
|  |Surprised  |  |Disgusted  |         |
|  |  [img]    |  |  [img]    |         |
|  |  label    |  |  label    |         |
|  +-----------+  +-----------+         |
|                                       |
|  - - - - - - - - - - - - - - -       |  Optional cut lines
+---------------------------------------+

Grids: 4 (2x2), 6 (2x3), or 9 (3x3) cards per A4 page
Margins: 36pt (0.5")
Fonts: style's heading + body fonts
Colors: style's color palette
```

### Unique Features
- **Frame assets** — AI-generated decorative frames (chroma key -> transparency)
- **Card layout settings** — text position (bottom/overlay/integrated), content height, image overlap
- **Per-style defaults** — frame usage inherited from style's `defaultUseFrames`

---

## 2. Card Game

Most sophisticated architecture. Template-based composition system.

**Purpose:** Custom card game decks (UNO-style or custom rules). A small set of reusable backgrounds + icons compose into 30-100+ unique cards efficiently.

### Creation Flow

```mermaid
flowchart TD
  S0["Step 0: Describe
  Describe card game + select style
  Optional character
  AI generates full game structure (Gemini Flash)"]

  S1["Step 1: Review & Edit
  Game name, rules
  Backgrounds (~3-5, color-coded)
  Icons (~3-5, transparent symbols)
  Card back (optional)
  Text settings (font, size, color, outline)
  Card types (30-100+ definitions)
  Character placement + text display mode"]

  S2["Step 2: Generate Images
  Backgrounds: 3:4 portrait (standard)
  Icons: 1:1 square (GREEN SCREEN)
  Card back: 3:4 portrait
  Total: ~8-12 images for 30-100+ cards"]

  S3["Step 3: Export
  Print-ready PDF
  Optional card backs for double-sided"]

  S0 --> S1 --> S2 --> S3
```

### Card Composition (how ~10 images become 50+ cards)

```mermaid
flowchart LR
  subgraph composition["Card Composition Layers"]
    direction TB
    L1["Layer 1: Background
    Full-card image (3:4)
    Fills entire card"]
    L2["Layer 2: Icon
    Transparent PNG (1:1)
    Centered, scaled (0.1-1.0)"]
    L3["Layer 3: Primary Text
    With outline effect
    (8 offset copies behind fill)"]
    L4["Layer 4: Secondary Text
    Smaller, below primary"]
  end

  L1 --> CARD["Final Card"]
  L2 --> CARD
  L3 --> CARD
  L4 --> CARD
```

### Icon Generation Pipeline

```mermaid
flowchart LR
  A["AI generates image
  with #00FF00
  green background"] --> B["Decode base64
  from Gemini API"] --> C["Chroma key
  processing
  (sharp, server-side)"] --> D["Transparent
  512x512 PNG"]
```

### Final PDF Output

```
A4 Page (9 cards per page, 3x3 grid)
+------------------------------------------+
|  +--------+  +--------+  +--------+      |
|  |Red bg  |  |Red bg  |  |Blue bg |      |
|  |  "1"   |  |  "2"   |  |  "1"   |      |
|  +--------+  +--------+  +--------+      |
|  +--------+  +--------+  +--------+      |
|  |Blue bg |  |Red bg  |  |Blue bg |      |
|  |  "2"   |  | Skip   |  | Reverse|      |
|  +--------+  +--------+  +--------+      |
|  +--------+  +--------+  +--------+      |
|  |Green   |  |Green   |  | Wild   |      |
|  |  "1"   |  |  "2"   |  | card   |      |
|  +--------+  +--------+  +--------+      |
+------------------------------------------+

Optional: card back pages interleaved for double-sided printing
+------------------------------------------+
|  +--------+  +--------+  +--------+      |
|  | xxxxxx |  | xxxxxx |  | xxxxxx |      |
|  | xxxxxx |  | xxxxxx |  | xxxxxx |      |  Decorative
|  | xxxxxx |  | xxxxxx |  | xxxxxx |      |  card back
|  +--------+  +--------+  +--------+      |  pattern
|  ...                                     |
+------------------------------------------+

Each card type expanded by its `count` field
(e.g., "Red 1" x 2 = two physical cards in the PDF)
```

### Unique Features
- **Template composition** — generate ~10 images, compose 50+ unique cards
- **Chroma key icons** — green screen -> transparent PNG pipeline
- **Text outline rendering** — 8 offset copies simulate stroke effect in PDF
- **Character placement modes** — backgrounds only / icons only / both / none
- **Text display modes** — all / numbers_only / none

---

## 3. Poster

Simplest AI-driven resource. Single image with headline text.

**Purpose:** Therapy room wall poster — visual reminder (e.g., "Take a Breath") with an illustration.

### Creation Flow

```mermaid
flowchart TD
  S0["Step 0: Describe
  'A calming poster for deep breaths...'
  Select style + optional character
  AI generates: headline, subtext, image prompt"]

  S1["Step 1: Review & Edit
  Edit headline, subtext, image prompt"]

  S2["Step 2: Generate
  1 image, 3:4 portrait
  Text baked into image"]

  S3["Step 3: Export
  Full-page PDF, 1 image per page"]

  S0 --> S1 --> S2 --> S3
```

### Final PDF Output

```
A4 Page (full-page layout)
+---------------------------------------+
|  +---------------------------------+  |
|  |                                 |  |
|  |                                 |  |
|  |    AI-generated poster          |  |
|  |    illustration                 |  |
|  |    (3:4 portrait)               |  |
|  |                                 |  |
|  |    Text baked in by AI          |  |
|  |    during generation            |  |
|  |                                 |  |
|  |                                 |  |
|  +---------------------------------+  |
|                                       |
|  36pt margins on all sides            |
+---------------------------------------+
```

---

## 4. Flashcards

Multi-card resource with front/back text and individual illustrations.

**Purpose:** Coping skills, vocabulary, or concept cards — children flip cards to learn associations.

### Creation Flow

```mermaid
flowchart TD
  S0["Step 0: Describe
  'Coping skills flashcards for anxious children...'
  Select style + optional character
  AI generates: card array with front/back text + image prompts"]

  S1["Step 1: Review & Edit
  Edit deck name
  Per card: front text, back text, image prompt
  Add / remove cards"]

  S2["Step 2: Generate
  1 image per card, 1:1 square
  Text baked in
  Batch generation (3 concurrent)"]

  S3["Step 3: Export
  Grid PDF (6 per page, 2x3)
  Optional: blank back pages for double-sided"]

  S0 --> S1 --> S2 --> S3
```

### Final PDF Output

```
A4 Page (6 cards per page, 2x3 grid)
+---------------------------------------+
|  +------------+  +------------+       |
|  | Breathe    |  | Stretch    |       |
|  |   [img]    |  |   [img]    |       |
|  +------------+  +------------+       |
|  +------------+  +------------+       |
|  | Name it    |  | Ask for    |       |
|  |   [img]    |  |   help     |       |
|  +------------+  +------------+       |
|  +------------+  +------------+       |
|  | Ground     |  | Squeeze    |       |
|  |   [img]    |  |   [img]    |       |
|  +------------+  +------------+       |
+---------------------------------------+

Optional: blank back pages for double-sided printing
```

---

## 5. Board Game

Grid-based game board with tokens and instruction cards.

**Purpose:** Therapeutic board games — children advance through spaces completing activities or answering prompts.

### Creation Flow

```mermaid
flowchart TD
  S0["Step 0: Describe
  'A feelings exploration board game...'
  Select style + optional character
  AI generates: grid, board prompt, tokens, cards"]

  S1["Step 1: Review & Edit
  Grid size (3-10 rows/cols), cell labels
  Board background image prompt
  Tokens (name + color)
  Game cards (title + instructions)"]

  S2["Step 2: Generate
  1 image: board background, 1:1 square
  Text baked in"]

  S3["Step 3: Export
  Full-page PDF (same as poster)"]

  S0 --> S1 --> S2 --> S3
```

### Final PDF Output

```
A4 Page (full-page layout)
+---------------------------------------+
|  +---------------------------------+  |
|  |                                 |  |
|  |   AI-generated board game       |  |
|  |   illustration with grid        |  |
|  |                                 |  |
|  |   +--+--+--+--+--+--+          |  |
|  |   | 1| 2| 3| 4| 5| 6|          |  |
|  |   +--+--+--+--+--+--+          |  |
|  |   |12|11|10| 9| 8| 7|          |  |
|  |   +--+--+--+--+--+--+          |  |
|  |   |..|..|..|..|..|..|          |  |
|  |   +--+--+--+--+--+--+          |  |
|  |                                 |  |
|  +---------------------------------+  |
+---------------------------------------+

Note: Grid structure is part of the AI-generated image,
not rendered separately in the PDF.
```

---

## 6. Worksheet

Structured form with block-based content builder. Custom wizard (not AI-driven).

**Purpose:** Therapy worksheets with prompts, checklists, rating scales, and writing spaces — printed handouts for in-session activities.

### Creation Flow

```mermaid
flowchart TD
  S0["Step 0: Name & Style
  Worksheet name + visual style"]

  S1["Step 1: Block Builder (manual)
  Add blocks of 6 types:
  heading | prompt | text
  lines | checklist | scale"]

  S2["Step 2: Header Image (optional)
  Write image prompt
  Generate 1 image, 4:3 landscape
  No text baked in"]

  S3["Step 3: Export
  Custom PDF renderer (not image-based)
  Each block type has own PDF layout"]

  S0 --> S1 --> S2 --> S3
```

### Block Types

```mermaid
flowchart LR
  subgraph blocks["6 Block Types"]
    direction TB
    H["heading — Large title text"]
    P["prompt — Question / instruction"]
    T["text — Regular paragraph"]
    L["lines — Blank writing lines (1-10)"]
    C["checklist — Checkbox items"]
    S["scale — Min/max labeled scale"]
  end
```

### Final PDF Output

```
A4 Page (custom block rendering)
+---------------------------------------+
|                                       |
|  +---------------------------------+  |
|  |   [Optional header image]       |  |  4:3, 160px height
|  +---------------------------------+  |
|                                       |
|  My Feelings Journal                  |  heading block
|  ---------------------------          |
|                                       |
|  How are you feeling today?           |  prompt block
|                                       |
|  _________________________________    |
|  _________________________________    |  lines block (3 lines)
|  _________________________________    |
|                                       |
|  Things I tried today:                |  prompt block
|                                       |
|  [ ] Deep breaths                     |
|  [ ] Named my feeling                 |  checklist block
|  [ ] Asked for help                   |
|                                       |
|  How intense was it?                  |  prompt block
|  Not at all ----------- Very much     |  scale block
|                                       |
+---------------------------------------+

Blocks are rendered as styled text/shapes in the PDF,
NOT as images. Style colors applied to text and lines.
```

### Unique Features
- **Block-based editor** — only resource type with structured form content
- **No AI content generation** — blocks are manually composed
- **PDF renders blocks natively** — text, lines, checkboxes, scales as PDF primitives
- **Optional header image** — only decorative element that uses AI generation

---

## 7. Free Prompt

Open-ended single-image generation. Simplest resource type.

**Purpose:** Anything that doesn't fit the structured types — custom illustrations, activity visuals, or therapeutic imagery.

### Creation Flow

```mermaid
flowchart TD
  S0["Step 0: Name & Style
  Resource name + visual style"]

  S1["Step 1: Prompt
  Freeform text prompt (user writes everything)
  Select aspect ratio: 1:1 / 3:4 / 4:3
  No AI assistance"]

  S2["Step 2: Generate
  1 image at chosen aspect ratio
  No text baked in"]

  S3["Step 3: Export
  Full-page PDF"]

  S0 --> S1 --> S2 --> S3
```

### Final PDF Output

```
A4 Page (full-page layout)
+---------------------------------------+
|  +---------------------------------+  |
|  |                                 |  |
|  |   User-prompted                 |  |
|  |   AI illustration               |  |
|  |                                 |  |
|  |   (1:1, 3:4, or 4:3            |  |
|  |    based on selection)          |  |
|  |                                 |  |
|  +---------------------------------+  |
|                                       |
|  36pt margins                         |
+---------------------------------------+
```

---

## Comparison Matrix

| Feature | Emotion Cards | Card Game | Poster | Flashcards | Board Game | Worksheet | Free Prompt |
|---|---|---|---|---|---|---|---|
| **Wizard** | Custom 5-step | AIWizard | AIWizard | AIWizard | AIWizard | Custom 4-step | Custom 4-step |
| **AI content gen** | No (predefined) | Yes (Gemini Flash) | Yes | Yes | Yes | No | No |
| **Images generated** | 1 per emotion | ~8-12 templates | 1 | 1 per card | 1 | 0-1 | 1 |
| **Image aspect** | 1:1 | 3:4 + 1:1 icons | 3:4 | 1:1 | 1:1 | 4:3 | User choice |
| **Text in image** | Configurable | Via PDF overlay | Yes (baked) | Yes (baked) | Yes (baked) | No | No |
| **Character** | Single for all | Placement modes | Optional | Optional | Optional | No | No |
| **PDF layout** | Grid (4/6/9) | Grid (9) + backs | Full page | Grid (6) | Full page | Block renderer | Full page |
| **Frames** | Yes | No | No | No | No | No | No |
| **Double-sided** | No | Yes (card backs) | No | Yes (blank backs) | No | No | No |
| **Unique** | Frames + layout | Template composition | Simplest AI flow | Front/back cards | Grid editor | Block builder | Aspect ratio choice |

---

## Image Generation Pipeline (All Types)

```mermaid
flowchart TD
  subgraph prompt["Build Prompt"]
    P1["1. Character context (promptFragment)"]
    P2["2. Content (type-specific)"]
    P3["3. Style (illustrationStyle)"]
    P4["4. Colors (primary, secondary, accent)"]
    P5["5. Text rules (include/exclude)"]
    P6["6. Quality (print-ready, aspect ratio)"]
  end

  prompt --> API["Gemini 3 Pro Image API
  Batch: 3 concurrent max"]

  API --> |Standard images| Store["Asset System
  Asset record (ownerType + key)
  AssetVersion (storageId, prompt)
  Max 10 unpinned versions
  Pinned versions preserved"]

  API --> |Icons only| Chroma["Chroma Key Pipeline
  #00FF00 -> transparent
  Scale to 512x512
  Output: PNG with alpha"]

  Chroma --> Store
```

---

## PDF Generation Approaches

```mermaid
flowchart TD
  subgraph specialized["Specialized Generators"]
    EC["generateEmotionCardsPDF()
    Grid 4/6/9 per page
    Labels + frames
    Cut lines toggle"]

    CG["generateCardGamePDF()
    Composition engine:
    bg + icon + text overlay
    Text outline effect
    Card backs, 9 per page"]

    WS["generateWorksheetPDF()
    Block renderer:
    heading, prompt, text
    lines, checklist, scale
    Header image"]
  end

  subgraph shared["Shared Simple Generator"]
    IP["generateImagePagesPDF()
    Modes: full_page or grid
    Optional: interleaved back pages"]
  end

  Poster --> IP
  Flashcards --> IP
  BoardGame["Board Game"] --> IP
  FreePrompt["Free Prompt"] --> IP

  EmotionCards["Emotion Cards"] --> EC
  CardGame["Card Game"] --> CG
  Worksheet --> WS

  EC & CG & WS & IP --> PDF["@react-pdf/renderer
  Client-side, A4, 36pt margins"]
```
