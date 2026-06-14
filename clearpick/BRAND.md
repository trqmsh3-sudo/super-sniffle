# ClearPick.ai — Brand Identity

## Brand Personality

> "The smart friend who tells you what to buy."

ClearPick is **trustworthy, direct, and warm**. We cut through marketing noise and give people honest, confident recommendations — the same way a knowledgeable friend would over coffee. No fluff, no affiliate spin, just clarity.

**Three words that define us:** Clear. Confident. Human.

---

## Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#0A0A0F` | Page background (deep black) |
| `--primary` | `#F5C842` | CTA buttons, accents, highlights (warm gold) |
| `--surface` | `#141418` | Cards, panels (dark surface) |
| `--border` | `#2A2A35` | Dividers, card borders |
| `--text` | `#FFFFFF` | Primary text |
| `--text-muted` | `#9999AA` | Secondary text, placeholders |
| `--success` | `#22C55E` | Scores, positive signals |

### Color Rationale
- **Deep black background** creates premium, focused feel — like a cinema, not a supermarket
- **Warm gold primary** conveys value, trust, and decisiveness without being flashy
- **Dark surfaces** make product imagery pop and reduce eye strain for research sessions

---

## Typography

| Role | Font | Source |
|------|------|--------|
| Headings | **Cabinet Grotesk** | Google Fonts / Fontshare |
| Body | **Satoshi** | Google Fonts / Fontshare |

- **Cabinet Grotesk** — geometric grotesque with personality; premium but approachable
- **Satoshi** — clean, readable, excellent for UI labels and body copy at all sizes

### Type Scale
- Hero: 56px / weight 800 / tracking -0.03em
- H2: 36px / weight 700 / tracking -0.02em
- H3: 24px / weight 600
- Body: 16px / weight 400 / line-height 1.6
- Small/Label: 13px / weight 500 / tracking 0.02em uppercase

---

## Logo Concept

```
clear pick ✓
```

- `clear` — rendered in **#FFFFFF** (white), regular weight
- `pick` — rendered in **#F5C842** (gold), bold weight
- A minimal **checkmark** (`✓`) sits after "pick", colored gold
- The `.ai` suffix in muted `#9999AA`, smaller size (0.65em)
- No icon needed — wordmark is the logo

**Usage:**
- On dark backgrounds: white + gold (primary)
- On light backgrounds: `#0A0A0F` + gold
- Minimum size: 120px wide
- Never stretch, recolor, or add effects

---

## Design Principles

### 1. Mobile First
Every layout decision starts at 375px. Desktop is an enhancement, not the baseline. Touch targets are always 44px minimum.

### 2. One Action Per Screen
Each page has exactly one primary CTA. On the homepage: the search bar. On results: "View Deal". Never compete with yourself.

### 3. Radical Clarity
No jargon. No dark patterns. No unnecessary decoration. If an element doesn't help the user make a decision, remove it. White space is not empty space — it is breathing room for thinking.

### 4. Trust Through Restraint
We earn trust by showing less, not more. Fewer scores, clearly sourced. Fewer words, more signal. A recommendation that says "best overall" means nothing — "9.2/10 across 47 reviews" means everything.

### 5. Speed is a Feature
Pages must feel instant. Skeletons show immediately. Results stream in. No spinner sits for more than 200ms without feedback.

---

## Voice & Tone

| Context | Tone | Example |
|---------|------|---------|
| Homepage hero | Confident, inviting | "Find the best. Skip the research." |
| Search results | Direct, informative | "Top pick based on 2,400+ reviews" |
| Empty state | Helpful, warm | "Try searching 'best wireless earbuds under $100'" |
| Error state | Honest, calm | "Something went wrong. Your search is safe — try again." |
| Loading | Energetic | "Scanning 50+ sources..." |

---

## What ClearPick is NOT

- Not a deal aggregator (we're about quality, not discounts)
- Not a review farm (we synthesize, not create fake reviews)
- Not a generic AI chatbot (we are a decision tool)
- Not cluttered with ads or affiliate banners
