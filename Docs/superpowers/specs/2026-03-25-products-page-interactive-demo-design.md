# HemisX Products Page — Interactive Demo Design Spec

**Date:** 2026-03-25
**Status:** Approved
**Feature:** Storylane.io-style interactive product demos on the Products page

---

## Overview

Add a Storylane.io-style guided screenshot tour to the HemisX products page for each of the three core products: Cloud Misconfiguration Scanner, HEMIS (Red Team Engine), and AI Blue Team.

Each product is presented as a card on the products page. Clicking "Watch Demo" on a card opens a full-screen modal with a guided, step-by-step screenshot tour — pulsing hotspot highlights point to specific UI elements while tooltip callouts explain what the user is seeing.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Language:** TypeScript

This is a greenfield page — no existing codebase to integrate with.

---

## Page Structure

### Products Page (`/products`)

**Sections (top to bottom):**

1. **Nav bar** — HemisX logo, navigation links (Products, Pricing, Docs, Blog), "Get Early Access" CTA button
2. **Hero section** — badge ("AI-Native Security Platform"), headline, subtitle
3. **Product cards grid** — 3-column layout, one card per product
4. *(Future: pricing teaser or CTA banner below the grid)*

### Hero Copy
- Badge: "AI-Native Security Platform"
- Headline: "Three products. One unified platform."
- Subtitle: "Enterprise-grade AI security built for SMBs — offensive simulation, autonomous defense, and cloud posture management."

---

## Product Cards

Three cards in a responsive CSS grid (3 columns on desktop, 1 column on mobile).

Each card contains:
- Colored top accent line (unique per product)
- Product icon (emoji placeholder until brand icons are designed)
- Category label (small uppercase, color-matched)
- Product name (h3)
- Short description (2–3 sentences from PRD)
- Feature tags (pill badges)
- "Watch Demo" button (color-matched, with play icon)

### Product Color Identity

| Product | Accent Color | Tailwind Token |
|---|---|---|
| Cloud Misconfiguration Scanner | Indigo | `#6366f1` |
| HEMIS | Emerald | `#10b981` |
| AI Blue Team | Blue | `#3b82f6` |

### Product Card Content

**Cloud Misconfiguration Scanner**
- Label: Cloud Security
- Description: Automated detection and one-click remediation of AWS misconfigurations with SOC 2 and ISO 27001 compliance mapping.
- Tags: AWS, SOC 2, ISO 27001, Auto-remediation

**HEMIS**
- Label: Red Team Engine
- Description: AI/LLM-powered red team simulation engine. Attacks your own systems using natural language-driven adversarial techniques based on MITRE ATT&CK.
- Tags: MITRE ATT&CK, LLM-driven, 40+ techniques

**AI Blue Team**
- Label: Threat Response
- Description: Real-time AI threat detection and autonomous response engine. Monitors, correlates, and neutralizes active threats — 70% faster than manual SOC workflows.
- Tags: Real-time, Autonomous, 70% faster MTTR

---

## Demo Modal

Clicking "Watch Demo" on any product card opens a full-screen modal overlay with the guided tour for that product.

### Modal Structure

```
┌────────────────────────────────────────────────────┐
│ [Icon] Product Name          [Step X of Y]  [✕]    │  ← Header
├────────────────────────────────────────────────────┤
│                                                    │
│   [Screenshot]                                     │  ← Screenshot Area
│       [Hotspot ring]                               │    (820×380px)
│           [Tooltip: title + desc + ← Next]         │
│                                                    │
├────────────────────────────────────────────────────┤
│ Step title + description        [● ○ ○] [←] [→]   │  ← Footer
└────────────────────────────────────────────────────┘
```

### Modal Behavior
- Opens via Framer Motion `AnimatePresence` — modal slides up + fades in, backdrop fades in
- Closes on: close button click, backdrop click, or Escape key
- Body scroll is locked while modal is open
- On close, tour resets to step 1
- `ProductCardGrid` is a `"use client"` component and owns the modal open/close state and the active product. It renders a single `DemoModal` instance, passing the active `ProductDemo` as a prop. `ProductCard` receives an `onOpenDemo` callback. This avoids mounting 3 separate modals. `products/page.tsx` remains a server component that renders `ProductCardGrid`.

### Screenshot Area
- Container: `position: relative`, `overflow: hidden`, height is fixed per breakpoint:
  - Desktop (`> 1024px`): 380px tall
  - Tablet (`768–1024px`): 300px tall
  - Mobile (`< 768px`): 240px tall
