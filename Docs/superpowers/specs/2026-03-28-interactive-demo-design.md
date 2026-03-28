# Interactive Console Demo — Design Spec
**Date:** 2026-03-28
**Status:** Approved

## Overview

Replace the existing 3-step screenshot-based product demo modals on the Hemis marketing website (`/products`) with rich, interactive console replicas. Each product card's "Watch Product Demo" button becomes "View Full Features" and opens a guided 4-step walkthrough that mimics the real HemisX console UI (from `hemis-app`), populated with the console's existing mock data.

## Goals

- Give prospective customers an interactive, story-driven preview of each product
- Demonstrate real capabilities using real mock data (findings, alerts, attack chains)
- Match the marketing website's design language (dark theme, Tailwind, Framer Motion)
- Zero backend calls — all data is static/client-side

## Non-Goals

- Pixel-perfect clone of the console UI (adapted style, not exact match)
- Sub-product demos (SAST, DAST, WBRT, BBRT) — only the 3 main products
- Free-roam navigation, settings, or auth

---

## Architecture

### Modal Shell

`InteractiveDemoModal` replaces the existing `DemoModal`. It reuses the same full-screen overlay approach but:
- Wider: max-width ~1100px (vs current ~800px)
- Header: product name + "Step X of 4" indicator
- Footer: Back / Next / Finish navigation buttons
- Body: renders the active product's demo component at the current step index
- Keyboard: Escape closes; Left/Right arrow keys navigate steps **only when focus is on the modal overlay itself, not on a child input or interactive element** (check `document.activeElement` — skip navigation if it is an `<input>`, `<textarea>`, `<button>`, or `<select>`)
- Body scroll lock when open (same as current)

### `InteractiveDemoModal` Prop Contract

```typescript
interface InteractiveDemoProps {
  productId: 'scanner' | 'hemis' | 'blueteam'
  productName: string
  accentColor: string
  onClose: () => void
}
```

`ProductCardGrid` passes `productId`, `productName`, and `accentColor` from the existing `ProductDemo` object (matching `demos.ts` ids and colors). The new modal does not use `ProductDemo.steps` — step content is derived internally from the demo components and mock data files.

### Demo Components

Three self-contained components, one per product:

| Component | File | Steps |
|-----------|------|-------|
| Cloud Scanner | `ScannerDemo.tsx` | 4 |
| HEMIS | `HemisDemo.tsx` | 4 |
| Blue Team | `BlueTeamDemo.tsx` | 4 |

Each component receives `step: number` (0-indexed) and `onRequestNextStep: () => void` as props. The `step` prop drives which content is displayed. Internal animation state (scan progress, streaming terminal, alert streaming) lives inside the component via `useState`/`useEffect` and is not reset on step changes — components use `step` to toggle visibility of sections rather than being unmounted and remounted.

`onRequestNextStep` is called by the demo component when it wants to programmatically advance (e.g., `HemisDemo` step 0 calls it after the Execute button is clicked). The modal shell increments the step index in response.

**State persistence across steps (BlueTeam):** `BlueTeamDemo` owns a `selectedAlertId` state that persists across all 4 steps. Step 1 renders the alert list and allows selection; step 2 and beyond read from the same `selectedAlertId`. Because the component is never unmounted during the demo session, this state survives step transitions naturally.

### Data Files

Trimmed copies of the hemis-app mock data, placed in the website's `src/data/`:

| File | Source |
|------|--------|
| `src/data/demo-scanner.ts` | `hemis-app/src/lib/mock-data/scanner.ts` (contains `MOCK_FINDINGS` and `MOCK_SCAN` with correct SOC2/ISO27001 scores) |
| `src/data/demo-hemis.ts` | `hemis-app/src/lib/mock-data/hemis.ts` |
| `src/data/demo-blueteam.ts` | `hemis-app/src/lib/mock-data/blueteam.ts` |

Only fields rendered in the UI are included — no backend API types, no Prisma/Supabase imports.

### Integration Point

`ProductCardGrid.tsx` — the button label changes from "Watch Product Demo" to "View Full Features" and the `onClick` now opens `InteractiveDemoModal` instead of `DemoModal`.

---

## Per-Product Walkthrough Flows

### Cloud Scanner (accent: indigo `#6366f1`)

| Step | Title | What renders |
|------|-------|-------------|
| 0 | Connect AWS account | Setup card with region/account inputs (prefilled), "Run Scan" button highlighted with a pulse ring |
| 1 | Scanning your environment | Progress bar animating through stages (IAM, S3, EC2, RDS, Lambda, KMS, CloudTrail, VPC Flow Logs, Compliance mapping, Risk scoring), scan-line CSS animation, stage log |
| 2 | Review critical findings | Findings table with 12 rows from `MOCK_FINDINGS`, severity filter buttons (ALL/CRITICAL/HIGH/MEDIUM/LOW), one row auto-expanded showing remediation steps and compliance tags |
| 3 | Compliance report | SOC2 (61%) and ISO27001 (58%) score cards sourced from `MOCK_SCAN.complianceScore`, with control pass/fail checklist, "Export Audit Package" button |

