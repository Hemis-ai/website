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
    expect(dots[0]).toHaveAttribute('data-active', 'false')
    expect(dots[1]).toHaveAttribute('data-active', 'true')
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