- Dark background (`#020817`)
- Real product screenshot fills the container using Next.js `<Image fill objectFit="cover" />`
- Placeholder (until real screenshots provided): dark gray gradient with centered product name text
- Hotspot and tooltip are absolutely positioned over the screenshot container
- Images stored in `/public/demos/{product-slug}/step-{n}.png`
- `DemoStep` is wrapped in `AnimatePresence` keyed by step index — when the step changes, the current `DemoStep` (screenshot + hotspot + tooltip) animates out and the next one animates in together as a unit

### Hotspot
- A pulsing ring that highlights a specific region of the screenshot
- Position and size defined per step as `{ x, y, width, height }` in pixels relative to the screenshot container
- Accent color comes from `ProductDemo.accentColor` — passed as a prop
- Two layers:
  1. Outer glow ring — semi-transparent, slightly larger, animates opacity with Framer Motion
  2. Inner border ring — solid `accentColor` border, animates `box-shadow` pulse

### Tooltip Callout
- Positioned adjacent to the hotspot (above, below, left, or right — per `DemoStepData.tooltipPosition`)
- On viewports below 768px, `tooltipPosition` is ignored and all tooltips render at `bottom`. If the hotspot is in the bottom half of the screenshot container (y > containerHeight / 2), the tooltip flips to `top` instead to avoid overflow. This is determined with a JS `getBoundingClientRect` check at render time.
- Accent color comes from `ProductDemo.accentColor` — used for the step label text color
- Contains:
  - Step label ("Step 2 of 4", colored with `accentColor`) — intentionally duplicates the header step counter for in-context wayfinding while reading the tooltip
  - Title (bold, 13px) — same as `stepTitle` in the footer
  - Description (muted, 12px, max 2 sentences) — same as `description` in the footer
  - Inline mini-nav: Back / Next buttons only (no progress dots — dots live in the footer)
- Width: 240px fixed

**Note on duplication:** The tooltip title/description intentionally duplicates the footer text. The footer gives persistent wayfinding; the tooltip gives in-context reading. This is standard Storylane behavior.

### Footer
- Left: `stepTitle` + `description` (same fields as tooltip — intentional duplication; see tooltip note above)
- Right: `StepNav` component — progress dots + Back / Next buttons (accent-colored via `accentColor`)
- "Next" on last step changes to "Finish" and closes the modal
- `StepNav` is used only in the footer. The tooltip has its own inline Back/Next buttons — no progress dots in the tooltip.

---

## Demo Step Data Structure

Each product's demo is defined as a static TypeScript array:

```ts
type DemoStepData = {
  image: string;           // path to screenshot, e.g. '/demos/scanner/step-1.png'
  stepTitle: string;       // used in tooltip title AND modal footer
  description: string;     // used in tooltip body AND modal footer
  hotspot: {
    x: number;             // px from left of screenshot container
    y: number;             // px from top
    width: number;
    height: number;
  };
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
  // On viewports < 768px, tooltipPosition is ignored and tooltips always render at 'bottom'
};

type ProductDemo = {
  id: string;              // 'scanner' | 'hemis' | 'blueteam'
  name: string;
  accentColor: string;     // hex color — passed to Hotspot, DemoTooltip, StepNav, and demo button
  steps: DemoStepData[];
};
```

Demo data lives in `/src/data/demos.ts`. Steps use placeholder images until real screenshots are provided.

### Placeholder Step Content (3 steps per product)

**Cloud Misconfiguration Scanner**
1. `stepTitle: "Connect your AWS account"` — `description: "Link HemisX to your AWS environment in under 60 seconds using a read-only IAM role. No agent installation required."` — `tooltipPosition: 'right'`
2. `stepTitle: "Review critical findings"` — `description: "HemisX surfaces misconfigurations ranked by severity, mapped to SOC 2 and ISO 27001 controls."` — `tooltipPosition: 'left'`
3. `stepTitle: "One-click remediation"` — `description: "Apply the fix instantly. HemisX generates and applies the correct policy — no manual JSON editing needed."` — `tooltipPosition: 'left'`

**HEMIS (Red Team Engine)**
1. `stepTitle: "Define your attack scope"` — `description: "Describe the target in plain English. HEMIS maps it to the MITRE ATT&CK framework and selects relevant techniques."` — `tooltipPosition: 'right'`
2. `stepTitle: "Run the simulation"` — `description: "HEMIS launches a safe, non-destructive red team simulation against your own systems using AI-generated adversarial techniques."` — `tooltipPosition: 'bottom'`
3. `stepTitle: "Review your attack surface"` — `description: "See every exploited path ranked by risk. Each finding links to the MITRE technique and recommended remediation."` — `tooltipPosition: 'left'`

