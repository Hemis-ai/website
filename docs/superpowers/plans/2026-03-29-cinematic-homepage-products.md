# Cinematic Homepage & Products Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade index.html and products.html with GSAP-driven cinematic animations — split-screen hero, 4-panel horizontal "How It Works", animated features grid, and dramatic full-width product stages with live preview widgets.

**Architecture:** Pure vanilla HTML/CSS/JS with GSAP 3.x + ScrollTrigger added via CDN before `</body>`. No framework changes. All animation JS lives in inline `<script>` blocks at the bottom of each page. Shared CSS utilities added to styles.css.

**Tech Stack:** GSAP 3.12.5, ScrollTrigger, existing Three.js globe, Cabinet Grotesk + Satoshi fonts, plain HTML/CSS

**Spec:** `docs/superpowers/specs/2026-03-29-cinematic-homepage-products-design.md`

---

## File Map

| File | What changes |
|------|-------------|
| `styles.css` | Add `--shadow-xl` token, `.card-glow-*` ambient glow classes, `.scan-line` pseudo-element rules, `.product-stage` layout, `.how-cinema` layout, `prefers-reduced-motion` block |
| `globe.js` | Accept container element param; expose `setScrollDepth(ratio)` function |
| `index.html` | Hero split-screen restructure; replace `how-pinned` section entirely; upgrade features grid; add GSAP scripts + init code |
| `products.html` | Add threat intel marquee to page header; replace `.product-section`/`.product-grid` structure with `.product-stage` layout; add GSAP scripts + init code |

---

## Task 1: CSS Tokens & Utilities in styles.css

**Files:**
- Modify: `styles.css` (lines 1–12 for tokens; append new utility classes at end)

- [ ] **Step 1: Add `--shadow-xl` token and `--red`/`--green` color tokens**

Open `styles.css`. In the `:root` block (lines 1–12), add after `--shadow-lg`:

```css
  --shadow-xl: 12px 12px 0 0 var(--black);
  --red: #ff5f57;
  --green: #34d399;
```

- [ ] **Step 2: Add ambient glow classes for feature cards**

Append to end of `styles.css`:

```css
/* ── Cinematic: Ambient Card Glows ── */
.card-glow-blue::before,
.card-glow-red::before,
.card-glow-green::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  animation: cardGlowPulse 8s ease-in-out infinite;
}
.card-glow-blue::before  { background: radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.18) 0%, transparent 70%); }
.card-glow-red::before   { background: radial-gradient(ellipse at 50% 80%, rgba(255,95,87,0.18) 0%, transparent 70%); animation-delay: -2.5s; }
.card-glow-green::before { background: radial-gradient(ellipse at 50% 80%, rgba(52,211,153,0.18) 0%, transparent 70%); animation-delay: -5s; }
.card-glow-blue.glow-active::before,
.card-glow-red.glow-active::before,
.card-glow-green.glow-active::before { opacity: 1; }

@keyframes cardGlowPulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}
```

- [ ] **Step 3: Add scan-line hover effect for buttons and cards**

Append to `styles.css`:

```css
/* ── Cinematic: Scan-line Sweep ── */
.scan-line-btn,
.scan-line-card {
  position: relative;
  overflow: hidden;
}
.scan-line-btn::after,
.scan-line-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,225,124,0.35), transparent);
  transition: none;
  pointer-events: none;
}
.scan-line-btn:hover::after,
.scan-line-card:hover::after {
  animation: scanLineSweep 0.35s ease forwards;
}
@keyframes scanLineSweep {
  from { left: -60%; }
  to   { left: 140%; }
}
```

- [ ] **Step 4: Add `prefers-reduced-motion` override block**

Append to `styles.css`:

```css
/* ── Accessibility: Reduced Motion ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Verify file saved correctly**

```bash
grep -n "shadow-xl\|card-glow\|scan-line\|prefers-reduced" /Users/sai/Documents/GitHub/Hemis/website/styles.css
```

Expected: 4 matching patterns found, each at end of file.

- [ ] **Step 6: Commit**

```bash
cd /Users/sai/Documents/GitHub/Hemis/website
git add styles.css
git commit -m "feat: add cinematic CSS tokens, glow, scan-line, reduced-motion"
```

---

## Task 2: Minimal globe.js Update

**Files:**
- Modify: `globe.js`

The globe currently hardcodes `window.innerWidth/Height` for renderer size and has no scroll hook. We need it to (a) size to a container div and (b) expose a `setScrollDepth(ratio)` function that moves the camera back.

- [ ] **Step 1: Replace renderer size initialization**

In `globe.js`, find line 7:
```js
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
```
Replace with:
```js
  const containerW = () => container.clientWidth || window.innerWidth;
  const containerH = () => container.clientHeight || window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, containerW() / containerH(), 0.1, 1000);
```

- [ ] **Step 2: Replace `renderer.setSize` call (line 15)**

Find:
```js
  renderer.setSize(window.innerWidth, window.innerHeight);
```
Replace with:
```js
  renderer.setSize(containerW(), containerH());
```

- [ ] **Step 3: Expose `setScrollDepth` on `window`**

Insert the following BEFORE the closing `});` of the `DOMContentLoaded` listener (which is at line 386 — `camera` is only in scope inside this closure). Inserting after line 386 would put the code outside the closure and `camera` would be undefined.

Specifically, insert after `animate();` (line 376) and before the `// 6. Resize handler` comment (line 378):

```js
  // Scroll depth hook — called from GSAP ScrollTrigger in index.html
  const baseZ = 240;
  window.globeSetScrollDepth = function(ratio) {
    // ratio: 0 (top of hero) → 1 (bottom of hero)
    camera.position.z = baseZ + ratio * (baseZ * 0.5);
  };
```

- [ ] **Step 4: Fix resize handler (line 380)**

Find:
```js
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
```
Replace with:
```js
  window.addEventListener('resize', () => {
    camera.aspect = containerW() / containerH();
    camera.updateProjectionMatrix();
    renderer.setSize(containerW(), containerH());
```

- [ ] **Step 5: Verify globe.js has no syntax errors**

```bash
node --check /Users/sai/Documents/GitHub/Hemis/website/globe.js && echo "OK"
```

Expected: `OK`

- [ ] **Step 6: Commit**

```bash
git add globe.js
git commit -m "feat: globe accepts container sizing and exposes setScrollDepth hook"
```

---

## Task 3: Hero Section — Split-Screen Layout

**Files:**
- Modify: `index.html` (lines 38–502 — the inline `<style>` block and `<section class="hero-x">`)

- [ ] **Step 1: Replace hero inline `<style>` block**

Find the block starting at line 41 `<style>` and ending at line 414 `</style>` (the hero CSS block). Replace the `.hero-x` layout rule only (lines 43–56):

Find:
```css
      .hero-x {
        position: relative;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 6rem 1.5rem 8rem;
        /* Increased to prevent scroll overlap */
        background: #0d1210;
        overflow: hidden;
        border-bottom: none;
      }
```
Replace with:
```css
      .hero-x {
        position: relative;
        min-height: 100vh;
        display: grid;
        grid-template-columns: 55% 45%;
        background: #0d1210;
        overflow: hidden;
        border-bottom: none;
      }
      .hero-x__left {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 6rem 2.5rem 6rem 3rem;
        text-align: left;
      }
      .hero-x__right {
        position: relative;
        overflow: hidden;
        border-left: 2px solid rgba(255,225,124,0.2);
      }
```

- [ ] **Step 2: Update `.hero-x__content` to remove centering**

Find in the same `<style>` block:
```css
      .hero-x__content {
        position: relative;
        z-index: 1;
        max-width: 900px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }
```
Replace with:
```css
      .hero-x__content {
        position: relative;
        z-index: 1;
        max-width: 680px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
      }
```

- [ ] **Step 3b: Add new scroll indicator CSS and HTML**

The spec requires replacing the scroll bar indicator with a self-typing "scroll to begin" text + dotted line + traveling pulse dot. Inside the hero `<style>` block, find and delete the `.hero-x__scroll-line`, `.hero-x__scroll-bar`, and `@keyframes heroScrollBar` rules, then replace with:

```css
      .hero-x__scroll-typing {
        font-family: 'Satoshi', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        color: rgba(255,255,255,0.4);
        letter-spacing: 0.12em;
        overflow: hidden;
        white-space: nowrap;
        width: 0;
        animation: heroScrollType 1.5s steps(16, end) 2.2s forwards;
      }
      @keyframes heroScrollType { to { width: 10em; } }

      .hero-x__scroll-dotline {
        position: relative;
        width: 1px;
        height: 50px;
        background: repeating-linear-gradient(
          to bottom,
          rgba(255,255,255,0.25) 0px,
          rgba(255,255,255,0.25) 3px,
          transparent 3px,
          transparent 8px
        );
        overflow: hidden;
        margin-top: 0.25rem;
      }
      .hero-x__scroll-pulse {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #ffe17c;
        animation: heroScrollPulse 2s ease-in-out 2.5s infinite;
      }
      @keyframes heroScrollPulse {
        0%   { top: -5px; opacity: 1; }
        80%  { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
```

