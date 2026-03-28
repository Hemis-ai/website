// src/__tests__/InteractiveDemoModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractiveDemoModal } from '@/components/products/InteractiveDemoModal'

const defaultProps = {
  productId: 'scanner' as const,
  productName: 'Cloud Misconfiguration Scanner',
  accentColor: '#6366f1',
  onClose: vi.fn(),
}

describe('InteractiveDemoModal', () => {
  it('renders the product name', () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    expect(screen.getByText('Cloud Misconfiguration Scanner')).toBeInTheDocument()
  })

  it('shows Step 1 of 4 on open', () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('advances to Step 2 when Next is clicked', async () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
  })

  it('goes back when Back is clicked after advancing', async () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('Back is disabled on step 1', () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled()
  })

  it('calls onClose when Close button is clicked', async () => {
    const onClose = vi.fn()
    render(<InteractiveDemoModal {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close demo/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<InteractiveDemoModal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('advances on ArrowRight when no input is focused', async () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
  })

  it('does NOT advance on ArrowRight when a textarea is focused', async () => {
    render(<InteractiveDemoModal {...defaultProps} productId="hemis" />)
    // HEMIS step 0 has a textarea — focus it then fire arrow key
    const textarea = screen.getByPlaceholderText(/describe the attack scenario/i)
    await userEvent.click(textarea)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    // Should still be on Step 1
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('renders hemis demo for hemis productId', () => {
    render(<InteractiveDemoModal {...defaultProps} productId="hemis" productName="HEMIS" />)
    expect(screen.getByText(/quick templates/i)).toBeInTheDocument()
  })

  it('renders blueteam demo for blueteam productId', () => {
    render(<InteractiveDemoModal {...defaultProps} productId="blueteam" productName="AI Blue Team" />)
    expect(screen.getByText('HEALTH')).toBeInTheDocument()
  })

  it('calls onClose when Finish is clicked on last step', async () => {
    const onClose = vi.fn()
    render(<InteractiveDemoModal {...defaultProps} onClose={onClose} />)
    // advance to step 4 (index 3)
    for (let i = 0; i < 3; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /finish/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
