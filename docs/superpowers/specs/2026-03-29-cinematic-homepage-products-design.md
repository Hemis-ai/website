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
- Right 45%: globe wrapper panel — a positioned `<div>` container that restricts the globe to the right half

> **Implementation note:** The current globe canvas uses `position: absolute; top: 0; left: 0; width: 100%; height: 100%` and fills the entire viewport. To confine it to the right panel, wrap it in a `<div class="hero-globe-panel">` with `position: relative; overflow: hidden; width: 45%; height: 100vh`. The globe's existing `renderer.setSize()` call in `globe.js` must be updated to use the wrapper's dimensions instead of `window.innerWidth/Height`. Add a `getContainer()` export or parameter to `globe.js` so it accepts a target element. This is a minimal change to `globe.js` — only the size initialization line and the `onWindowResize` handler need updating.

**Headline entrance animation:**
- Each word is a separate `<span>` element
- On load: words drop from 60px above with slight rotation (–3deg → 0deg), landing with elastic bounce
- Stagger: 80ms per word, starts at 0.3s after page load
- Library: GSAP with `elastic.out(1, 0.5)` easing

**Background:**
- Existing dot grid stays
- Add slow chromatic sweep: a radial gradient overlay cycles hue (red → yellow → green) on an 8s loop via CSS `@keyframes`
- Keep overlay opacity at or below 6% to avoid muddying the globe's own green/yellow color palette
- Represents threat → alert → resolution arc subliminally

**CTA interactions:**
- "Launch Console ⚡": scan-line sweep on hover — a bright `::after` pseudo-element races left-to-right across button face in 0.35s. Add `overflow: hidden` to the button so the pseudo-element clips at button edges. Note: `overflow: hidden` does not clip `box-shadow`, so the existing hard shadow is unaffected.
- "Explore the Suite": magnetic pull — JS tracks cursor proximity within 80px, button translates toward cursor max 4px via `mousemove` listener

**Scroll indicator:**
- Remove current animated bar
- Replace with self-typing "scroll to begin" text (CSS typing animation, 1.5s)
- Below: a dotted vertical line (8px gaps) with a yellow pulse dot that travels downward on a 2s loop

**Globe scroll effect:**
- Do NOT CSS-scale the canvas element (this causes blurry WebGL output because the renderer's internal resolution won't match the displayed size)
- Instead: on scroll past hero, animate `camera.position.z` in `globe.js` from its default value to `default * 1.5` — this zooms the camera out, creating a "pulling away" effect without any CSS transform on the canvas
- Expose a `setScrollDepth(ratio)` function from `globe.js` that index.html can call from a ScrollTrigger `onUpdate` callback
- Globe panel has a very subtle yellow `border-left` (2px, 20% opacity) — the brutalist frame

---

### 1.2 How It Works — Horizontal Scroll Sequence

> **IMPORTANT — Full replacement required:** The existing `how-pinned` section (including its HTML structure and its inline `<script>` block using a hand-rolled `requestAnimationFrame` + `position: sticky` approach) must be **completely removed and replaced**. Do not layer GSAP ScrollTrigger on top of the existing sticky + RAF scroll listener — they will conflict and produce broken scroll geometry. Delete the existing `.how-pinned`, `.how-pinned__sticky`, `.how-story`, and `.how-steps` HTML. Also remove the existing `.how-pinned { height: 400vh }` CSS rule and any `position: sticky` declarations on child elements within this section. The new implementation below replaces all of it.

**New structure:**
- A single outer wrapper `<section class="how-cinema">` with enough height for the scroll distance (e.g. `height: 500vh`)
- Inner `<div class="how-cinema__track">` containing 4 panel divs, laid out as `display: flex; width: 400vw`
- GSAP ScrollTrigger pins `.how-cinema`, then scrubs `.how-cinema__track` horizontally: `x: 0 → -(300vw)` as user scrolls through the section
- `scrub: 1` for smooth GPU-composited scrolling
- Each panel: `width: 100vw; height: 100vh; overflow: hidden`

**Script initialization:** GSAP and ScrollTrigger CDN scripts must be loaded before `</body>`, after `boot.js` and `globe.js`. Do NOT load them in `<head>` — boot.js must not have access to GSAP APIs. Then register the plugin: `gsap.registerPlugin(ScrollTrigger);`

**Boot teardown + font load sequencing:** `boot.js` sets `body { overflow: hidden }` until the boot sequence completes (~1.7s). Initialize all ScrollTrigger instances inside a callback that fires after boot teardown AND after fonts are confirmed loaded:
```js
document.fonts.ready.then(() => {
  // boot sets a global flag or dispatches a custom event when done
  // wait for that, then:
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh();
  initHorizontalScroll();
  initOtherAnimations();
});
```
`ScrollTrigger.refresh()` must be called after font load to recalculate pin spacer heights with correct text metrics.