Also when doing Step 6, replace the scroll indicator inner HTML from:
```html
        <span class="hero-x__scroll-label">Scroll</span>
        <div class="hero-x__scroll-line">
          <div class="hero-x__scroll-bar"></div>
        </div>
```
With:
```html
        <div class="hero-x__scroll-typing">scroll to begin</div>
        <div class="hero-x__scroll-dotline">
          <div class="hero-x__scroll-pulse"></div>
        </div>
```

- [ ] **Step 3: Update `.hero-x__title` text-alignment**

Find:
```css
      .hero-x__title {
        font-family: 'Cabinet Grotesk', 'Satoshi', sans-serif;
        font-size: clamp(2.8rem, 6.5vw, 5.5rem);
        font-weight: 800;
        line-height: 1.05;
        letter-spacing: -0.025em;
        color: #ffffff;
        margin: 0;
      }
```
Replace with:
```css
      .hero-x__title {
        font-family: 'Cabinet Grotesk', 'Satoshi', sans-serif;
        font-size: clamp(2.8rem, 5.5vw, 5.5rem);
        font-weight: 800;
        line-height: 1.05;
        letter-spacing: -0.025em;
        color: #ffffff;
        margin: 0;
        text-align: left;
      }
```

- [ ] **Step 4: Update scroll indicator positioning**

Find:
```css
      .hero-x__scroll {
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
```
Replace with:
```css
      .hero-x__scroll {
        position: absolute;
        bottom: 2rem;
        left: 3rem;
        transform: none;
```

- [ ] **Step 5: Add chromatic sweep keyframe + mobile responsive overrides**

At the end of the hero `<style>` block (before `</style>`), add:

```css
      /* ── Chromatic sweep overlay ── */
      .hero-x__chroma {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        animation: chromaSweep 8s ease-in-out infinite;
      }
      @keyframes chromaSweep {
        0%   { background: radial-gradient(ellipse at 30% 50%, rgba(255,95,87,0.04) 0%, transparent 60%); }
        50%  { background: radial-gradient(ellipse at 60% 50%, rgba(255,225,124,0.05) 0%, transparent 60%); }
        100% { background: radial-gradient(ellipse at 30% 50%, rgba(52,211,153,0.04) 0%, transparent 60%); }
      }

      /* ── Hero responsive ── */
      @media (max-width: 900px) {
        .hero-x {
          grid-template-columns: 1fr;
          grid-template-rows: auto 50vh;
        }
        .hero-x__left {
          padding: 5rem 1.5rem 2rem;
          text-align: center;
          align-items: center;
        }
        .hero-x__content { align-items: center; }
        .hero-x__title { text-align: center; }
        .hero-x__right { border-left: none; border-top: 2px solid rgba(255,225,124,0.2); }
        .hero-x__scroll { left: 50%; transform: translateX(-50%); }
      }
      @media (max-width: 640px) {
        .hero-x__ctas { flex-direction: column; align-items: center; }
        .hero-x__btn-primary, .hero-x__btn-ghost { width: 100%; justify-content: center; max-width: 300px; }
      }
```

- [ ] **Step 6: Restructure hero HTML**

Find the `<section class="hero-x" id="top">` block (lines 416–468). Replace entirely:

```html
    <section class="hero-x" id="top">
      <!-- Chromatic sweep -->
      <div class="hero-x__chroma"></div>

      <!-- LEFT: content panel -->
      <div class="hero-x__left">
        <div class="hero-x__grid"></div>
        <div class="hero-x__content">
          <!-- Eyebrow -->
          <div class="hero-x__eyebrow" id="heroEyebrow">
            <span class="hero-x__pulse"></span>
            AI-Native Cybersecurity Platform
          </div>

          <!-- Split-word animated title -->
          <h1 class="hero-x__title" id="heroTitle">
            <span class="split-word"><span>Advanced</span></span>
            <span class="split-word"><span>Cloud</span></span>
            <span class="split-word"><span>Security</span></span>
            <span class="split-word split-word--stroke"><span>Red/Blue</span></span>
            <span class="split-word split-word--stroke"><span>Team</span></span>
            <span class="split-word"><span>Tools.</span></span>
          </h1>

          <!-- Subtitle -->
          <p class="hero-x__subtitle" id="heroSub">
            Purpose-built for SMBs. Offensive simulation, autonomous defense, and cloud
            posture management — mapped to SOC&nbsp;2 and ISO&nbsp;27001.
          </p>

          <!-- CTAs -->
          <div class="hero-x__ctas" id="heroCtas">
            <a href="https://console.hemisx.com" target="_blank" class="hero-x__btn-primary scan-line-btn">Launch Console ⚡</a>
            <a href="products.html" class="hero-x__btn-ghost" id="heroGhostBtn">Explore the Suite</a>
          </div>

          <!-- Meta -->
          <div class="hero-x__meta" id="heroMeta">
            <span>Cloud Security</span>
            <span class="hero-x__meta-dot"></span>
            <span>Red Team</span>
            <span class="hero-x__meta-dot"></span>
            <span>Blue Team</span>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="hero-x__scroll">
          <span class="hero-x__scroll-label">Scroll</span>
          <div class="hero-x__scroll-line">
            <div class="hero-x__scroll-bar"></div>
          </div>
        </div>
      </div>

      <!-- RIGHT: globe panel -->
      <div class="hero-x__right">
        <div id="hero-globe-container" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"></div>
      </div>
    </section>
```

- [ ] **Step 7: Update hero animation script (existing `<script>` after hero)**

Find the existing hero script block (lines 470–501). Replace:

```html
    <script>
      (function heroAnim() {
        document.querySelectorAll('.hero-x__blob').forEach(b => b.classList.add('is-visible'));
        setTimeout(() => document.getElementById('heroEyebrow').classList.add('is-visible'), 200);
        const words = document.querySelectorAll('.split-word');
        words.forEach((w, i) => setTimeout(() => w.classList.add('is-visible'), 300 + i * 120));
        setTimeout(() => document.getElementById('heroSub').classList.add('is-visible'), 1000);
        setTimeout(() => document.getElementById('heroCtas').classList.add('is-visible'), 1200);
        setTimeout(() => document.getElementById('heroMeta').classList.add('is-visible'), 1400);

        // Magnetic pull on ghost CTA
        const ghostBtn = document.getElementById('heroGhostBtn');
        if (ghostBtn && window.matchMedia('(hover: hover)').matches) {
          ghostBtn.addEventListener('mousemove', (e) => {
            const r = ghostBtn.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 80) {
              const pull = (80 - dist) / 80;
              ghostBtn.style.transform = `translate(${dx * pull * 0.15}px, ${dy * pull * 0.15}px)`;
            }
          });
          ghostBtn.addEventListener('mouseleave', () => {
            ghostBtn.style.transform = '';
          });
        }
      })();
    </script>
```

- [ ] **Step 8: Verify hero renders correctly in browser**

Open `index.html` in a browser. Check:
- Left panel has text/CTAs, right panel has globe
- Headline words animate in on load
- "Launch Console" button has scan-line on hover
- "Explore the Suite" button has subtle magnetic drift on hover
- No console errors

- [ ] **Step 9: Commit**

```bash
git add index.html
git commit -m "feat: hero split-screen layout, scan-line CTAs, magnetic ghost button"
```

---

## Task 4: Replace "How It Works" — 4-Panel Horizontal Cinema

**Files:**
- Modify: `index.html` (lines 572–1029 — existing `how-pinned` `<style>`, `<section>`, and `<script>`)

This is a full replacement. Delete everything from the `<!-- ═══ HEMISX "HOW IT WORKS" ═══ -->` comment through `<!-- ═══ END HEMISX "HOW IT WORKS" SCROLL-PINNED ═══ -->` and insert the new section below.

- [ ] **Step 1: Remove the entire how-pinned section**

In `index.html`, find and delete from:
```html
    <!-- ═══════════════════════════════════════════════════════════════
         HEMISX "HOW IT WORKS" — Scroll-Pinned Storytelling Section
```
all the way to:
```html
    <!-- ═══════ END HEMISX "HOW IT WORKS" SCROLL-PINNED ═══════ -->
```
(This removes: the `<style>` block with `.how-pinned` CSS, the `<section class="how-pinned">` HTML, and the `<script>` with `howPinnedScroll()`)

- [ ] **Step 2: Insert new how-cinema section in its place**

Insert at the same location:

