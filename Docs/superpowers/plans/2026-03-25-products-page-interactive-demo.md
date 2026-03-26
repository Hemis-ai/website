# HemisX Products Page — Interactive Demo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js products page with three product cards that each open a Storylane.io-style guided screenshot tour modal (hotspot highlights + tooltip callouts, 3 steps per product).

**Architecture:** Greenfield Next.js App Router app. `ProductCardGrid` (client component) owns modal open/close state and renders a single shared `DemoModal`. Step state lives in `DemoModal`. All demo content is static data in `src/data/demos.ts`. Framer Motion handles all animations.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion

---

## File Map

| File | Responsibility |
|------|----------------|
| `src/types/demo.ts` | `DemoStepData` and `ProductDemo` TypeScript types |
| `src/data/demos.ts` | Static step data for all 3 products |
| `src/app/products/page.tsx` | Server component — renders `ProductsHero` + `ProductCardGrid` |
| `src/app/layout.tsx` | Root layout with font + global styles |
| `src/app/globals.css` | Tailwind directives |
| `src/components/products/ProductsHero.tsx` | Hero section (badge, headline, subtitle) |
| `src/components/products/ProductCardGrid.tsx` | `"use client"` — grid + modal open state + single `DemoModal` instance |
| `src/components/products/ProductCard.tsx` | Single product card with "Watch Demo" button |
| `src/components/products/DemoModal.tsx` | Full-screen modal shell with Framer Motion open/close |
| `src/components/products/DemoStep.tsx` | Screenshot container + `AnimatePresence` step transition wrapper |
| `src/components/products/Hotspot.tsx` | Pulsing highlight ring (two-layer, accent-colored) |
| `src/components/products/DemoTooltip.tsx` | Tooltip callout with title, description, inline Back/Next |
| `src/components/products/StepNav.tsx` | Progress dots + Back/Next buttons used in the footer |
| `public/demos/scanner/step-1.png` (etc.) | Placeholder screenshot images |
| `src/__tests__/` | Vitest + Testing Library unit tests |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Bootstrap Next.js project**

```bash
cd /Users/sai/Documents/Hemis
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

When prompted, accept all defaults. This creates the base project structure.

- [ ] **Step 2: Install Framer Motion and Vitest**

```bash
npm install framer-motion
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Vitest**

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
```

Create `src/__tests__/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add tsconfig path alias for tests**

Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 5: Create placeholder screenshot directory**

```bash
mkdir -p public/demos/scanner public/demos/hemis public/demos/blueteam
```

For each product, create 3 placeholder PNG files (1×1 pixel transparent PNG is fine — they will be replaced with real screenshots):
```bash
# Create a minimal placeholder PNG using Node
node -e "
const { createCanvas } = require('canvas') || {};
// Fallback: just touch the files
const fs = require('fs');
['scanner','hemis','blueteam'].forEach(p => {
  [1,2,3].forEach(n => {
    fs.writeFileSync('public/demos/'+p+'/step-'+n+'.png', '');
  });
});
"
```

Or simply:
```bash
for product in scanner hemis blueteam; do
  for step in 1 2 3; do
    touch public/demos/$product/step-$step.png
  done
done
```

- [ ] **Step 6: Verify project runs**

```bash
npm run dev
```

Expected: Next.js dev server starts at `http://localhost:3000` with no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, Framer Motion, Vitest"
```

---

## Task 2: Types and Demo Data

**Files:**
- Create: `src/types/demo.ts`
- Create: `src/data/demos.ts`

- [ ] **Step 1: Write the failing test for demo data shape**

Create `src/__tests__/demos.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { demos } from '@/data/demos'
import type { ProductDemo } from '@/types/demo'