**Panel 1 — "The Threat":**
- Background: charcoal with red ambient glow (radial, bottom-right)
- Decorative globe: use a **static SVG globe illustration** (not a canvas clone — canvas elements cannot be cloned). Create a simple SVG with a circle, latitude/longitude lines, and 2–3 animated arc paths using CSS `stroke-dashoffset` animation. Style matches the Three.js globe aesthetic (green arcs, charcoal sphere). Positioned top-right of the panel, 220px diameter.
- Headline: *"Attackers don't wait for your team to catch up."*
- Text enters: opacity 0 → 1 with 30px upward translateY, 0.6s ease-out, triggered by ScrollTrigger `onEnter`

**Panel 2 — "The Scan":**
- Background: charcoal, no glow
- Terminal window element, borderless top, brutal bottom-left shadow (2px black border, `box-shadow: -8px 8px 0 0 black`)
- IP range populates line by line via GSAP stagger: 12 `<div>` lines set to `opacity: 0` initially, revealed with `gsap.to('.terminal-line', { opacity: 1, stagger: 0.08, duration: 0 })` triggered on panel enter
- Yellow highlights on CVE IDs: `background: var(--yellow)`, `color: black`
- Terminal title bar: "HEMISX SCAN ENGINE v2.1 — RUNNING"
- Reset on `onLeaveBack`: hide all lines so animation replays if user scrolls back

**Panel 3 — "The Finding":**
- Background: charcoal with red pulse glow that intensifies
- Vulnerability card slams in from left: `translateX(-120%)` → `translateX(0)` with `power4.out`, 0.5s, triggered on panel enter
- Card has standard brutalist styling (2px black border, 8px hard shadow)
- CVSS score counter: animate via `gsap.to(obj, { val: 9.2, duration: 1.2, ease: 'power2.out', onUpdate: () => el.textContent = obj.val.toFixed(1) })` — **there is no `CountTo` plugin in GSAP; use this pattern instead**
- Score color transitions: green (0–3) → yellow (4–6) → orange (7–8) → red (9+), applied in `onUpdate` via CSS class swap
- Remediation text fades in 0.4s after score settles

**Panel 4 — "The Fix":**
- Background: charcoal with green ambient glow
- Code block (Terraform snippet, max 120 characters to keep typing duration under 2.5s at 18ms/char): types itself out character by character using `setInterval` triggered on panel enter. Clear the interval on `onLeave` and `onLeaveBack` so it doesn't keep running off-panel. Reset text content on `onLeaveBack` so it replays on re-entry.
- After code completes (or after 2s, whichever comes first): "PATCHED" stamp animates in
  - Stamp: red outline text, rotates from –15deg → –8deg, scales 1.4 → 1.0 with overshoot, opacity 0 → 1
  - `transform-origin: center`
- Decorative globe: same SVG as Panel 1, reused, threat arcs removed (only the sphere and grid lines), positioned corner

**Progress indicator:**
- 4 numbered brutalist dots along the bottom center
- Active dot: filled yellow background, black number
- Inactive: black border, transparent fill
- Dots update via ScrollTrigger `onUpdate` callback based on scroll progress ratio (0–0.33 → dot 1, 0.33–0.66 → dot 2, etc.)

---

### 1.3 Features Section (Grid of 3 Cards)

**Entry animation (ScrollTrigger, start: "top 75%"):**
- Left card: enters from `translateX(-80px)`, opacity 0 → 1
- Center card: enters from `translateY(80px)`, opacity 0 → 1
- Right card: enters from `translateX(80px)`, opacity 0 → 1
- All three triggered simultaneously, 0.7s `power3.out`