```html
    <!-- ═══════════════════════════════════════════════════════════════
         HOW IT WORKS — Cinematic Horizontal Scroll Sequence
         ═══════════════════════════════════════════════════════════════ -->
    <style>
      .how-cinema {
        position: relative;
        height: 500vh;
        background: #0d1210;
        overflow: clip;
      }
      .how-cinema__pin {
        position: sticky;
        top: 0;
        height: 100vh;
        overflow: hidden;
      }
      .how-cinema__track {
        display: flex;
        width: 400vw;
        height: 100vh;
        will-change: transform;
      }
      .how-panel {
        width: 100vw;
        height: 100vh;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem 5rem;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      }

      /* Panel backgrounds */
      .how-panel--threat { background: #0d1210; }
      .how-panel--scan   { background: #0a0f0d; }
      .how-panel--find   { background: #0d1210; }
      .how-panel--fix    { background: #0a120d; }

      .how-panel__glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: opacity 1.2s ease;
      }
      .how-panel--threat .how-panel__glow { background: radial-gradient(ellipse at 80% 60%, rgba(255,95,87,0.12) 0%, transparent 65%); }
      .how-panel--scan   .how-panel__glow { background: radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 65%); }
      .how-panel--find   .how-panel__glow { background: radial-gradient(ellipse at 30% 50%, rgba(255,95,87,0.15) 0%, transparent 65%); }
      .how-panel--fix    .how-panel__glow { background: radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.12) 0%, transparent 65%); }
      .how-panel.is-active .how-panel__glow { opacity: 1; }

      .how-panel__content {
        position: relative;
        z-index: 1;
        max-width: 1100px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5rem;
        align-items: center;
      }
      .how-panel__text { display: flex; flex-direction: column; gap: 1.5rem; }
      .how-panel__step-label {
        font-family: 'Satoshi', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--yellow);
      }
      .how-panel__heading {
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: clamp(2rem, 4vw, 3.2rem);
        font-weight: 800;
        color: white;
        line-height: 1.1;
        margin: 0;
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .how-panel.is-active .how-panel__heading { opacity: 1; transform: translateY(0); }
      .how-panel__body {
        font-family: 'Satoshi', sans-serif;
        font-size: 1.05rem;
        color: rgba(255,255,255,0.55);
        line-height: 1.65;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s 0.15s ease, transform 0.6s 0.15s ease;
      }
      .how-panel.is-active .how-panel__body { opacity: 1; transform: translateY(0); }

      /* SVG Globe decoration */
      .how-globe-svg { width: 200px; height: 200px; opacity: 0.7; }
      .how-globe-svg circle { stroke: rgba(52,211,153,0.4); fill: none; }
      .how-globe-arc {
        fill: none; stroke: var(--red); stroke-width: 1.5;
        stroke-dasharray: 60; stroke-dashoffset: 60;
        animation: arcDraw 2s ease-in-out infinite alternate;
      }
      .how-globe-arc--2 { stroke: rgba(255,95,87,0.6); animation-delay: 0.5s; }
      .how-globe-arc--fix { stroke: var(--green); }
      @keyframes arcDraw { to { stroke-dashoffset: 0; } }

      /* Terminal */
      .how-terminal {
        background: #111;
        border: 2px solid #000;
        box-shadow: -8px 8px 0 0 #000;
        border-radius: 8px;
        overflow: hidden;
        font-family: 'SF Mono', 'Roboto Mono', monospace;
        font-size: 0.75rem;
      }
      .how-terminal__bar {
        background: rgba(255,255,255,0.06);
        padding: 0.5rem 1rem;
        font-size: 0.7rem;
        color: rgba(255,255,255,0.4);
        font-weight: 700;
        letter-spacing: 0.08em;
      }
      .how-terminal__body { padding: 1rem; display: flex; flex-direction: column; gap: 0.3rem; min-height: 180px; }
      .how-terminal__line { color: rgba(52,211,153,0.8); opacity: 0; }
      .how-terminal__line--cve { background: rgba(255,225,124,0.1); color: var(--yellow); padding: 2px 4px; border-radius: 3px; }
      .how-panel.is-active .how-terminal__line { animation: termLineIn 0s forwards; }
      .how-panel.is-active .how-terminal__line:nth-child(1)  { animation-delay: 0.1s; }
      .how-panel.is-active .how-terminal__line:nth-child(2)  { animation-delay: 0.18s; }
      .how-panel.is-active .how-terminal__line:nth-child(3)  { animation-delay: 0.26s; }
      .how-panel.is-active .how-terminal__line:nth-child(4)  { animation-delay: 0.34s; }
      .how-panel.is-active .how-terminal__line:nth-child(5)  { animation-delay: 0.42s; }
      .how-panel.is-active .how-terminal__line:nth-child(6)  { animation-delay: 0.50s; }
      .how-panel.is-active .how-terminal__line:nth-child(7)  { animation-delay: 0.58s; }
      .how-panel.is-active .how-terminal__line:nth-child(8)  { animation-delay: 0.66s; }
      .how-panel.is-active .how-terminal__line:nth-child(9)  { animation-delay: 0.74s; }
      .how-panel.is-active .how-terminal__line:nth-child(10) { animation-delay: 0.82s; }
      .how-panel.is-active .how-terminal__line:nth-child(11) { animation-delay: 0.90s; }
      .how-panel.is-active .how-terminal__line:nth-child(12) { animation-delay: 0.98s; }
      @keyframes termLineIn { to { opacity: 1; } }

      /* Vuln card */
      .how-vuln-card {
        border: 2px solid black;
        box-shadow: var(--shadow-lg);
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        opacity: 0;
        transform: translateX(-80px);
        transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1);
      }
      .how-panel.is-active .how-vuln-card { opacity: 1; transform: translateX(0); }
      .how-vuln-card__label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 0.5rem; }
      .how-vuln-card__score {
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 3.5rem;
        font-weight: 800;
        line-height: 1;
        color: #dc2626;
        margin-bottom: 0.5rem;
      }
      .how-vuln-card__type { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; }
      .how-vuln-card__fix { font-size: 0.8rem; color: #666; background: rgba(0,0,0,0.04); padding: 0.5rem 0.75rem; border-radius: 4px; border-left: 3px solid var(--green); opacity: 0; transition: opacity 0.4s 0.8s ease; }
      .how-panel.is-active .how-vuln-card__fix { opacity: 1; }

      /* Code block + stamp */
      .how-code-block {
        background: #111;
        border: 2px solid #000;
        box-shadow: -8px 8px 0 0 #000;
        border-radius: 8px;
        padding: 1.25rem;
        font-family: 'SF Mono', 'Roboto Mono', monospace;
        font-size: 0.72rem;
        color: rgba(52,211,153,0.9);
        min-height: 140px;
        position: relative;
        white-space: pre;
        overflow: hidden;
      }
      .how-code-block__typed { display: inline; }
      .how-patched-stamp {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 1.4rem;
        font-weight: 800;
        color: transparent;
        border: 3px solid var(--red);
        padding: 0.25rem 0.75rem;
        letter-spacing: 0.1em;
        transform: rotate(-12deg) scale(1.4);
        opacity: 0;
        transform-origin: center;
        transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
      }
      .how-panel.is-active .how-patched-stamp.stamp-show {
        opacity: 1;
        transform: rotate(-8deg) scale(1);
      }

      /* Progress dots */
      .how-cinema__dots {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 0.75rem;
        z-index: 100;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .how-cinema__dots.is-visible { opacity: 1; }
      .how-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid black;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 0.65rem;
        font-weight: 800;
        color: black;
        transition: background 0.2s, color 0.2s;
        cursor: default;
        user-select: none;
      }
      .how-dot.is-active { background: var(--yellow); }

      /* Mobile fallback */
      @media (max-width: 768px) {
        .how-cinema { height: auto; }
        .how-cinema__pin { position: relative; height: auto; }
        .how-cinema__track { flex-direction: column; width: 100%; height: auto; }
        .how-panel { width: 100%; height: auto; min-height: 80vh; padding: 4rem 1.5rem; }
        .how-panel__content { grid-template-columns: 1fr; gap: 2rem; }
        .how-cinema__dots { display: none; }
        .how-panel__heading { opacity: 1 !important; transform: none !important; }
        .how-panel__body { opacity: 1 !important; transform: none !important; }
        .how-vuln-card { opacity: 1 !important; transform: none !important; }
        .how-terminal__line { opacity: 1 !important; }
        .how-vuln-card__fix { opacity: 1 !important; }
      }
    </style>

    <section class="how-cinema" id="how">
      <div class="how-cinema__pin">
        <div class="how-cinema__track" id="howTrack">

          <!-- PANEL 1: The Threat -->
          <div class="how-panel how-panel--threat" id="howPanel1">
            <div class="how-panel__glow"></div>
            <div class="how-panel__content">
              <div class="how-panel__text">
                <div class="how-panel__step-label">01 — The Threat</div>
                <h2 class="how-panel__heading">Attackers don't wait for your team to catch up.</h2>
                <p class="how-panel__body">Every second of undetected intrusion is another second of access. Threat actors move faster than any manual process. HemisX sees them first.</p>
              </div>
              <div style="display:flex;align-items:center;justify-content:center;">
                <svg class="how-globe-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="100" cy="100" r="80" stroke="rgba(52,211,153,0.3)" stroke-width="1.5"/>
                  <circle cx="100" cy="100" r="55" stroke="rgba(52,211,153,0.2)" stroke-width="1"/>
                  <circle cx="100" cy="100" r="30" stroke="rgba(52,211,153,0.15)" stroke-width="1"/>
                  <ellipse cx="100" cy="100" rx="80" ry="32" stroke="rgba(52,211,153,0.2)" stroke-width="1" fill="none"/>
                  <ellipse cx="100" cy="100" rx="80" ry="65" stroke="rgba(52,211,153,0.15)" stroke-width="1" fill="none"/>
                  <path class="how-globe-arc" d="M 40 60 Q 100 20 160 100"/>
                  <path class="how-globe-arc how-globe-arc--2" d="M 20 120 Q 80 60 150 140"/>
                  <circle cx="160" cy="100" r="4" fill="var(--red)" opacity="0.8"/>
                  <circle cx="40" cy="60" r="3" fill="rgba(255,95,87,0.6)"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- PANEL 2: The Scan -->
          <div class="how-panel how-panel--scan" id="howPanel2">
            <div class="how-panel__glow"></div>
            <div class="how-panel__content">
              <div class="how-panel__text">
                <div class="how-panel__step-label">02 — The Scan</div>
                <h2 class="how-panel__heading">Enumerate. Map. Surface every weakness.</h2>
                <p class="how-panel__body">HemisX scans your cloud surfaces and attack vectors in real time — cataloguing CVEs, misconfigs, and exposure windows before attackers find them.</p>
              </div>
              <div class="how-terminal">
                <div class="how-terminal__bar">HEMISX SCAN ENGINE v2.1 — RUNNING</div>
                <div class="how-terminal__body">
                  <div class="how-terminal__line">&gt; Initializing scan on 10.0.0.0/24...</div>
                  <div class="how-terminal__line">&gt; Port 22 (SSH) open — 10.0.0.4</div>
                  <div class="how-terminal__line">&gt; Port 443 (HTTPS) open — 10.0.0.7</div>
                  <div class="how-terminal__line">&gt; Port 3306 (MySQL) open — 10.0.0.12</div>
                  <div class="how-terminal__line">&gt; Checking service banners...</div>
                  <div class="how-terminal__line">&gt; OpenSSH 7.4 detected — EOL version</div>
                  <div class="how-terminal__line how-terminal__line--cve">&gt; [CVE-2023-38408] Score: 9.8 CRITICAL</div>
                  <div class="how-terminal__line how-terminal__line--cve">&gt; [CVE-2021-41617] Score: 7.0 HIGH</div>
                  <div class="how-terminal__line">&gt; MySQL 5.7 unencrypted connection</div>
                  <div class="how-terminal__line how-terminal__line--cve">&gt; [CVE-2022-32081] Score: 8.1 HIGH</div>
                  <div class="how-terminal__line">&gt; Scan complete. 3 critical findings.</div>
                  <div class="how-terminal__line">&gt; Generating report...</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL 3: The Finding -->
          <div class="how-panel how-panel--find" id="howPanel3">
            <div class="how-panel__glow"></div>
            <div class="how-panel__content">
              <div class="how-panel__text">
                <div class="how-panel__step-label">03 — The Finding</div>
                <h2 class="how-panel__heading">Every vulnerability scored, mapped, and explained.</h2>
                <p class="how-panel__body">No jargon. No noise. Each finding gets a CVSS score, MITRE ATT&CK mapping, and plain-English remediation your team can act on today.</p>
              </div>
              <div class="how-vuln-card">
                <div class="how-vuln-card__label">CVSS Score</div>
                <div class="how-vuln-card__score" id="cvssScore">0.0</div>
                <div class="how-vuln-card__type">Authentication Bypass — CVE-2023-38408</div>
                <div class="how-vuln-card__fix">→ Upgrade OpenSSH to 9.3p1 or later. Apply patch immediately.</div>
              </div>
            </div>
          </div>

          <!-- PANEL 4: The Fix -->
          <div class="how-panel how-panel--fix" id="howPanel4">
            <div class="how-panel__glow"></div>
            <div class="how-panel__content">
              <div class="how-panel__text">
                <div class="how-panel__step-label">04 — The Fix</div>
                <h2 class="how-panel__heading">Remediation code. Not just advice.</h2>
                <p class="how-panel__body">HemisX generates IaC-ready fix code for your exact environment. Apply it, verify it, and generate your compliance evidence — automatically.</p>
              </div>
              <div style="position:relative;">
                <div class="how-code-block"><span class="how-code-block__typed" id="howTypedCode"></span></div>
                <div class="how-patched-stamp" id="howPatchedStamp">PATCHED</div>
                <div style="margin-top:1rem;">
                  <svg class="how-globe-svg" style="width:160px;height:160px;opacity:0.5;" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="100" cy="100" r="80" stroke="rgba(52,211,153,0.4)" stroke-width="1.5"/>
                    <ellipse cx="100" cy="100" rx="80" ry="32" stroke="rgba(52,211,153,0.25)" stroke-width="1" fill="none"/>
                    <circle cx="100" cy="100" r="4" fill="var(--green)" opacity="0.9"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div><!-- /track -->
      </div><!-- /pin -->
    </section>

    <!-- Progress dots (outside the pin so they stay fixed) -->
    <div class="how-cinema__dots" id="howDots">
      <div class="how-dot is-active">1</div>
      <div class="how-dot">2</div>
      <div class="how-dot">3</div>
      <div class="how-dot">4</div>
    </div>
    <!-- ═══════ END HOW IT WORKS CINEMA ═══════ -->
```