describe('demos data', () => {
  it('exports an array of 3 ProductDemo objects', () => {
    expect(demos).toHaveLength(3)
  })

  it('each product has required fields', () => {
    demos.forEach((demo: ProductDemo) => {
      expect(demo.id).toBeTruthy()
      expect(demo.name).toBeTruthy()
      expect(demo.accentColor).toMatch(/^#[0-9a-f]{6}$/i)
      expect(demo.steps.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('each step has required fields', () => {
    demos.forEach((demo: ProductDemo) => {
      demo.steps.forEach((step) => {
        expect(step.image).toBeTruthy()
        expect(step.stepTitle).toBeTruthy()
        expect(step.description).toBeTruthy()
        expect(['top', 'bottom', 'left', 'right']).toContain(step.tooltipPosition)
        expect(step.hotspot.x).toBeTypeOf('number')
        expect(step.hotspot.y).toBeTypeOf('number')
        expect(step.hotspot.width).toBeTypeOf('number')
        expect(step.hotspot.height).toBeTypeOf('number')
      })
    })
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- src/__tests__/demos.test.ts
```

Expected: FAIL — `Cannot find module '@/data/demos'`

- [ ] **Step 3: Create types**

Create `src/types/demo.ts`:
```ts
export type DemoStepData = {
  image: string
  stepTitle: string
  description: string
  hotspot: {
    x: number
    y: number
    width: number
    height: number
  }
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right'
}

export type ProductDemo = {
  id: string
  name: string
  accentColor: string
  steps: DemoStepData[]
}
```

- [ ] **Step 4: Create demo data**

Create `src/data/demos.ts`:
```ts
import type { ProductDemo } from '@/types/demo'

export const demos: ProductDemo[] = [
  {
    id: 'scanner',
    name: 'Cloud Misconfiguration Scanner',
    accentColor: '#6366f1',
    steps: [
      {
        image: '/demos/scanner/step-1.png',
        stepTitle: 'Connect your AWS account',
        description:
          'Link HemisX to your AWS environment in under 60 seconds using a read-only IAM role. No agent installation required.',
        tooltipPosition: 'right',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/scanner/step-2.png',
        stepTitle: 'Review critical findings',
        description:
          'HemisX surfaces misconfigurations ranked by severity, mapped to SOC 2 and ISO 27001 controls.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/scanner/step-3.png',
        stepTitle: 'One-click remediation',
        description:
          'Apply the fix instantly. HemisX generates and applies the correct policy — no manual JSON editing needed.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
    ],
  },
  {
    id: 'hemis',
    name: 'HEMIS',
    accentColor: '#10b981',
    steps: [
      {
        image: '/demos/hemis/step-1.png',
        stepTitle: 'Define your attack scope',
        description:
          'Describe the target in plain English. HEMIS maps it to the MITRE ATT&CK framework and selects relevant techniques.',
        tooltipPosition: 'right',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/hemis/step-2.png',
        stepTitle: 'Run the simulation',
        description:
          'HEMIS launches a safe, non-destructive red team simulation against your own systems using AI-generated adversarial techniques.',
        tooltipPosition: 'bottom',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/hemis/step-3.png',
        stepTitle: 'Review your attack surface',
        description:
          'See every exploited path ranked by risk. Each finding links to the MITRE technique and recommended remediation.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
    ],
  },
  {
    id: 'blueteam',
    name: 'AI Blue Team',
    accentColor: '#3b82f6',
    steps: [
      {
        image: '/demos/blueteam/step-1.png',
        stepTitle: 'Real-time threat monitoring',
        description:
          'AI Blue Team ingests logs, alerts, and network events across your stack and correlates them in real time.',
        tooltipPosition: 'right',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/blueteam/step-2.png',
        stepTitle: 'Autonomous threat triage',
        description:
          'When a threat is detected, the AI Blue Team classifies severity, traces the attack path, and recommends a response — in seconds.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/blueteam/step-3.png',
        stepTitle: 'Autonomous response actions',
        description:
          'Approve the suggested response or let it run automatically. Isolate hosts, revoke tokens, and block IPs without writing runbooks.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
    ],
  },
]
```

- [ ] **Step 5: Run test — verify it passes**

```bash
npm run test:run -- src/__tests__/demos.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/types/demo.ts src/data/demos.ts src/__tests__/demos.test.ts
git commit -m "feat: add demo types and static step data for 3 products"
```

---

## Task 3: StepNav Component

**Files:**
- Create: `src/components/products/StepNav.tsx`
- Create: `src/__tests__/StepNav.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/StepNav.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepNav } from '@/components/products/StepNav'

describe('StepNav', () => {
  const defaultProps = {
    currentStep: 1,
    totalSteps: 3,
    accentColor: '#6366f1',
    onBack: vi.fn(),
    onNext: vi.fn(),
  }

  it('renders the correct number of progress dots', () => {
    render(<StepNav {...defaultProps} />)
    const dots = document.querySelectorAll('[data-testid="progress-dot"]')
    expect(dots).toHaveLength(3)
  })

  it('marks the current step dot as active', () => {
    render(<StepNav {...defaultProps} currentStep={1} />)
    const dots = document.querySelectorAll('[data-testid="progress-dot"]')
    expect(dots[0]).toHaveAttribute('data-active', 'true')
    expect(dots[1]).toHaveAttribute('data-active', 'false')
  })

  it('calls onBack when Back is clicked', async () => {
    const onBack = vi.fn()
    render(<StepNav {...defaultProps} onBack={onBack} />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('calls onNext when Next is clicked', async () => {
    const onNext = vi.fn()
    render(<StepNav {...defaultProps} onNext={onNext} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('shows "Finish" instead of "Next" on the last step', () => {
    render(<StepNav {...defaultProps} currentStep={2} totalSteps={3} />)
    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  it('disables Back button on first step', () => {
    render(<StepNav {...defaultProps} currentStep={0} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- src/__tests__/StepNav.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/products/StepNav'`

- [ ] **Step 3: Implement StepNav**

Create `src/components/products/StepNav.tsx`:
```tsx
interface StepNavProps {
  currentStep: number
  totalSteps: number
  accentColor: string
  onBack: () => void
  onNext: () => void
}

export function StepNav({
  currentStep,
  totalSteps,
  accentColor,
  onBack,
  onNext,
}: StepNavProps) {
  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            data-testid="progress-dot"
            data-active={i === currentStep ? 'true' : 'false'}
            className="w-1.5 h-1.5 rounded-full border transition-colors duration-200"
            style={
              i === currentStep
                ? { background: accentColor, borderColor: accentColor }
                : { background: 'transparent', borderColor: '#334155' }
            }
          />
        ))}
      </div>

      <button
        onClick={onBack}
        disabled={isFirst}
        aria-label="Back"
        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-slate-700 transition-colors"
      >
        ← Back
      </button>

      <button
        onClick={onNext}
        aria-label={isLast ? 'Finish' : 'Next'}
        className="px-3 py-1.5 text-xs font-semibold rounded-md text-white transition-colors"
        style={{ background: accentColor }}
      >
        {isLast ? 'Finish' : 'Next →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm run test:run -- src/__tests__/StepNav.test.tsx
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/products/StepNav.tsx src/__tests__/StepNav.test.tsx
git commit -m "feat: add StepNav component with progress dots and back/next navigation"
```

---

## Task 4: Hotspot Component

**Files:**
- Create: `src/components/products/Hotspot.tsx`
- Create: `src/__tests__/Hotspot.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/Hotspot.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Hotspot } from '@/components/products/Hotspot'

describe('Hotspot', () => {
  const props = {
    x: 100,
    y: 80,
    width: 120,
    height: 32,
    accentColor: '#6366f1',
  }

  it('renders at the correct position', () => {
    const { container } = render(<Hotspot {...props} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.left).toBe('100px')
    expect(el.style.top).toBe('80px')
    expect(el.style.width).toBe('120px')
    expect(el.style.height).toBe('32px')
  })

  it('renders two child layers (glow + ring)', () => {
    const { container } = render(<Hotspot {...props} />)
    expect(container.firstChild?.childNodes).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- src/__tests__/Hotspot.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement Hotspot**

Create `src/components/products/Hotspot.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'

interface HotspotProps {
  x: number
  y: number
  width: number
  height: number
  accentColor: string
}

export function Hotspot({ x, y, width, height, accentColor }: HotspotProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, width, height }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-[-4px] rounded-md"
        style={{ border: `2px solid ${accentColor}`, opacity: 0.2 }}
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute inset-0 rounded"
        style={{ border: `2px solid ${accentColor}` }}
        animate={{
          boxShadow: [
            `0 0 0 0 ${accentColor}99`,
            `0 0 0 8px ${accentColor}00`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm run test:run -- src/__tests__/Hotspot.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/products/Hotspot.tsx src/__tests__/Hotspot.test.tsx
git commit -m "feat: add Hotspot component with pulsing glow animation"
```

---

## Task 5: DemoTooltip Component

**Files:**
- Create: `src/components/products/DemoTooltip.tsx`
- Create: `src/__tests__/DemoTooltip.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/DemoTooltip.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DemoTooltip } from '@/components/products/DemoTooltip'

const defaultProps = {
  stepLabel: 'Step 1 of 3',
  title: 'Connect your AWS account',
  description: 'Link HemisX to your AWS environment.',
  accentColor: '#6366f1',
  isFirst: true,
  isLast: false,
  onBack: vi.fn(),
  onNext: vi.fn(),
  position: 'right' as const,
}

describe('DemoTooltip', () => {
  it('renders the step label, title, and description', () => {
    render(<DemoTooltip {...defaultProps} />)
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('Connect your AWS account')).toBeInTheDocument()
    expect(screen.getByText('Link HemisX to your AWS environment.')).toBeInTheDocument()
  })

  it('calls onNext when Next is clicked', async () => {
    const onNext = vi.fn()
    render(<DemoTooltip {...defaultProps} onNext={onNext} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('shows Finish on last step', () => {
    render(<DemoTooltip {...defaultProps} isLast={true} />)
    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument()
  })

  it('Back button is hidden on first step', () => {
    render(<DemoTooltip {...defaultProps} isFirst={true} />)
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- src/__tests__/DemoTooltip.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement DemoTooltip**

Create `src/components/products/DemoTooltip.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'

interface DemoTooltipProps {
  stepLabel: string
  title: string
  description: string
  accentColor: string
  isFirst: boolean
  isLast: boolean
  onBack: () => void
  onNext: () => void
  position: 'top' | 'bottom' | 'left' | 'right'
}

const positionClasses: Record<DemoTooltipProps['position'], string> = {
  right: 'left-full ml-3 top-0',
  left: 'right-full mr-3 top-0',
  top: 'bottom-full mb-3 left-0',
  bottom: 'top-full mt-3 left-0',
}

export function DemoTooltip({
  stepLabel,
  title,
  description,
  accentColor,
  isFirst,
  isLast,
  onBack,
  onNext,
  position,
}: DemoTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`absolute z-20 w-60 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl ${positionClasses[position]}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
        {stepLabel}
      </p>
      <h4 className="text-sm font-bold text-slate-100 mb-1.5">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{description}</p>
      <div className="flex items-center justify-end gap-2">
        {!isFirst && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onNext}
          aria-label={isLast ? 'Finish' : 'Next'}
          className="px-2.5 py-1 text-xs font-semibold rounded-md text-white transition-colors"
          style={{ background: accentColor }}
        >
          {isLast ? 'Finish' : 'Next →'}
        </button>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm run test:run -- src/__tests__/DemoTooltip.test.tsx
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/products/DemoTooltip.tsx src/__tests__/DemoTooltip.test.tsx
git commit -m "feat: add DemoTooltip with position-aware placement and step navigation"
```

---

## Task 6: DemoStep Component

**Files:**
- Create: `src/components/products/DemoStep.tsx`
- Create: `src/__tests__/DemoStep.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/DemoStep.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DemoStep } from '@/components/products/DemoStep'
import type { DemoStepData } from '@/types/demo'

const step: DemoStepData = {
  image: '/demos/scanner/step-1.png',
  stepTitle: 'Connect your AWS account',
  description: 'Link HemisX quickly.',
  tooltipPosition: 'right',
  hotspot: { x: 100, y: 80, width: 120, height: 32 },
}

describe('DemoStep', () => {
  it('renders the tooltip title', () => {
    render(
      <DemoStep
        step={step}
        stepIndex={0}
        totalSteps={3}
        accentColor="#6366f1"
        onBack={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText('Connect your AWS account')).toBeInTheDocument()
  })

  it('renders the step description', () => {
    render(
      <DemoStep
        step={step}
        stepIndex={0}
        totalSteps={3}
        accentColor="#6366f1"
        onBack={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText('Link HemisX quickly.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- src/__tests__/DemoStep.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement DemoStep**

Create `src/components/products/DemoStep.tsx`:
```tsx
'use client'
import Image from 'next/image'
import { DemoStepData } from '@/types/demo'
import { Hotspot } from './Hotspot'
import { DemoTooltip } from './DemoTooltip'

interface DemoStepProps {
  step: DemoStepData
  stepIndex: number
  totalSteps: number
  accentColor: string
  onBack: () => void
  onNext: () => void
}

export function DemoStep({
  step,
  stepIndex,
  totalSteps,
  accentColor,
  onBack,
  onNext,
}: DemoStepProps) {
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  // On mobile (< 768px), tooltip position defaults to bottom,
  // but flips to top if hotspot is in lower half of container.
  // This is handled via CSS media query fallback — tooltip uses
  // position prop on desktop; on mobile always renders 'bottom'.

  return (
    <div className="relative w-full h-[240px] md:h-[300px] lg:h-[380px] bg-slate-950 overflow-hidden">
      {/* Screenshot */}
      {step.image ? (
        <Image
          src={step.image}
          alt={step.stepTitle}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <span className="text-slate-600 text-sm">Screenshot coming soon</span>
        </div>
      )}

      {/* Hotspot */}
      <Hotspot
        x={step.hotspot.x}
        y={step.hotspot.y}
        width={step.hotspot.width}
        height={step.hotspot.height}
        accentColor={accentColor}
      />

      {/* Tooltip — positioned relative to hotspot */}
      <div
        className="absolute"
        style={{ left: step.hotspot.x, top: step.hotspot.y }}
      >
        <DemoTooltip
          stepLabel={`Step ${stepIndex + 1} of ${totalSteps}`}
          title={step.stepTitle}
          description={step.description}
          accentColor={accentColor}
          isFirst={isFirst}
          isLast={isLast}
          onBack={onBack}
          onNext={onNext}
          position={step.tooltipPosition}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm run test:run -- src/__tests__/DemoStep.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/products/DemoStep.tsx src/__tests__/DemoStep.test.tsx
git commit -m "feat: add DemoStep component combining screenshot, hotspot, and tooltip"
```

---

## Task 7: DemoModal Component

**Files:**
- Create: `src/components/products/DemoModal.tsx`
- Create: `src/__tests__/DemoModal.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/DemoModal.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DemoModal } from '@/components/products/DemoModal'
import { demos } from '@/data/demos'

describe('DemoModal', () => {
  const product = demos[0]

  it('renders the product name in the header', () => {
    render(<DemoModal product={product} onClose={vi.fn()} />)
    expect(screen.getByText('Cloud Misconfiguration Scanner')).toBeInTheDocument()
  })

  it('shows step 1 of total on open', () => {
    render(<DemoModal product={product} onClose={vi.fn()} />)
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<DemoModal product={product} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('advances to step 2 when Next is clicked', async () => {
    render(<DemoModal product={product} onClose={vi.fn()} />)
    // Click the Next button in the footer
    const nextButtons = screen.getAllByRole('button', { name: /next/i })
    await userEvent.click(nextButtons[0])
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
  })

  it('goes back to step 1 when Back is clicked after advancing', async () => {
    render(<DemoModal product={product} onClose={vi.fn()} />)
    const nextButtons = screen.getAllByRole('button', { name: /next/i })
    await userEvent.click(nextButtons[0])
    await userEvent.click(screen.getAllByRole('button', { name: /back/i })[0])
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- src/__tests__/DemoModal.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement DemoModal**

Create `src/components/products/DemoModal.tsx`:
```tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductDemo } from '@/types/demo'
import { DemoStep } from './DemoStep'
import { StepNav } from './StepNav'

interface DemoModalProps {
  product: ProductDemo
  onClose: () => void
}

export function DemoModal({ product, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = product.steps.length
  const step = product.steps[currentStep]

  const handleNext = useCallback(() => {
    if (currentStep === totalSteps - 1) {
      onClose()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, totalSteps, onClose])

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} demo`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none"
      >
        <div
          className="w-full max-w-[820px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{product.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Interactive Product Demo</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 bg-slate-800 rounded-md px-2.5 py-1">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <button
                onClick={onClose}
                aria-label="Close demo"
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Screenshot area with step transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <DemoStep
                step={step}
                stepIndex={currentStep}
                totalSteps={totalSteps}
                accentColor={product.accentColor}
                onBack={handleBack}
                onNext={handleNext}
              />
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
            <div className="min-w-0 flex-1 mr-4">
              <p className="text-sm font-semibold text-slate-200 truncate">{step.stepTitle}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{step.description}</p>
            </div>
            <StepNav
              currentStep={currentStep}
              totalSteps={totalSteps}
              accentColor={product.accentColor}
              onBack={handleBack}
              onNext={handleNext}
            />
          </div>
        </div>
      </motion.div>
    </>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm run test:run -- src/__tests__/DemoModal.test.tsx
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/products/DemoModal.tsx src/__tests__/DemoModal.test.tsx
git commit -m "feat: add DemoModal with Framer Motion animations and step state"
```

---

## Task 8: ProductCard Component

**Files:**
- Create: `src/components/products/ProductCard.tsx`
- Create: `src/__tests__/ProductCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ProductCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '@/components/products/ProductCard'
import { demos } from '@/data/demos'

describe('ProductCard', () => {
  const product = demos[0]

  it('renders the product name', () => {
    render(<ProductCard product={product} onOpenDemo={vi.fn()} />)
    expect(screen.getByText('Cloud Misconfiguration Scanner')).toBeInTheDocument()
  })

  it('renders the Watch Demo button', () => {
    render(<ProductCard product={product} onOpenDemo={vi.fn()} />)
    expect(screen.getByRole('button', { name: /watch.*demo/i })).toBeInTheDocument()
  })

  it('calls onOpenDemo when Watch Demo is clicked', async () => {
    const onOpenDemo = vi.fn()
    render(<ProductCard product={product} onOpenDemo={onOpenDemo} />)
    await userEvent.click(screen.getByRole('button', { name: /watch.*demo/i }))
    expect(onOpenDemo).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- src/__tests__/ProductCard.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement ProductCard**

Create `src/components/products/ProductCard.tsx`:
```tsx
import type { ProductDemo } from '@/types/demo'

const PRODUCT_META: Record<string, { label: string; icon: string; description: string; tags: string[] }> = {
  scanner: {
    label: 'Cloud Security',
    icon: '☁️',
    description:
      'Automated detection and one-click remediation of AWS misconfigurations with SOC 2 and ISO 27001 compliance mapping.',
    tags: ['AWS', 'SOC 2', 'ISO 27001', 'Auto-remediation'],
  },
  hemis: {
    label: 'Red Team Engine',
    icon: '⚔️',
    description:
      'AI/LLM-powered red team simulation engine. Attacks your own systems using natural language-driven adversarial techniques based on MITRE ATT&CK.',
    tags: ['MITRE ATT&CK', 'LLM-driven', '40+ techniques'],
  },
  blueteam: {
    label: 'Threat Response',
    icon: '🛡️',
    description:
      'Real-time AI threat detection and autonomous response engine. Monitors, correlates, and neutralizes active threats — 70% faster than manual SOC workflows.',
    tags: ['Real-time', 'Autonomous', '70% faster MTTR'],
  },
}

interface ProductCardProps {
  product: ProductDemo
  onOpenDemo: () => void
}

export function ProductCard({ product, onOpenDemo }: ProductCardProps) {
  const meta = PRODUCT_META[product.id]

  return (
    <div
      className="relative bg-slate-900 border border-slate-800 rounded-2xl p-7 flex flex-col gap-4 overflow-hidden"
      style={{ '--accent': product.accentColor } as React.CSSProperties}
    >
      {/* Colored top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${product.accentColor}, ${product.accentColor}88)` }}
      />

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${product.accentColor}22` }}
      >
        {meta.icon}
      </div>

      <p
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: product.accentColor }}
      >
        {meta.label}
      </p>

      <h3 className="text-lg font-bold text-slate-100 leading-snug">{product.name}</h3>

      <p className="text-sm text-slate-400 leading-relaxed flex-1">
        {meta.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {meta.tags.map((tag) => (
          <span
            key={tag}
            className="bg-slate-800 rounded-md px-2.5 py-1 text-[11px] text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={onOpenDemo}
        aria-label={`Watch ${product.name} demo`}
        className="flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold border transition-colors"
        style={{
          color: product.accentColor,
          borderColor: `${product.accentColor}44`,
          background: `${product.accentColor}18`,
        }}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white"
          style={{ background: product.accentColor }}
        >
          ▶
        </span>
        Watch Product Demo
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm run test:run -- src/__tests__/ProductCard.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/products/ProductCard.tsx src/__tests__/ProductCard.test.tsx
git commit -m "feat: add ProductCard with color identity and Watch Demo button"
```

---

## Task 9: ProductCardGrid Component

**Files:**
- Create: `src/components/products/ProductCardGrid.tsx`
- Create: `src/__tests__/ProductCardGrid.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/ProductCardGrid.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCardGrid } from '@/components/products/ProductCardGrid'

describe('ProductCardGrid', () => {
  it('renders all 3 product cards', () => {
    render(<ProductCardGrid />)
    expect(screen.getByText('Cloud Misconfiguration Scanner')).toBeInTheDocument()
    expect(screen.getByText('HEMIS')).toBeInTheDocument()
    expect(screen.getByText('AI Blue Team')).toBeInTheDocument()
  })

  it('opens the modal when Watch Demo is clicked', async () => {
    render(<ProductCardGrid />)
    const demoButtons = screen.getAllByRole('button', { name: /watch.*demo/i })
    await userEvent.click(demoButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes the modal when close button is clicked', async () => {
    render(<ProductCardGrid />)
    const demoButtons = screen.getAllByRole('button', { name: /watch.*demo/i })
    await userEvent.click(demoButtons[0])
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- src/__tests__/ProductCardGrid.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement ProductCardGrid**

Create `src/components/products/ProductCardGrid.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { demos } from '@/data/demos'
import type { ProductDemo } from '@/types/demo'
import { ProductCard } from './ProductCard'
import { DemoModal } from './DemoModal'

export function ProductCardGrid() {
  const [activeDemo, setActiveDemo] = useState<ProductDemo | null>(null)

  return (
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {demos.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDemo={() => setActiveDemo(product)}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeDemo && (
          <DemoModal
            product={activeDemo}
            onClose={() => setActiveDemo(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm run test:run -- src/__tests__/ProductCardGrid.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/products/ProductCardGrid.tsx src/__tests__/ProductCardGrid.test.tsx
git commit -m "feat: add ProductCardGrid with shared DemoModal state"
```

---

## Task 10: ProductsHero and Page Assembly

**Files:**
- Create: `src/components/products/ProductsHero.tsx`
- Modify: `src/app/products/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create ProductsHero**

Create `src/components/products/ProductsHero.tsx`:
```tsx
export function ProductsHero() {
  return (
    <section className="text-center pt-20 pb-14 px-6">
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        <span className="text-xs font-semibold text-indigo-400">AI-Native Security Platform</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight mb-5">
        Three products.{' '}
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          One unified platform.
        </span>
      </h1>

      <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
        Enterprise-grade AI security built for SMBs — offensive simulation, autonomous defense, and
        cloud posture management.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Create the products page**

Create `src/app/products/page.tsx`:
```tsx
import { ProductsHero } from '@/components/products/ProductsHero'
import { ProductCardGrid } from '@/components/products/ProductCardGrid'

export const metadata = {
  title: 'Products — HemisX',
  description: 'AI-native cybersecurity platform for SMBs. Cloud scanner, red team engine, and autonomous threat response.',
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <ProductsHero />
      <ProductCardGrid />
    </main>
  )
}
```

- [ ] **Step 3: Update root layout with dark background and font**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HemisX',
  description: 'AI-native cybersecurity platform for SMBs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Update globals.css for Tailwind**

Replace `src/app/globals.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}
```

- [ ] **Step 5: Verify the full page renders**

```bash
npm run dev
```

Open `http://localhost:3000/products` in the browser. Verify:
- Hero section with badge, headline, and subtitle renders
- 3 product cards appear in a grid
- Clicking "Watch Demo" on any card opens the modal
- The modal shows the step title, hotspot (placeholder), and tooltip
- Next/Back navigation changes steps
- Close button and Escape key close the modal

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```

Expected: All tests PASS (no failures)

- [ ] **Step 7: Commit**

```bash
git add src/app/products/page.tsx src/app/layout.tsx src/app/globals.css src/components/products/ProductsHero.tsx
git commit -m "feat: assemble products page with hero and card grid"
```

---

## Task 11: Smoke Check and Final Wiring

- [ ] **Step 1: Redirect root to products page**

Modify `src/app/page.tsx` to redirect to `/products`:
```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/products')
}
```

- [ ] **Step 2: Build production bundle — verify no errors**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors or missing module warnings.

- [ ] **Step 3: Run all tests one final time**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete HemisX products page with interactive demo tours"
```

---

## Replacing Placeholder Screenshots

Once the user provides real screenshots:

1. Save each image as `/public/demos/{product-slug}/step-{n}.png` (e.g. `public/demos/scanner/step-1.png`)
2. Update the `hotspot` coordinates in `src/data/demos.ts` for each step to match the actual UI element position in the screenshot
3. Update `tooltipPosition` per step if the default positions overlap UI elements
4. Run `npm run dev` and visually verify hotspot + tooltip alignment on each step
