// src/__tests__/HemisDemo.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HemisDemo } from '@/components/products/demos/HemisDemo'

const defaultProps = {
  step: 0,
  accentColor: '#10b981',
  onRequestNextStep: vi.fn(),
}

describe('HemisDemo', () => {
  describe('Step 0: Choose scenario', () => {
    it('renders 3 quick template cards', () => {
      render(<HemisDemo {...defaultProps} step={0} />)
      expect(screen.getByText(/simulate an external attacker/i)).toBeInTheDocument()
      expect(screen.getByText(/test our llm application/i)).toBeInTheDocument()
      expect(screen.getByText(/red team our internal admin panel/i)).toBeInTheDocument()
    })

    it('Execute button is disabled initially', () => {
      render(<HemisDemo {...defaultProps} step={0} />)
      expect(screen.getByRole('button', { name: /execute simulation/i })).toBeDisabled()
    })

    it('Execute button enables after selecting a template', async () => {
      render(<HemisDemo {...defaultProps} step={0} />)
      await userEvent.click(screen.getByText(/simulate an external attacker/i))
      expect(screen.getByRole('button', { name: /execute simulation/i })).not.toBeDisabled()
    })

    it('calls onRequestNextStep when Execute is clicked with template selected', async () => {
      const onRequestNextStep = vi.fn()
      render(<HemisDemo {...defaultProps} step={0} onRequestNextStep={onRequestNextStep} />)
      await userEvent.click(screen.getByText(/simulate an external attacker/i))
      await userEvent.click(screen.getByRole('button', { name: /execute simulation/i }))
      expect(onRequestNextStep).toHaveBeenCalledOnce()
    })
  })

  describe('Step 1: Simulation running', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('shows live indicator', () => {
      render(<HemisDemo {...defaultProps} step={1} />)
      expect(screen.getByText(/simulation running/i)).toBeInTheDocument()
    })

    it('streams terminal lines as timer advances', () => {
      render(<HemisDemo {...defaultProps} step={1} />)
      act(() => { vi.advanceTimersByTime(400) })
      expect(screen.getByText(/initializing hemis/i)).toBeInTheDocument()
    })
  })

  describe('Step 2: Attack chain', () => {
    it('renders 8 attack chain steps', () => {
      render(<HemisDemo {...defaultProps} step={2} />)
      expect(screen.getByText(/active scanning/i)).toBeInTheDocument()
      expect(screen.getByText(/transfer to cloud account/i)).toBeInTheDocument()
    })

    it('shows MITRE technique IDs', () => {
      render(<HemisDemo {...defaultProps} step={2} />)
      expect(screen.getByText('T1595')).toBeInTheDocument()
      expect(screen.getByText('T1537')).toBeInTheDocument()
    })
  })

  describe('Step 3: MITRE heatmap', () => {
    it('renders technique cells', () => {
      render(<HemisDemo {...defaultProps} step={3} />)
      expect(screen.getByText('T1595')).toBeInTheDocument()
    })

    it('renders tactic group labels', () => {
      render(<HemisDemo {...defaultProps} step={3} />)
      expect(screen.getByText('Reconnaissance')).toBeInTheDocument()
      expect(screen.getByText('Exfiltration')).toBeInTheDocument()
    })

    it('renders status legend', () => {
      render(<HemisDemo {...defaultProps} step={3} />)
      expect(screen.getByText('vulnerable')).toBeInTheDocument()
      expect(screen.getByText('mitigated')).toBeInTheDocument()
    })
  })
})