- [ ] **Step 3: Commit HTML (GSAP init added in Task 8)**

```bash
git add index.html
git commit -m "feat: replace how-pinned with cinematic 4-panel horizontal section"
```

---

## Task 5: Features Grid — Animated Entry + Ambient Glows

**Files:**
- Modify: `index.html` (features section, lines ~542–570)

- [ ] **Step 1: Add glow and scan-line classes to feature cards**

Find the features section:
```html
        <a href="products.html#cloud" class="feature feature--link">
```
Replace with:
```html
        <a href="products.html#cloud" class="feature feature--link card-glow-blue scan-line-card" style="position:relative;">
```

Find:
```html
        <a href="products.html#red" class="feature feature--link shadow-lg" style="background: #272727; color: white;">
```
Replace with:
```html
        <a href="products.html#red" class="feature feature--link shadow-lg card-glow-red scan-line-card" style="background: #272727; color: white; position:relative;">
```

Find:
```html
        <a href="products.html#blue" class="feature feature--link">
```
Replace with:
```html
        <a href="products.html#blue" class="feature feature--link card-glow-green scan-line-card" style="position:relative;">
```

- [ ] **Step 2: Add initial hidden state for GSAP to animate from**

Find in `styles.css` the `.feature` rule (search for `feature`). After the rule, add:

```css
.feature.gsap-hidden {
  opacity: 0;
}
```

- [ ] **Step 3: Add `gsap-hidden` to feature cards and data attributes for direction**

In `index.html`, add `data-reveal` attributes:
```html
        <a href="products.html#cloud" class="feature feature--link card-glow-blue scan-line-card gsap-hidden" data-reveal="left" style="position:relative;">
        ...
        <a href="products.html#red" class="feature feature--link shadow-lg card-glow-red scan-line-card gsap-hidden" data-reveal="up" style="background: #272727; color: white; position:relative;" data-reveal="up">
        ...
        <a href="products.html#blue" class="feature feature--link card-glow-green scan-line-card gsap-hidden" data-reveal="right" style="position:relative;">
```

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: features grid glow classes and reveal data attributes"
```

---

## Task 6: Products Page — Header Marquee & Stage Layout

**Files:**
- Modify: `products.html`

### 6a — Threat Intel Marquee in Page Header

- [ ] **Step 1: Add threat marquee CSS in products.html `<style>` block**

In `products.html`, find the existing `<style>` block. Add before the closing `</style>`:

```css
        /* ── Threat Intel Marquee in Header ── */
        .threat-marquee-wrap {
            position: absolute;
            inset: 0;
            overflow: hidden;
            z-index: 1;
            pointer-events: none;
        }
        .threat-marquee-overlay {
            position: absolute;
            inset: 0;
            background: rgba(23,30,25,0.85);
            z-index: 2;
        }
        .threat-marquee-inner {
            display: inline-block;
            white-space: nowrap;
            font-family: monospace;
            font-size: 14px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.15);
            animation: threatMarqueeScroll 35s linear infinite;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
        }
        @keyframes threatMarqueeScroll {
            0%   { transform: translateY(-50%) translateX(0); }
            100% { transform: translateY(-50%) translateX(-50%); }
        }
