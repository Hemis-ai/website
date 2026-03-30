# HemisX Cinematic Homepage & Products Page Redesign
**Date:** 2026-03-29
**Status:** Approved
**Scope:** index.html (homepage), products.html (products page)

---

## Overview

Upgrade the HemisX website's homepage and products page from a polished-but-static brutalist site into a cinematic, scroll-driven experience. The brutalist visual identity (Cabinet Grotesk, thick borders, hard shadows, yellow/charcoal palette) is preserved as the structural skeleton. Cinematic motion, atmospheric depth, and dramatic product reveals are layered on top.

**Tech approach:** GSAP + ScrollTrigger added via CDN. No framework changes. Existing vanilla HTML/CSS/JS architecture stays intact.

---

## Part 1: Homepage (index.html)

### 1.1 Hero Section

**Layout change:** Convert centered hero to a split-screen layout.
- Left 55%: headline, subtext, CTAs, meta info
- Right 45%: globe panel — borderless, bleeds to viewport edge, full height

**Headline entrance animation:**
- Each word is a separate `<span>` element
- On load: words drop from 60px above with slight rotation (–3deg → 0deg), landing with elastic bounce
- Stagger: 80ms per word, starts at 0.3s after page load
- Library: GSAP with `elastic.out(1, 0.5)` easing

**Background:**
- Existing dot grid stays
- Add slow chromatic sweep: a radial gradient overlay cycles hue (red → yellow → green) on an 8s loop via CSS `@keyframes`
- Represents threat → alert → resolution arc subliminally

**CTA interactions:**
- "Launch Console ⚡": scan-line sweep on hover — a bright `::after` pseudo-element races left-to-right across button face in 0.35s
- "Explore the Suite": magnetic pull — JS tracks cursor proximity within 80px, button translates toward cursor max 4px via `mousemove` listener

**Scroll indicator:**
- Remove current animated bar
- Replace with self-typing "scroll to begin" text (CSS typing animation, 1.5s)
- Below: a dotted vertical line (8px gaps) with a yellow pulse dot that travels downward on a 2s loop

**Globe panel:**
- Globe fills the right panel fully (remove current size constraints)
- On scroll: globe scales down from 1.0 → 0.6 as user scrolls past hero, creating a "pulling away" depth effect
- Globe panel has a very subtle yellow border-left (2px, 20% opacity) — the brutalist frame

---

### 1.2 How It Works — Horizontal Scroll Sequence

**Structure:**
- Section is scroll-pinned (existing behavior kept)
- Converts from vertical text-swap to **4 horizontal full-screen panels**
- Container: `display: flex`, width `400vw`, pinned via GSAP ScrollTrigger `scrub: 1`
- Each panel: `100vw × 100vh`, overflow hidden

**Panel 1 — "The Threat":**
- Background: charcoal with red ambient glow (radial, bottom-right)
- Globe from hero flies in (scaled-down clone) from top-right via GSAP `fromTo`
- Threat arcs multiply (increase arc count on panel enter)
- Headline: *"Attackers don't wait for your team to catch up."*
- Text enters: opacity 0 → 1 with 30px upward translateY, 0.6s ease-out

**Panel 2 — "The Scan":**
- Background: charcoal, no glow
- Terminal window element, borderless top, brutal bottom-left shadow
- IP range populates line by line: CSS animation, 12 lines, 80ms per line
- Yellow highlights on CVE IDs: `background: var(--yellow)`, `color: black`
- Terminal title bar: "HEMISX SCAN ENGINE v2.1 — RUNNING"

**Panel 3 — "The Finding":**
- Background: charcoal with red pulse glow that intensifies
- Vulnerability card slams in from left: `translateX(-120%)` → `translateX(0)` with `power4.out`, 0.5s
- Card has standard brutalist styling (2px black border, 8px hard shadow)
- CVSS score counter: 0.0 → 9.2 over 1.2s using GSAP `CountTo` or custom `requestAnimationFrame`
- Score color transitions: green (0–3) → yellow (4–6) → orange (7–8) → red (9+)
- Remediation text fades in 0.4s after score settles

**Panel 4 — "The Fix":**
- Background: charcoal with green ambient glow
- Code block (Terraform snippet, syntax-highlighted): types itself out at 18ms per character
- After code completes (or 2s): "PATCHED" stamp animates in
  - Stamp: red outline text, rotates from –15deg → –8deg, scales 1.4 → 1.0 with overshoot, opacity 0 → 1
  - Lands with a CSS `transform-origin: center` drop
- Globe reappears in corner (same clone), threat arcs gone, slow rotation only

**Progress indicator:**
- 4 numbered brutalist dots along the bottom center
- Active dot: filled yellow background, black number
- Inactive: black border, transparent fill
- Dots update via ScrollTrigger `onUpdate` callback based on scroll progress

---

### 1.3 Features Section (Grid of 3 Cards)

**Entry animation (ScrollTrigger, start: "top 75%"):**
- Left card: enters from `translateX(-80px)`, opacity 0 → 1
- Center card: enters from `translateY(80px)`, opacity 0 → 1
- Right card: enters from `translateX(80px)`, opacity 0 → 1
- All three triggered simultaneously, 0.7s `power3.out`