**Ambient glow per card (CSS, always on, slow loop):**
- Cloud Scanner: `radial-gradient` blue (#3b82f6 at 15% opacity), 8s pulse loop via `@keyframes`
- HEMIS Red Team: `radial-gradient` red (#ff5f57 at 15% opacity), 8s pulse loop, `animation-delay: -2.5s` to offset phase
- Blue Team: `radial-gradient` green (#34d399 at 15% opacity), 8s pulse loop, `animation-delay: -5s` to offset phase
- Implement as an `::before` pseudo-element on each card with `z-index: 0` and `pointer-events: none`

**Hover state upgrades:**
- Card lifts: `translateY(-8px)`, transition 0.25s
- Icon: `scale(1.15)`, transition 0.25s
- Scan-line sweep: `::after` pseudo-element (card-width, `height: 2px`, bright yellow/white), sweeps top-to-bottom in 0.4s on `:hover`. Add `overflow: hidden` to the card element.
- Shadow: `var(--shadow-sm)` (4px 4px) → `var(--shadow-xl)` (12px 12px 0 0 var(--black)), transition 0.25s
- Add to `styles.css`: `--shadow-xl: 12px 12px 0 0 var(--black);`

---

## Part 2: Products Page (products.html)

### 2.1 Page Header

**Header marquee (new, supplemental — does NOT replace the existing brand marquee below it):**
- The existing products page already has a brand/partner marquee section lower on the page — leave that intact
- This new marquee sits only within the page hero header area, as a background layer behind the `<h1>` title
- Content: `CVE-2024-xxxx · CRITICAL · RCE · SQL INJECTION · LATERAL MOVEMENT · PRIVILEGE ESCALATION · ZERO-DAY · C2 BEACON · DATA EXFIL · ` — two copies concatenated for seamless loop
- Speed: 35s loop, `translateX(0) → translateX(-50%)` (standard seamless marquee technique)
- Style: 14px `font-family: monospace`, 15% opacity, uppercase, `letter-spacing: 0.1em`
- A frosted overlay `background: rgba(23,30,25,0.85)` sits above the marquee and below the title text
- Page title sits at `position: relative; z-index: 2`

---

### 2.2 Product Stage Layout

> **IMPORTANT — Full replacement required:** The existing products grid (`.product-grid`, `.product-card` structure) is to be completely replaced with the stage layout below. The existing `.product-vis` elements use CSS `transform: perspective(1000px) rotateY(-8deg) rotateX(4deg)` on hover. This 3D CSS transform must be **removed** from these elements before GSAP sets inline `transform` styles during entry animations — otherwise the CSS transition and GSAP's inline styles will fight each other and produce broken visual state. Remove the `perspective`/`rotateY`/`rotateX` transitions from `.product-vis` in `styles.css`.

Replace grid layout with **3 sequential full-width stages**, each `min-height: 90vh`.

**Between stages:** A brutalist horizontal divider with product number (`01`, `02`, `03`) in 64px Cabinet Grotesk 800, centered. Animate in via ScrollTrigger: `scaleX: 0 → 1` on the line, `opacity: 0 → 1` on the number, triggered when divider enters viewport at "top 80%".

**Stage structure (left/right split):**

```
[Left 48% — Identity Panel] | [Right 52% — Live Preview Panel]
```

**Left Identity Panel:**
- Product name: 120px Cabinet Grotesk 800, `letter-spacing: -3px`
- Parallax: use GSAP ScrollTrigger `scrub: true` with `y: 0 → -60` on the name element as its stage scrolls through the viewport. This creates depth without any `data-speed` attribute (ScrollTrigger handles it natively).
- Punch line: types in character by character on stage entry via `setInterval` (same pattern as Panel 4 code block, max 60 chars)
- Tech badges: pop in with 30ms stagger, `scale(0) → scale(1)` with `back.out(1.7)`, triggered on stage entry
- CTA: same scan-line hover effect from homepage (add `overflow: hidden` to button)

**Right Live Preview Panel — Per Product:**

**Product 1 — Cloud Scanner:**
- Fake dashboard card grid (3×2, small cards, all HTML)
- On stage entry: cards appear one by one (`gsap.to` stagger, 60ms, `opacity: 0 → 1`)
- Then 3 misconfigs highlight: `border-color` transitions to red with a `box-shadow` red pulse animation loop
- A compliance meter bar fills: `width: 0% → 73%` over 1.5s with `power2.out` easing (GSAP `to` on the bar element)
- Meter label text transitions: swap "SCANNING..." → "73% COMPLIANT" at 1.5s mark via `onComplete`

**Product 2 — HEMIS Red Team:**
- Terminal window (same brutalist styling as homepage Panel 2)
- Attack playbook streams in: 8 `<div>` lines, each set `opacity: 0`, revealed via `gsap.to` stagger at 120ms per line on stage entry
- Line 6: `[CRITICAL] CVE-2024-3094 — Authentication Bypass` — `background: rgba(255,95,87,0.15)`, red left border `border-left: 3px solid var(--red)`, text in `var(--red)`
- After all 8 lines shown: "CRITICAL FINDING" banner slides in from right
  - Banner: `background: var(--red)`, white text, 2px black border, `box-shadow: 8px 8px 0 0 black`
  - `gsap.fromTo(banner, { x: '120%' }, { x: '0%', duration: 0.4, ease: 'power3.out' })`

**Product 3 — Blue Team:**
- Radar circle: centered `<div>` with `border-radius: 50%`, 240px × 240px, `border: 2px solid var(--sage)` at 40% opacity
- Pulsing rings: 3 `<div>` elements, positioned absolute, same dimensions, animated with `scale(1) → scale(2.5)` and `opacity: 0.6 → 0` on a 2s loop with staggered delays (0s, 0.66s, 1.33s)
- 4 threat blips: small `<div>` elements (12px × 12px, `border-radius: 50%`, `background: var(--red)`), positioned at fixed % coordinates within the radar container. Appear with `opacity: 0 → 1` stagger, 300ms apart, on stage entry.
- Each blip interception: after all 4 blips appear, a green checkmark SVG (inline, 16px) bounces in over each blip: `gsap.fromTo(check, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' })`, staggered 200ms apart
- After all 4 intercepted: `background` of radar outer ring transitions from `var(--red)` tint to `var(--green)` tint (CSS class swap)

**Stage entry animation (ScrollTrigger, start: "top 60%", `once: true`):**
- Left panel: `gsap.fromTo(leftPanel, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })`
- Right panel: `gsap.fromTo(rightPanel, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })`
- Both triggered simultaneously
- Background glow per product: CSS `opacity: 0` → `opacity: 1` transition over 1.2s via class addition on stage entry

---

## Implementation Notes

### Dependencies to Add
- **GSAP 3.x** (CDN): `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **ScrollTrigger plugin** (CDN): `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js`
- Load both before `</body>`, after `boot.js` and `globe.js` script tags. Do NOT load in `<head>`.
- Register: `gsap.registerPlugin(ScrollTrigger);`
- Also add `gsap.matchMedia()` for responsive ScrollTrigger behaviour. Example for disabling horizontal scroll pin on mobile:
  ```js
  gsap.matchMedia().add("(min-width: 769px)", () => {
    // horizontal scroll ScrollTrigger setup here
    return () => { /* cleanup on breakpoint exit */ };
  });
  ```
- No other new dependencies. Three.js already present.

### Files to Modify
1. `index.html` — layout restructure + GSAP animation scripts
2. `products.html` — full section restructure + GSAP animation scripts
3. `styles.css` — new utility classes: `.card-glow-blue`, `.card-glow-red`, `.card-glow-green`, `.scan-line-btn`, `.scan-line-card`, `--shadow-xl` token, `.how-cinema` layout, `.product-stage` layout
4. `globe.js` — minimal change: accept a container element parameter for `renderer.setSize()` and add `setScrollDepth(ratio)` export

### CSS Tokens to Add
```css
:root {
  --shadow-xl: 12px 12px 0 0 var(--black);
}
```

### Accessibility — `prefers-reduced-motion`
All GSAP animations and CSS `@keyframes` loops must respect the OS accessibility preference. Add the following to `styles.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
For GSAP animations specifically, wrap all `gsap.to` / `gsap.fromTo` calls in a check:
```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  // all GSAP animation code
}
```
When `reduceMotion` is true, elements should still reach their final visual state (opacity 1, correct position) — just without animation. Use `gsap.set()` instead of `gsap.to()` for initial state in this case.

### Performance Considerations
- All GSAP animations use `will-change: transform` only on actively animating elements, removed after animation completes via `onComplete: () => el.style.willChange = 'auto'`
- Ambient glow CSS animations use `opacity` only (compositor thread, no layout reflow)
- Horizontal scroll sequence uses `scrub: 1` for smooth GPU-composited scrolling
- Fake terminal/dashboard content is pure HTML — no setInterval running when off-screen (use ScrollTrigger `onLeave`/`onLeaveBack` to clear and reset)
- `ScrollTrigger.refresh()` must be called after fonts load AND after boot teardown completes

### Mobile Strategy
- Hero split-screen stacks vertically (globe below text) at ≤900px; globe panel becomes full-width, 50vh tall
- Horizontal scroll panels become vertical stacked sections at ≤768px (`how-cinema__track` becomes `flex-direction: column; width: 100%`, ScrollTrigger pin disabled)
- Product stages stack vertically (identity above preview) at ≤900px
- Live preview panels hidden at ≤600px — identity panel carries the section solo
- All GSAP translate animations switch from X-axis to Y-axis (`translateY(±50px)`) at ≤768px for stacked layouts

---

## Success Criteria
- Scroll through homepage feels like a narrative journey with no jarring section jumps
- Products page: each product has a distinct "moment" that communicates its power visually without reading the copy
- All animations run at 60fps on a mid-range MacBook (no jank on scroll)
- Mobile experience degrades gracefully — no broken layouts, no JS errors at any breakpoint
- `prefers-reduced-motion` users see correct final states with no animation
- Boot sequence, custom cursor, and nav remain visually unchanged