```

- [ ] **Step 2: Update `.page-header` to ensure `position: relative` and `overflow: hidden`**

Find `.page-header` in the `<style>` block. It already has `position: relative; overflow: hidden`. Confirm — no change needed.

- [ ] **Step 3: Inject threat marquee HTML into the `.page-header`**

Find the `<div class="hero-watermark">` element inside `.page-header`. Add the marquee wrapper BEFORE it:

```html
            <!-- Threat Intel Marquee Background -->
            <div class="threat-marquee-wrap">
                <div class="threat-marquee-overlay"></div>
                <div class="threat-marquee-inner">CVE-2024-xxxx · CRITICAL · RCE · SQL INJECTION · LATERAL MOVEMENT · PRIVILEGE ESCALATION · ZERO-DAY · C2 BEACON · DATA EXFIL · RANSOMWARE · SUPPLY CHAIN · CREDENTIAL STUFFING · CVE-2024-xxxx · CRITICAL · RCE · SQL INJECTION · LATERAL MOVEMENT · PRIVILEGE ESCALATION · ZERO-DAY · C2 BEACON · DATA EXFIL · RANSOMWARE · SUPPLY CHAIN · CREDENTIAL STUFFING · </div>
            </div>
```

### 6b — Product Stages Layout

- [ ] **Step 4: Add product stage CSS in `<style>` block**

Add after the threat marquee CSS (before `</style>`):

```css
        /* ── Product Stages ── */
        .product-stages { display: flex; flex-direction: column; }

        .product-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            padding: 3rem 2rem;
            background: var(--white);
            border-top: 4px solid black;
            overflow: hidden;
        }
        .product-divider__line {
            flex: 1;
            height: 2px;
            background: black;
            transform: scaleX(0);
            transform-origin: left center;
        }
        .product-divider__num {
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 4rem;
            font-weight: 800;
            color: black;
            line-height: 1;
            opacity: 0;
        }

        .product-stage {
            min-height: 90vh;
            display: grid;
            grid-template-columns: 48% 52%;
            border-bottom: 4px solid black;
            position: relative;
            overflow: hidden;
            background: var(--white);
        }
        .product-stage:nth-child(even) { grid-template-columns: 52% 48%; }
        .product-stage:nth-child(even) .stage-preview { order: -1; }

        .stage-identity {
            padding: 6rem 3rem 6rem 4rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 2rem;
            border-right: 4px solid black;
            position: relative;
            overflow: hidden;
        }
        .product-stage:nth-child(even) .stage-identity { border-right: none; border-left: 4px solid black; padding: 6rem 4rem 6rem 3rem; }

        .stage-num {
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 1rem;
            font-weight: 800;
            color: rgba(0,0,0,0.25);
            letter-spacing: 0.1em;
        }
        .stage-name {
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: clamp(2.8rem, 5vw, 4.5rem);
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1;
            margin: 0;
            will-change: transform;
        }
        .stage-punch {
            font-family: 'Satoshi', sans-serif;
            font-size: 1.1rem;
            color: rgba(0,0,0,0.6);
            line-height: 1.6;
            overflow: hidden;
            white-space: nowrap;
        }
        .stage-punch__typed { display: inline; }
        .stage-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .stage-badge {
            font-family: 'Satoshi', sans-serif;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.3rem 0.75rem;
            border: 2px solid black;
            border-radius: 100px;
            background: white;
            opacity: 0;
            transform: scale(0);
        }
        .stage-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.85rem 1.75rem;
            font-family: 'Satoshi', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            background: black;
            color: white;
            border: 2px solid black;
            box-shadow: var(--shadow-sm);
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            align-self: flex-start;
        }
        .stage-cta:hover { transform: translate(2px,2px); box-shadow: 2px 2px 0 0 black; }

        .stage-preview {
            padding: 4rem 3rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .stage-glow {
            position: absolute;
            inset: 0;
            pointer-events: none;
            opacity: 0;
            transition: opacity 1.2s ease;
        }
        .product-stage.is-revealed .stage-glow { opacity: 1; }
        .stage-glow--blue  { background: radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%); }
        .stage-glow--red   { background: radial-gradient(ellipse at 50% 50%, rgba(255,95,87,0.12) 0%, transparent 70%); }
        .stage-glow--green { background: radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.12) 0%, transparent 70%); }

        /* Cloud Scanner Preview */
        .scanner-preview { width: 100%; max-width: 420px; }
        .scanner-card { border: 2px solid black; background: white; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; box-shadow: 3px 3px 0 0 black; display: flex; align-items: center; justify-content: space-between; opacity: 0; }
        .scanner-card.sc-revealed { opacity: 1; transition: opacity 0.2s ease; }
        .scanner-card--misconfigured { border-color: var(--red); animation: misconfigPulse 2s ease-in-out infinite; }
        @keyframes misconfigPulse { 0%,100% { box-shadow: 3px 3px 0 0 var(--red); } 50% { box-shadow: 3px 3px 0 0 var(--red), 0 0 12px rgba(255,95,87,0.3); } }
        .scanner-card__name { font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 0.8rem; }
        .scanner-card__badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 100px; }
        .badge-pass  { background: #16a34a; color: white; }
        .badge-fail  { background: var(--red); color: white; }
        .badge-warn  { background: #f97316; color: white; }
        .scanner-meter { margin-top: 1rem; }
        .scanner-meter__label { font-family: 'Satoshi', sans-serif; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.4rem; display: flex; justify-content: space-between; }
        .scanner-meter__track { height: 8px; background: rgba(0,0,0,0.1); border-radius: 100px; overflow: hidden; border: 1px solid black; }
        .scanner-meter__fill { height: 100%; background: #16a34a; border-radius: 100px; width: 0; transition: width 1.5s cubic-bezier(0.25,1,0.5,1); }

        /* Red Team Preview */
        .redteam-preview { width: 100%; max-width: 420px; }
        .redteam-terminal { background: #111; border: 2px solid black; box-shadow: -8px 8px 0 0 black; border-radius: 8px; overflow: hidden; font-family: 'SF Mono', 'Roboto Mono', monospace; font-size: 0.72rem; }
        .redteam-terminal__bar { background: rgba(255,255,255,0.06); padding: 0.5rem 1rem; color: rgba(255,255,255,0.4); font-weight: 700; font-size: 0.7rem; letter-spacing: 0.08em; }
        .redteam-terminal__body { padding: 1rem; display: flex; flex-direction: column; gap: 0.25rem; min-height: 160px; position: relative; }
        .rt-line { color: rgba(52,211,153,0.8); opacity: 0; }
        .rt-line--crit { color: var(--red); background: rgba(255,95,87,0.1); padding: 2px 4px; border-radius: 3px; border-left: 3px solid var(--red); }
        .rt-banner { position: absolute; bottom: 0.75rem; right: 0.75rem; background: var(--red); color: white; font-weight: 800; font-size: 0.7rem; padding: 0.4rem 0.85rem; border: 2px solid black; box-shadow: 4px 4px 0 0 black; transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); letter-spacing: 0.08em; }
        .rt-banner.show { transform: translateX(0); }

        /* Blue Team Preview */
        .blueteam-preview { width: 100%; max-width: 420px; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .radar-container { position: relative; width: 240px; height: 240px; }
        .radar-circle { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(52,211,153,0.4); }
        .radar-ring { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(52,211,153,0.2); animation: radarPulse 2s ease-in-out infinite; }
        .radar-ring--2 { animation-delay: 0.66s; }
        .radar-ring--3 { animation-delay: 1.33s; }
        @keyframes radarPulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        .radar-blip { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: var(--red); transform: translate(-50%,-50%); opacity: 0; }
        .radar-check { position: absolute; width: 18px; height: 18px; transform: translate(-50%,-50%) scale(0); }
        .radar-check svg { width: 18px; height: 18px; }
        .radar-glow { position: absolute; inset: -20px; border-radius: 50%; background: radial-gradient(ellipse, rgba(255,95,87,0.15) 0%, transparent 70%); transition: background 0.8s ease; pointer-events: none; }
        .radar-glow.intercepted { background: radial-gradient(ellipse, rgba(52,211,153,0.15) 0%, transparent 70%); }
        .blueteam-status { font-family: 'Satoshi', sans-serif; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(0,0,0,0.4); }

        /* Stage reveal animations (GSAP-driven — initial state) */
        .stage-identity, .stage-preview { opacity: 0; }

        /* Mobile */
        @media (max-width: 900px) {
            .product-stage { grid-template-columns: 1fr; min-height: auto; }
            .product-stage:nth-child(even) { grid-template-columns: 1fr; }
            .product-stage:nth-child(even) .stage-preview { order: 0; }
            .stage-identity { padding: 4rem 1.5rem; border-right: none; border-bottom: 4px solid black; }
            .product-stage:nth-child(even) .stage-identity { border-left: none; border-bottom: 4px solid black; }
            .stage-preview { padding: 3rem 1.5rem; }
        }
        @media (max-width: 600px) { .stage-preview { display: none; } .stage-identity { opacity: 1 !important; } }
```

- [ ] **Step 5: Replace only the three product sections in products.html**

**Important:** products.html has FIVE `.product-section` elements total. Only replace three. The console section (`id="console"`, line 1175) and any section after it must NOT be touched.

Find this exact opening tag (line 735):
```html
        <section class="product-section reveal" id="cloud" data-cursor="yellow">
```

Find this exact closing tag (end of the Blue Team section, line 1170):
```html
        </section>
```
(This closing `</section>` is immediately followed on line 1172 by the `<!-- ═════ BRUTALIST CONSOLE SECTION ═════ -->` comment.)

Delete everything from line 735 through line 1170 (inclusive). The `<!-- KINETIC DIVIDER -->` marquee at lines 728–733 sits ABOVE line 735 — leave it intact. Replace the deleted block with:

```html
        <div class="product-stages">

          <!-- Divider 01 -->
          <div class="product-divider" id="div01">
            <div class="product-divider__line" id="divLine01"></div>
            <div class="product-divider__num" id="divNum01">01</div>
            <div class="product-divider__line" id="divLine01b"></div>
          </div>

          <!-- Stage 1: Cloud Scanner -->
          <!-- id="cloud" preserves anchor links from index.html features grid -->
          <div class="product-stage" id="stage01" data-stage="1"><a id="cloud" style="position:absolute;top:0;"></a>
            <div class="stage-identity" id="stage01-identity">
              <div class="stage-num">Product 01</div>
              <h2 class="stage-name" id="stage01-name">Cloud<br>Scanner</h2>
              <div class="stage-punch"><span class="stage-punch__typed" id="stage01-punch"></span></div>
              <div class="stage-badges" id="stage01-badges">
                <span class="stage-badge">AWS</span>
                <span class="stage-badge">Azure</span>
                <span class="stage-badge">GCP</span>
                <span class="stage-badge">CIS Benchmark</span>
                <span class="stage-badge">SOC 2</span>
              </div>
              <a href="https://console.hemisx.com" target="_blank" class="stage-cta scan-line-btn">Launch Scanner ⚡</a>
            </div>
            <div class="stage-preview" id="stage01-preview">
              <div class="stage-glow stage-glow--blue"></div>
              <div class="scanner-preview">
                <div class="scanner-card" id="sc1"><span class="scanner-card__name">S3 Bucket ACL</span><span class="scanner-card__badge badge-fail">PUBLIC READ</span></div>
                <div class="scanner-card" id="sc2"><span class="scanner-card__name">CloudTrail Logging</span><span class="scanner-card__badge badge-fail">DISABLED</span></div>
                <div class="scanner-card" id="sc3"><span class="scanner-card__name">IAM Root MFA</span><span class="scanner-card__badge badge-warn">NOT SET</span></div>
                <div class="scanner-card scanner-card--misconfigured" id="sc4"><span class="scanner-card__name">Security Groups</span><span class="scanner-card__badge badge-fail">0.0.0.0/0</span></div>
                <div class="scanner-card" id="sc5"><span class="scanner-card__name">KMS Encryption</span><span class="scanner-card__badge badge-pass">ENABLED</span></div>
                <div class="scanner-card" id="sc6"><span class="scanner-card__name">VPC Flow Logs</span><span class="scanner-card__badge badge-pass">ACTIVE</span></div>
                <div class="scanner-meter" id="scannerMeter">
                  <div class="scanner-meter__label">
                    <span id="scannerLabel">SCANNING...</span>
                    <span id="scannerPct">0%</span>
                  </div>
                  <div class="scanner-meter__track"><div class="scanner-meter__fill" id="scannerFill"></div></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider 02 -->
          <div class="product-divider" id="div02">
            <div class="product-divider__line" id="divLine02"></div>
            <div class="product-divider__num" id="divNum02">02</div>
            <div class="product-divider__line" id="divLine02b"></div>
          </div>

          <!-- Stage 2: HEMIS Red Team -->
          <!-- id="red" preserves anchor links from index.html features grid -->
          <div class="product-stage" id="stage02" data-stage="2"><a id="red" style="position:absolute;top:0;"></a>
            <div class="stage-identity" id="stage02-identity">
              <div class="stage-num">Product 02</div>
              <h2 class="stage-name" id="stage02-name">HEMIS<br>Red Team</h2>
              <div class="stage-punch"><span class="stage-punch__typed" id="stage02-punch"></span></div>
              <div class="stage-badges" id="stage02-badges">
                <span class="stage-badge">MITRE ATT&amp;CK</span>
                <span class="stage-badge">AI/LLM</span>
                <span class="stage-badge">OWASP Top 10</span>
                <span class="stage-badge">Payload Gen</span>
              </div>
              <a href="https://console.hemisx.com" target="_blank" class="stage-cta scan-line-btn">Launch HEMIS ⚡</a>
            </div>
            <div class="stage-preview" id="stage02-preview">
              <div class="stage-glow stage-glow--red"></div>
              <div class="redteam-preview">
                <div class="redteam-terminal">
                  <div class="redteam-terminal__bar">HEMIS RED TEAM ENGINE — ACTIVE SIMULATION</div>
                  <div class="redteam-terminal__body">
                    <div class="rt-line" id="rt1">&gt; Initializing engagement: Target Corp</div>
                    <div class="rt-line" id="rt2">&gt; Recon phase... enumerating subdomains</div>
                    <div class="rt-line" id="rt3">&gt; Found: api.target.internal:8080</div>
                    <div class="rt-line" id="rt4">&gt; Testing authentication endpoints...</div>
                    <div class="rt-line" id="rt5">&gt; Fuzzing login parameters...</div>
                    <div class="rt-line rt-line--crit" id="rt6">&gt; [CRITICAL] CVE-2024-3094 — Auth Bypass</div>
                    <div class="rt-line" id="rt7">&gt; Payload delivered. Session token captured.</div>
                    <div class="rt-line" id="rt8">&gt; Lateral movement vector identified...</div>
                    <div class="rt-banner" id="rtBanner">⚠ CRITICAL FINDING</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider 03 -->
          <div class="product-divider" id="div03">
            <div class="product-divider__line" id="divLine03"></div>
            <div class="product-divider__num" id="divNum03">03</div>
            <div class="product-divider__line" id="divLine03b"></div>
          </div>

          <!-- Stage 3: Blue Team -->
          <!-- id="blue" preserves anchor links from index.html features grid -->
          <div class="product-stage" id="stage03" data-stage="3"><a id="blue" style="position:absolute;top:0;"></a>
            <div class="stage-identity" id="stage03-identity">
              <div class="stage-num">Product 03</div>
              <h2 class="stage-name" id="stage03-name">AI Blue<br>Team</h2>
              <div class="stage-punch"><span class="stage-punch__typed" id="stage03-punch"></span></div>
              <div class="stage-badges" id="stage03-badges">
                <span class="stage-badge">Autonomous</span>
                <span class="stage-badge">SIEM</span>
                <span class="stage-badge">Sigma Rules</span>
                <span class="stage-badge">Real-time</span>
              </div>
              <a href="https://console.hemisx.com" target="_blank" class="stage-cta scan-line-btn">Activate Defense ⚡</a>
            </div>
            <div class="stage-preview" id="stage03-preview">
              <div class="stage-glow stage-glow--green"></div>
              <div class="blueteam-preview">
                <div class="radar-container">
                  <div class="radar-glow" id="radarGlow"></div>
                  <div class="radar-circle"></div>
                  <div class="radar-ring"></div>
                  <div class="radar-ring radar-ring--2"></div>
                  <div class="radar-ring radar-ring--3"></div>
                  <!-- Blips at fixed radar positions -->
                  <div class="radar-blip" id="blip1" style="left:75%;top:30%;"></div>
                  <div class="radar-check" id="check1" style="left:75%;top:30%;">
                    <svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" fill="var(--green)"/><path d="M5 9l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="radar-blip" id="blip2" style="left:25%;top:65%;"></div>
                  <div class="radar-check" id="check2" style="left:25%;top:65%;">
                    <svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" fill="var(--green)"/><path d="M5 9l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="radar-blip" id="blip3" style="left:60%;top:70%;"></div>
                  <div class="radar-check" id="check3" style="left:60%;top:70%;">
                    <svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" fill="var(--green)"/><path d="M5 9l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="radar-blip" id="blip4" style="left:35%;top:25%;"></div>
                  <div class="radar-check" id="check4" style="left:35%;top:25%;">
                    <svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" fill="var(--green)"/><path d="M5 9l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
                <div class="blueteam-status" id="btStatus">MONITORING THREATS</div>
              </div>
            </div>
          </div>

        </div><!-- /product-stages -->
```

- [ ] **Step 6: Also remove the 3D CSS perspective from `.product-vis` since it's replaced**

Find in `products.html` `<style>`:
```css
        .product-vis {
            ...
            transform: perspective(1000px) rotateY(-8deg) rotateX(4deg);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
        }
        .product-vis:hover {
            transform: perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02);
```
These rules are now obsolete (`.product-vis` elements are gone). Delete them.

- [ ] **Step 7: Commit products.html HTML changes**

```bash
git add products.html
git commit -m "feat: products page threat marquee + full-width product stages HTML"
```

---

## Task 7: GSAP Animation Init — index.html

**Files:**
- Modify: `index.html` (add GSAP scripts + init before `</body>`)

- [ ] **Step 1: Add GSAP CDN scripts before `</body>` in index.html**

Find `</body>` in `index.html`. Insert before it:

```html
  <!-- GSAP + ScrollTrigger (loaded after boot.js and globe.js) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script>
  (function initCinematicAnimations() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Boot teardown + font load sequencing ──────────────────────────
    // boot.js sets body { overflow: hidden } until complete (~1.7s).
    // ScrollTrigger must not calculate pin spacers while overflow is hidden.
    // We wait for BOTH fonts AND boot completion before initializing.
    // Boot completion: products.html sets body.boot-complete class.
    // For index.html, boot.js doesn't use boot-complete, so we poll briefly.
    function waitForBoot(cb) {
      // If boot-complete class already set, proceed immediately
      if (document.body.classList.contains('boot-complete') ||
          document.body.style.overflow !== 'hidden') {
        cb(); return;
      }
      // Otherwise wait up to 3s for overflow to clear
      let attempts = 0;
      const check = setInterval(() => {
        attempts++;
        if (document.body.style.overflow !== 'hidden' ||
            document.body.classList.contains('boot-complete') ||
            attempts > 30) {
          clearInterval(check);
          cb();
        }
      }, 100);
    }

    document.fonts.ready.then(() => {
      waitForBoot(() => {
      gsap.registerPlugin(ScrollTrigger);

      // ── Hero scroll depth → globe camera ──────────────────────────
      if (!reduceMotion && window.globeSetScrollDepth) {
        ScrollTrigger.create({
          trigger: '.hero-x',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => window.globeSetScrollDepth(self.progress)
        });
      }

      // ── Features grid staggered entry ─────────────────────────────
      const featureCards = document.querySelectorAll('.feature[data-reveal]');
      featureCards.forEach(card => {
        const dir = card.dataset.reveal;
        const fromX = dir === 'left' ? -80 : dir === 'right' ? 80 : 0;
        const fromY = dir === 'up' ? 80 : 0;
        if (reduceMotion) {
          gsap.set(card, { opacity: 1, x: 0, y: 0 });
        } else {
          gsap.fromTo(card,
            { opacity: 0, x: fromX, y: fromY },
            {
              opacity: 1, x: 0, y: 0,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 75%', once: true },
              onComplete: () => { card.style.willChange = 'auto'; }
            }
          );
        }
        // activate glow after entry
        ScrollTrigger.create({
          trigger: card,
          start: 'top 75%',
          once: true,
          onEnter: () => card.classList.add('glow-active')
        });
      });

      // ── How Cinema: horizontal scroll (desktop only) ───────────────
      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      // ── CVSS counter state + typing animation state ────────────────
      // NOTE: These are fired from the horizontal scroll onUpdate, NOT
      // from standalone ScrollTrigger.create() calls — because #howPanel3
      // and #howPanel4 are inside a pinned 400vw flex container; their
      // document position does not change as you horizontally scroll.
      const cvssEl = document.getElementById('cvssScore');
      let cvssAnimated = false;

      const codeSnippet = `resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  # CVE-2023-38408 patch applied
  metadata_options {
    http_tokens = "required"
  }
}`;
      const typedEl = document.getElementById('howTypedCode');
      const stampEl = document.getElementById('howPatchedStamp');
      let typingInterval = null;
      let codeAnimated = false;

      function triggerCVSSCounter() {
        if (cvssAnimated || !cvssEl) return;
        cvssAnimated = true;
        if (reduceMotion) { cvssEl.textContent = '9.2'; return; }
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 9.2, duration: 1.2, ease: 'power2.out',
          onUpdate: () => { cvssEl.textContent = obj.val.toFixed(1); }
        });
      }

      function triggerCodeTyping() {
        if (codeAnimated) return;
        codeAnimated = true;
        if (reduceMotion) {
          if (typedEl) typedEl.textContent = codeSnippet;
          if (stampEl) stampEl.classList.add('stamp-show');
          return;
        }
        if (typingInterval) clearInterval(typingInterval);
        let i = 0;
        typingInterval = setInterval(() => {
          if (!typedEl) { clearInterval(typingInterval); return; }
          typedEl.textContent = codeSnippet.slice(0, i);
          i++;
          if (i > codeSnippet.length) {
            clearInterval(typingInterval);
            typingInterval = null;
            setTimeout(() => { if (stampEl) stampEl.classList.add('stamp-show'); }, 300);
          }
        }, 18);
      }

      // ── How Cinema: horizontal scroll (desktop only) ───────────────
      // Store the matchMedia context so its cleanup function can fire on resize
      const mm = gsap.matchMedia();

      if (!isMobile && !reduceMotion) {
        mm.add('(min-width: 769px)', () => {
          const track = document.getElementById('howTrack');
          if (!track) return;

          const st = gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
              trigger: '.how-cinema',
              pin: true,
              scrub: 1,
              end: () => '+=' + (track.scrollWidth - window.innerWidth),
              onUpdate: (self) => {
                const progress = self.progress;
                const panelIndex = Math.min(3, Math.floor(progress * 4));
                // Update dots
                document.querySelectorAll('.how-dot').forEach((d, i) => {
                  d.classList.toggle('is-active', i === panelIndex);
                });
                // Activate panels
                ['howPanel1','howPanel2','howPanel3','howPanel4'].forEach((id, i) => {
                  const panel = document.getElementById(id);
                  if (panel) panel.classList.toggle('is-active', i <= panelIndex);
                });
                // Show dots while in section
                const dots = document.getElementById('howDots');
                if (dots) {
                  if (progress > 0 && progress < 1) dots.classList.add('is-visible');
                  else dots.classList.remove('is-visible');
                }
                // Fire panel-specific animations at correct horizontal progress
                if (panelIndex >= 2) triggerCVSSCounter();
                if (panelIndex >= 3) triggerCodeTyping();
              }
            }
          });

          return () => { st.kill(); };
        });
      } else {
        // Mobile / reduced-motion: show all panels visible immediately
        ['howPanel1','howPanel2','howPanel3','howPanel4'].forEach(id => {
          const p = document.getElementById(id);
          if (p) p.classList.add('is-active');
        });
        // Fire counters immediately
        triggerCVSSCounter();
        triggerCodeTyping();
      }

      ScrollTrigger.refresh();
      }); // end waitForBoot
    }); // end document.fonts.ready
  })();
  </script>
