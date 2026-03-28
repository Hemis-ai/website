// src/__tests__/ScannerDemo.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScannerDemo } from '@/components/products/demos/ScannerDemo'

const defaultProps = {
  step: 0,
  accentColor: '#6366f1',
  onRequestNextStep: vi.fn(),
}

describe('ScannerDemo', () => {
  describe('Step 0: Connect AWS', () => {
    it('renders AWS account input prefilled', () => {
      render(<ScannerDemo {...defaultProps} step={0} />)
      expect(screen.getByDisplayValue('482910382011')).toBeInTheDocument()
    })

    it('renders region input prefilled', () => {
      render(<ScannerDemo {...defaultProps} step={0} />)
      expect(screen.getByDisplayValue('us-east-1')).toBeInTheDocument()
    })

    it('calls onRequestNextStep when Run Scan is clicked', async () => {
      const onRequestNextStep = vi.fn()
      render(<ScannerDemo {...defaultProps} step={0} onRequestNextStep={onRequestNextStep} />)
      await userEvent.click(screen.getByRole('button', { name: /run scan/i }))
      expect(onRequestNextStep).toHaveBeenCalledOnce()
    })
  })

  describe('Step 1: Scanning', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('renders progress bar', () => {
      render(<ScannerDemo {...defaultProps} step={1} />)
      expect(screen.getByText(/scanning aws environment/i)).toBeInTheDocument()
    })

    it('advances through stages as timer ticks', () => {
      render(<ScannerDemo {...defaultProps} step={1} />)
      expect(screen.getByText(/connecting to aws account/i)).toBeInTheDocument()
      vi.advanceTimersByTime(350)
      expect(screen.getByText(/enumerating iam resources/i)).toBeInTheDocument()
    })
  })

  describe('Step 2: Findings', () => {
    it('renders 12 findings when ALL filter active', () => {
      render(<ScannerDemo {...defaultProps} step={2} />)
      expect(screen.getAllByText(/CRITICAL|HIGH|MEDIUM|LOW/).length).toBeGreaterThanOrEqual(12)
    })

    it('filters to only CRITICAL findings when CRITICAL clicked', async () => {
      render(<ScannerDemo {...defaultProps} step={2} />)
      await userEvent.click(screen.getByRole('button', { name: 'CRITICAL' }))
      // 3 critical findings exist in mock data
      expect(screen.getAllByText('CRITICAL').length).toBe(4) // button + 3 rows
    })

    it('expands a finding row to show remediation on click', async () => {
      render(<ScannerDemo {...defaultProps} step={2} />)
      // first finding auto-expanded; check remediation is visible
      expect(screen.getByText(/remove public acl/i)).toBeInTheDocument()
    })

    it('collapses expanded row when clicked again', async () => {
      render(<ScannerDemo {...defaultProps} step={2} />)
      const row = screen.getByText('S3 Bucket Publicly Accessible').closest('[class*="cursor-pointer"]') as HTMLElement
      await userEvent.click(row)
      expect(screen.queryByText(/remove public acl/i)).not.toBeInTheDocument()
    })
  })

  describe('Step 3: Compliance', () => {
    it('renders SOC2 score of 61%', () => {
      render(<ScannerDemo {...defaultProps} step={3} />)
      expect(screen.getByText('61%')).toBeInTheDocument()
    })

    it('renders ISO27001 score of 58%', () => {
      render(<ScannerDemo {...defaultProps} step={3} />)
      expect(screen.getByText('58%')).toBeInTheDocument()
    })

    it('renders Export Audit Package button', () => {
      render(<ScannerDemo {...defaultProps} step={3} />)
      expect(screen.getAllByText(/export audit package/i).length).toBeGreaterThanOrEqual(1)
    })
  })
})
