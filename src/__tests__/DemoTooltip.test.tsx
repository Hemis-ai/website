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