```

- [ ] **Step 2: Verify no console errors on index.html**

Open `index.html` in browser. Check console: no errors. Scroll through the page:
- Globe shrinks slightly as you scroll past hero
- Features grid cards stagger in from 3 directions
- How It Works section pins and scrolls horizontally through 4 panels
- CVSS counter animates in Panel 3
- Terraform code types out in Panel 4 with PATCHED stamp

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: GSAP animations init — hero scroll depth, features entry, how-cinema horizontal scroll"
```

---

## Task 8: GSAP Animation Init — products.html

**Files:**
- Modify: `products.html` (add GSAP scripts + init before `</body>`)

- [ ] **Step 1: Add GSAP CDN scripts before `</body>` in products.html**

Find `</body>` in `products.html`. Insert before it:

```html
  <!-- GSAP + ScrollTrigger -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script>
  (function initProductAnimations() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;

    const punchLines = {
      'stage01-punch': 'Automated cloud misconfiguration detection.',
      'stage02-punch': 'AI-powered red team simulation engine.',
      'stage03-punch': 'Autonomous real-time threat interception.'
    };

    function typePunch(elId, text, cb) {
      const el = document.getElementById(elId);
      if (!el) return;
      if (reduceMotion) { el.textContent = text; if (cb) cb(); return; }
      let i = 0;
      const iv = setInterval(() => {
        el.textContent = text.slice(0, i);
        i++;
        if (i > text.length) { clearInterval(iv); if (cb) cb(); }
      }, 16);
    }

    function animateBadges(containerId) {
      const badges = document.querySelectorAll('#' + containerId + ' .stage-badge');
      if (reduceMotion) {
        badges.forEach(b => { b.style.opacity = 1; b.style.transform = 'scale(1)'; });
        return;
      }
      gsap.to(badges, {
        opacity: 1, scale: 1,
        duration: 0.35, ease: 'back.out(1.7)',
        stagger: 0.05,
        onStart: () => badges.forEach(b => { b.style.transform = 'scale(0)'; })
      });
    }

    function waitForBoot(cb) {
      if (document.body.classList.contains('boot-complete') ||
          document.body.style.overflow !== 'hidden') {
        cb(); return;
      }
      let attempts = 0;
      const check = setInterval(() => {
        attempts++;
        if (document.body.classList.contains('boot-complete') ||
            document.body.style.overflow !== 'hidden' || attempts > 30) {
          clearInterval(check); cb();
        }
      }, 100);
    }

    document.fonts.ready.then(() => {
      waitForBoot(() => {
      gsap.registerPlugin(ScrollTrigger);

      // ── Dividers ────────────────────────────────────────────────────
      [['divLine01','divNum01','divLine01b'],
       ['divLine02','divNum02','divLine02b'],
       ['divLine03','divNum03','divLine03b']].forEach(([l1, num, l2]) => {
        const trigger = document.getElementById(num)?.parentElement;
        if (!trigger) return;
        ScrollTrigger.create({
          trigger,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            if (reduceMotion) {
              ['#'+l1,'#'+num,'#'+l2].forEach(id => {
                const el = document.querySelector(id);
                if (el) { el.style.opacity = 1; el.style.transform = 'none'; }
              });
              return;
            }
            gsap.to('#'+l1, { scaleX: 1, duration: 0.5, ease: 'power3.out', transformOrigin: 'left center' });
            gsap.to('#'+l2, { scaleX: 1, duration: 0.5, ease: 'power3.out', transformOrigin: 'right center' });
            gsap.to('#'+num, { opacity: 1, duration: 0.4, delay: 0.2 });
          }
        });
      });

      // ── Stage reveal + live previews ───────────────────────────────
      document.querySelectorAll('.product-stage').forEach(stage => {
        const stageId = stage.id;
        const identity = stage.querySelector('.stage-identity');
        const preview = stage.querySelector('.stage-preview');

        if (reduceMotion) {
          if (identity) { identity.style.opacity = 1; identity.style.transform = 'none'; }
          if (preview) { preview.style.opacity = 1; preview.style.transform = 'none'; }
          // still need to trigger previews
        }

        ScrollTrigger.create({
          trigger: stage,
          start: 'top 60%',
          once: true,
          onEnter: () => {
            stage.classList.add('is-revealed');

            if (!reduceMotion) {
              // slide in panels
              if (identity) gsap.fromTo(identity, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', onComplete: () => { identity.style.willChange = 'auto'; } });
              if (preview)  gsap.fromTo(preview,  { x: 80, opacity: 0 },  { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', onComplete: () => { preview.style.willChange = 'auto'; } });
            }

            // type punch line
            const num = stage.dataset.stage;
            const punchId = 'stage0' + num + '-punch';
            const badgesId = 'stage0' + num + '-badges';
            typePunch(punchId, punchLines[punchId] || '', () => animateBadges(badgesId));

            // parallax on name
            const nameEl = document.getElementById('stage0' + num + '-name');
            if (nameEl && !reduceMotion) {
              gsap.to(nameEl, {
                y: -60,
                ease: 'none',
                scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: true }
              });
            }

            // live previews per product
            if (num === '1') animateScannerPreview();
            if (num === '2') animateRedTeamPreview();
            if (num === '3') animateBlueTeamPreview();
          }
        });
      });

      // ── Cloud Scanner Preview ──────────────────────────────────────
      function animateScannerPreview() {
        const fill = document.getElementById('scannerFill');
        const label = document.getElementById('scannerLabel');
        const pct = document.getElementById('scannerPct');
        const cards = ['sc1','sc2','sc3','sc4','sc5','sc6'];

        if (reduceMotion) {
          cards.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('sc-revealed'); });
          if (fill) fill.style.width = '73%';
          if (label) label.textContent = '73% COMPLIANT';
          if (pct) pct.textContent = '73%';
          return;
        }

        cards.forEach((id, i) => {
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.classList.add('sc-revealed');
          }, i * 60);
        });
        setTimeout(() => {
          if (fill) fill.style.width = '73%';
          let n = 0;
          const iv = setInterval(() => {
            n = Math.min(73, n + 1);
            if (pct) pct.textContent = n + '%';
            if (n >= 73) { clearInterval(iv); if (label) label.textContent = '73% COMPLIANT'; }
          }, 20);
        }, 400);
      }

      // ── Red Team Preview ───────────────────────────────────────────
      function animateRedTeamPreview() {
        const lines = ['rt1','rt2','rt3','rt4','rt5','rt6','rt7','rt8'];
        const banner = document.getElementById('rtBanner');

        if (reduceMotion) {
          lines.forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 1; });
          if (banner) banner.classList.add('show');
          return;
        }

        lines.forEach((id, i) => {
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) gsap.to(el, { opacity: 1, duration: 0.1 });
          }, i * 120);
        });
        setTimeout(() => {
          if (banner) banner.classList.add('show');
        }, lines.length * 120 + 200);
      }

      // ── Blue Team Preview ──────────────────────────────────────────
      function animateBlueTeamPreview() {
        const blips = ['blip1','blip2','blip3','blip4'];
        const checks = ['check1','check2','check3','check4'];
        const radarGlow = document.getElementById('radarGlow');
        const btStatus = document.getElementById('btStatus');

        if (reduceMotion) {
          blips.forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          checks.forEach(id => { const el = document.getElementById(id); if (el) el.style.transform = 'translate(-50%,-50%) scale(1)'; });
          if (radarGlow) radarGlow.classList.add('intercepted');
          if (btStatus) btStatus.textContent = 'ALL THREATS NEUTRALISED';
          return;
        }

        blips.forEach((id, i) => {
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) gsap.to(el, { opacity: 1, duration: 0.2 });
          }, i * 300);
        });

        checks.forEach((id, i) => {
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) gsap.fromTo(el, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
            const blip = document.getElementById(blips[i]);
            if (blip) gsap.to(blip, { opacity: 0, duration: 0.2 });
          }, i * 300 + 600);
        });

        setTimeout(() => {
          if (radarGlow) radarGlow.classList.add('intercepted');
          if (btStatus) btStatus.textContent = 'ALL THREATS NEUTRALISED';
        }, checks.length * 300 + 1000);
      }

      ScrollTrigger.refresh();
      }); // end waitForBoot
    }); // end document.fonts.ready
  })();
  </script>
```

