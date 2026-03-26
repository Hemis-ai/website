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