**Ambient glow per card (CSS, always on, slow loop):**
- Cloud Scanner: `radial-gradient` blue (#3b82f6 at 15% opacity), 8s pulse loop
- HEMIS Red Team: `radial-gradient` red (#ff5f57 at 15% opacity), 8s pulse loop, offset phase
- Blue Team: `radial-gradient` green (#34d399 at 15% opacity), 8s pulse loop, offset phase

**Hover state upgrades:**
- Card lifts: `translateY(-8px)`, transition 0.25s
- Icon: `scale(1.15)`, transition 0.25s
- Scan-line sweep: `::after` pseudo-element, same as CTA button but card-width, 0.4s
- Shadow: `var(--shadow-sm)` (4px 4px) → 12px 12px 0 0, transition 0.25s

---

## Part 2: Products Page (products.html)

### 2.1 Page Header

**Replace current static header with:**
- Behind the title: a slow-scrolling marquee of threat intelligence terms
  - Content: `CVE-2024-xxxx · CRITICAL · RCE · SQL INJECTION · LATERAL MOVEMENT · PRIVILEGE ESCALATION · ZERO-DAY · C2 BEACON · DATA EXFIL · `
  - Two copies concatenated for seamless loop
  - Speed: 35s loop, left-to-right scroll
  - Style: 14px monospace, 15% opacity, uppercase — doesn't compete with title
- Page title sits above as normal, `position: relative`, `z-index: 2`
- A frosted dark overlay (`background: rgba(23,30,25,0.85)`) masks the marquee behind the title area

---

### 2.2 Product Stage Layout

Replace grid layout with **3 sequential full-width stages**, each `min-height: 90vh`.

**Between stages:** A brutalist horizontal divider with product number (`01`, `02`, `03`) in 64px type, centered. The number and line animate in via ScrollTrigger when divider enters viewport.

**Stage structure (left/right split):**

```
[Left 48% — Identity Panel] | [Right 52% — Live Preview Panel]
```

**Left Identity Panel:**
- Product name: 120px Cabinet Grotesk 800, `letter-spacing: -3px`
- Parallax: `data-speed="0.7"` — scrolls at 70% of page speed, creating depth
- Punch line: types in character by character on stage entry (CSS animation, 0.8s total)
- Tech badges: pop in with 30ms stagger, `scale(0) → scale(1)` with `back.out(1.7)`
- CTA: same scan-line hover effect from homepage

**Right Live Preview Panel — Per Product:**

**Product 1 — Cloud Scanner:**
- Fake dashboard card grid (3×2, small cards)
- On entry: cards appear one by one (60ms stagger), then 3 misconfigs highlight with red border pulse
- A compliance meter bar fills: 0% → 73% over 1.5s with `power2.out` easing
- Meter label transitions: "SCANNING..." → "73% COMPLIANT" with text fade swap

**Product 2 — HEMIS Red Team:**
- Terminal window (same brutalist styling as homepage Panel 2)
- Attack playbook streams in: 8 lines of fake commands at 120ms per line
- Line 6: `[CRITICAL] CVE-2024-3094 — Authentication Bypass` — highlighted red
- After line 8 completes: "CRITICAL FINDING" banner slides in from right
  - Banner: red background, white text, 2px black border, 8px hard shadow
  - Slides from `translateX(120%)` → `translateX(0)`, 0.4s `power3.out`

**Product 3 — Blue Team:**
- Radar/sonar circle: CSS `border-radius: 50%`, pulsing concentric rings expand outward (`scale(1) → scale(2.5)`, opacity fade, 2s loop)
- 4 threat blips appear at random positions on the radar (small red dots, 12px)
- Each blip gets intercepted: green checkmark SVG bounces in over it (`scale(0) → scale(1)` elastic)
- After all 4 intercepted: radar glow shifts from red to green ambient

**Stage entry animation (ScrollTrigger, start: "top 60%"):**
- Left panel: `translateX(-80px)` → `translateX(0)`, opacity 0 → 1, 0.7s `power3.out`
- Right panel: `translateX(80px)` → `translateX(0)`, opacity 0 → 1, 0.7s `power3.out`
- Both triggered simultaneously
- Background glow (per product color) fades in: opacity 0 → 1, 1.2s ease

---

## Implementation Notes

### Dependencies to Add
- **GSAP 3.x** (CDN): `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **ScrollTrigger plugin** (CDN): `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js`
- No other new dependencies. Three.js already present.

### Files to Modify
1. `index.html` — layout restructure + GSAP animation scripts
2. `products.html` — full section restructure + GSAP animation scripts
3. `styles.css` — new utility classes for glows, scan-line pseudo-elements, stage layouts
4. No changes to `globe.js`, `cursor.js`, `boot.js`, `animated-bg.js`

### Performance Considerations
- All GSAP animations use `will-change: transform` only on actively animating elements, removed after animation completes via `onComplete` callback
- Ambient glow CSS animations use `opacity` and `transform` only (compositor thread, no layout reflow)
- Horizontal scroll sequence uses `scrub: 1` for smooth GPU-composited scrolling
- Fake terminal/dashboard content is pure CSS/HTML — no JS timers that could block main thread
- Mobile: horizontal scroll sequence falls back to vertical stacked panels at ≤768px; live preview panels are hidden on mobile (identity panel only shown)

### Mobile Strategy
- Hero split-screen stacks vertically (globe below text) at ≤900px
- Horizontal scroll panels become vertical stacked sections at ≤768px
- Product stages stack vertically (identity above preview) at ≤900px
- Live preview panels hidden at ≤600px (too complex to scale down, identity panel carries the section)
- All GSAP animations still fire on mobile — just with adjusted `translateY` instead of `translateX` for stacked layouts

---

## Success Criteria
- Scroll through homepage feels like a narrative journey with no jarring section jumps
- Products page: each product has a distinct "moment" that communicates its power visually without reading the copy
- All animations run at 60fps on a mid-range MacBook (no jank on scroll)
- Mobile experience degrades gracefully — no broken layouts
- Boot sequence, globe, custom cursor, and nav remain unchanged