- [ ] **Step 2: Verify products.html in browser**

Open `products.html`. Confirm:
- Threat intel marquee scrolls behind header title
- Dividers animate in (lines expand, number fades)
- Each product stage slides in from left/right on scroll
- Scanner cards populate, meter fills to 73%
- Red team terminal lines stream in, CRITICAL FINDING banner slides in
- Radar shows blips, gets intercepted, glow turns green
- No console errors

- [ ] **Step 3: Commit**

```bash
git add products.html
git commit -m "feat: GSAP products page — dividers, stage reveals, live scanner/redteam/blueteam previews"
```

---

## Task 9: Final QA

- [ ] **Step 1: Test both pages across viewport widths**

Open browser DevTools, test at:
- 1440px — full desktop
- 900px — tablet (hero should stack, stages should stack)
- 600px — mobile (preview panels hidden, identity panels full-width)
- 375px — iPhone

Confirm no broken layouts at any width.

- [ ] **Step 2: Test `prefers-reduced-motion`**

In macOS: System Settings → Accessibility → Display → Reduce Motion → ON
Reload both pages. All text/content should be visible immediately with no animation. No blank sections.

- [ ] **Step 3: Test existing features are intact**

- Boot sequence still plays on products.html
- Custom cursor (cursor.js) still works
- Globe still renders on index.html
- Navigation links work
- Contact Us button works
- Back-to-top button still appears
- The `#console` section still renders on products.html (not deleted)
- Deployment/pricing section still renders on products.html (not deleted)