**Note on scan stages:** The list of scan stage names (step 1) is hardcoded inside `ScannerDemo.tsx` — it does not come from any mock data file. The stages are: `['Connecting to AWS account', 'Enumerating IAM resources', 'Scanning S3 buckets', 'Checking EC2 security groups', 'Auditing RDS instances', 'Inspecting Lambda functions', 'Reviewing KMS keys', 'Checking CloudTrail logs', 'Analyzing VPC Flow Logs', 'Mapping compliance controls', 'Calculating risk scores']`.

**Interactivity at step 2:** User can click any finding row to expand/collapse it. Severity filter buttons are active and filter the visible rows.

### HEMIS — AI Red Team Engine (accent: green `#10b981`)

| Step | Title | What renders |
|------|-------|-------------|
| 0 | Choose an attack scenario | Left panel: 3 quick-template cards (clickable to populate input textarea), textarea input, disabled "Execute" button |
| 1 | Simulation running | Terminal output streaming (green success / red error / orange warn lines), pulsing live indicator, progress counter |
| 2 | Attack chain results | 8-step kill chain timeline with MITRE technique IDs, phase tags, result badges (SUCCESS/FAILED), detail text per step |
| 3 | MITRE ATT&CK coverage | Technique grid grouped by tactic: VULNERABLE (red), MITIGATED (green), TESTED (blue), UNTESTED (gray) cells with IDs |

**Interactivity at step 0:** Clicking a template card populates the textarea and enables the "Execute" button. Step nav then advances to step 1.

### Blue Team (accent: blue `#3b82f6`)

| Step | Title | What renders |
|------|-------|-------------|
| 0 | Security health overview | 5 metric cards sourced from `HEALTH_SCORE`: Health 72/100, Detection 84%, Response 79%, Coverage 58%, MTTR 4m 12s — with color-coded status (orange for Health values below 80) |
| 1 | Live alert feed | Left panel renders all 6 entries from `INITIAL_ALERTS` immediately on step entry (pre-populated, no streaming delay). `LIVE_ALERT_FEED` entries are not used in the demo. First CRITICAL alert (`alert-001`) is auto-selected. |
| 2 | AI threat analysis | Right panel: selected alert detail — severity/status badges, AI Analysis box with full summary, resource/IP/region metadata, MITRE tactic tags |
| 3 | Autonomous response | Kill chain timeline (8 events) revealed, "AI PLAYBOOK EXECUTED" success state with list of auto-response actions taken |

**Interactivity at step 1:** User can click any alert in the list to select it and preview its detail in step 2.

---

## Styling

- Use the website's existing Tailwind CSS 4 config — no new CSS framework
- Product accent colors via inline styles or CSS custom properties: teal, red, blue per product
- Severity badge colors: CRITICAL `#ef4444`, HIGH `#f97316`, MEDIUM `#eab308`, LOW `#6b7280`
- Animations via Framer Motion (already installed): step transitions fade, terminal stream delay, progress bar fill
- No sidebar — demos are standalone panels within the modal

---

## File Changes

| File | Change |
|------|--------|
| `src/components/products/ProductCardGrid.tsx` | Change button label; open `InteractiveDemoModal` |
| `src/components/products/InteractiveDemoModal.tsx` | New — modal shell replacing `DemoModal` |
| `src/components/products/demos/ScannerDemo.tsx` | New — 4-step scanner replica |
| `src/components/products/demos/HemisDemo.tsx` | New — 4-step HEMIS replica |
| `src/components/products/demos/BlueTeamDemo.tsx` | New — 4-step Blue Team replica |
| `src/data/demo-scanner.ts` | New — trimmed mock data |
| `src/data/demo-hemis.ts` | New — trimmed mock data |
| `src/data/demo-blueteam.ts` | New — trimmed mock data |

`DemoModal.tsx`, `DemoStep.tsx`, `Hotspot.tsx`, `DemoTooltip.tsx`, `StepNav.tsx`, `demos.ts`, `demo.ts` — kept as-is (no deletions until new flow is working).

---

## Testing

- Existing Vitest tests for `DemoModal`, `ProductCard`, `ProductCardGrid` remain passing
- New tests for `InteractiveDemoModal`: opens/closes, step navigation (Back/Next/Finish), keyboard Escape closes, arrow keys advance steps when focus is on modal overlay, arrow keys are ignored when focus is on a textarea
- Each demo component: renders each step without errors; interactivity (filter clicks, row expand, template select, alert selection) works
- Animation-driven steps (scanner progress bar, HEMIS terminal streaming): use `vi.useFakeTimers()` to advance timers deterministically
- `BlueTeamDemo`: selected alert state persists when step changes from 1 to 2 without unmounting
- `BlueTeamDemo` step 2 IP field: guard against `undefined` — renders "—" when IP is absent

---

## Out of Scope

- Sub-product pages (SAST, DAST, WBRT, BBRT demos)
- Real API calls or authentication
- Mobile-optimized layout for the interactive demos (responsive is nice-to-have, not required)
- Removing the old `DemoModal` and related components until confirmed replaced