**AI Blue Team**
1. `stepTitle: "Real-time threat monitoring"` — `description: "AI Blue Team ingests logs, alerts, and network events across your stack and correlates them in real time."` — `tooltipPosition: 'right'`
2. `stepTitle: "Autonomous threat triage"` — `description: "When a threat is detected, the AI Blue Team classifies severity, traces the attack path, and recommends a response — in seconds."` — `tooltipPosition: 'left'`
3. `stepTitle: "Autonomous response actions"` — `description: "Approve the suggested response or let it run automatically. Isolate hosts, revoke tokens, and block IPs without writing runbooks."` — `tooltipPosition: 'left'`

All placeholder hotspot positions default to `{ x: 100, y: 80, width: 120, height: 32 }` until real screenshots are provided and coordinates are updated.

---

## Component Architecture

```
src/
  app/
    products/
      page.tsx              ← Products page (server component)
  components/
    products/
      ProductsHero.tsx      ← Hero section
      ProductCard.tsx       ← Individual product card
      ProductCardGrid.tsx   ← 3-column grid wrapper
      DemoModal.tsx         ← Full-screen modal with Framer Motion
      DemoStep.tsx          ← Screenshot + hotspot + tooltip for one step
      Hotspot.tsx           ← Pulsing highlight ring
      DemoTooltip.tsx       ← Tooltip callout bubble
      StepNav.tsx           ← Back/Next buttons + progress dots
  data/
    demos.ts                ← Step data for all 3 products
  types/
    demo.ts                 ← TypeScript types (DemoStepData, ProductDemo)
```

Each component has a single clear responsibility and communicates through props. `DemoModal` owns the step state and passes the current step down to `DemoStep`.

---

## Animations (Framer Motion)

| Element | `initial` | `animate` | `exit` | Duration | Easing |
|---|---|---|---|---|---|
| Modal backdrop | `opacity: 0` | `opacity: 1` | `opacity: 0` | 200ms | `easeOut` |
| Modal panel | `opacity: 0, y: 20` | `opacity: 1, y: 0` | `opacity: 0, y: 20` | 250ms | `easeOut` |
| `DemoStep` (step transition) | `opacity: 0` | `opacity: 1` | `opacity: 0` | 200ms | `easeInOut` |
| Tooltip (step change) | `opacity: 0, y: 8` | `opacity: 1, y: 0` | `opacity: 0, y: 8` | 200ms | `easeOut` |
| Hotspot outer glow | `opacity: 0.2` | `opacity: 0.6` (loop) | — | 2s loop, `easeInOut` | — |
| Hotspot inner ring | `boxShadow: 0 0 0 0 rgba(accentColor, 0.6)` | `boxShadow: 0 0 0 8px rgba(accentColor, 0)` (loop) | — | 2s loop, `easeInOut` | — |

All transitions use Framer Motion `AnimatePresence` + `motion.*` components. The hotspot animations use `animate` with `repeat: Infinity, repeatType: "loop"`.

---

## Responsive Behavior

| Breakpoint | Cards Layout | Modal Width |
|---|---|---|
| Mobile (`< 768px`) | 1 column | Full screen |
| Tablet (`768–1024px`) | 2 columns | 90vw |
| Desktop (`> 1024px`) | 3 columns | 820px max-width |

On mobile (`< 768px`), tooltip `position` is ignored — see tooltip overflow handling in the Tooltip Callout section above.

---

## Image Handling

- Screenshots are static files in `/public/demos/{product-slug}/step-{n}.png`
- Use Next.js `<Image>` component with `fill` layout inside the screenshot container
- Placeholder: gray gradient block with product name until real screenshots are provided
- User will supply real screenshots after initial build

---

## Accessibility

- Modal traps focus when open (`focus-trap-react` or manual implementation)
- Close button and nav buttons are keyboard-navigable
- Backdrop click and Escape key close the modal
- `aria-label` on all icon-only buttons
- `role="dialog"` and `aria-modal="true"` on the modal panel

---

## File Naming Conventions

- Components: PascalCase (e.g., `DemoModal.tsx`)
- Data files: camelCase (e.g., `demos.ts`)
- Image assets: kebab-case (e.g., `step-1.png`)
- CSS: Tailwind utility classes only, no separate CSS files

---

## Out of Scope (MVP)

- Backend or API — this is a static marketing page
- User accounts or auth
- Analytics on demo interactions (can add later)
- Autoplay / video-style demos
- Embedding real Storylane.io iframes