- [ ] **Step 4: Test anchor links from index.html features grid**

On index.html, click:
- "Cloud Misconfiguration Scanner" card → should scroll to `products.html#cloud` (lands at stage 1)
- "HEMIS" card → should scroll to `products.html#red` (lands at stage 2)
- "AI Blue Team" card → should scroll to `products.html#blue` (lands at stage 3)

- [ ] **Step 5: Test horizontal scroll panel animations**

On index.html desktop, scroll through the How It Works section:
- Panel 3: CVSS counter should animate from 0.0 → 9.2 when Panel 3 becomes active
- Panel 4: Terraform code should type out when Panel 4 becomes active, stamp should appear after
- Both should NOT trigger before their respective panels are reached

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: cinematic homepage + products — complete GSAP upgrade"
```

---

## Deliverables

| File | What was built |
|------|---------------|
| `styles.css` | `--shadow-xl`, `--red`, `--green` tokens; `.card-glow-*`; `.scan-line-btn/card`; `prefers-reduced-motion` |
| `globe.js` | Container-relative sizing; `window.globeSetScrollDepth()` hook |
| `index.html` | Split-screen hero; 4-panel horizontal cinema; animated features grid; GSAP init |
| `products.html` | Threat intel marquee; 3 full-width product stages with live preview widgets; GSAP init |
