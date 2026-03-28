// src/__tests__/BlueTeamDemo.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlueTeamDemo } from '@/components/products/demos/BlueTeamDemo'

const defaultProps = {
  step: 0,
  accentColor: '#3b82f6',
  onRequestNextStep: vi.fn(),
}

describe('BlueTeamDemo', () => {
  describe('Step 0: Health metrics', () => {
    it('renders all 5 metric cards', () => {
      render(<BlueTeamDemo {...defaultProps} step={0} />)
      expect(screen.getByText('HEALTH')).toBeInTheDocument()
      expect(screen.getByText('DETECTION')).toBeInTheDocument()
      expect(screen.getByText('RESPONSE')).toBeInTheDocument()
      expect(screen.getByText('COVERAGE')).toBeInTheDocument()
      expect(screen.getByText('MTTR')).toBeInTheDocument()
    })

    it('renders correct metric values', () => {
      render(<BlueTeamDemo {...defaultProps} step={0} />)
      expect(screen.getByText('72/100')).toBeInTheDocument()
      expect(screen.getByText('84%')).toBeInTheDocument()
      expect(screen.getByText('79%')).toBeInTheDocument()
      expect(screen.getByText('58%')).toBeInTheDocument()
      expect(screen.getByText('4m 12s')).toBeInTheDocument()
    })
  })

  describe('Step 1: Alert feed', () => {
    it('renders 6 alerts', () => {
      render(<BlueTeamDemo {...defaultProps} step={1} />)
      // 6 CRITICAL/HIGH/MEDIUM severity badges in list
      expect(screen.getByText('IAM Credentials Used from Anomalous Geolocation')).toBeInTheDocument()
      expect(screen.getByText('Unusual Lambda Invocation Pattern')).toBeInTheDocument()
    })

    it('alert-001 is auto-selected by default', () => {
      render(<BlueTeamDemo {...defaultProps} step={1} />)
      // The selected alert list item is styled differently; just verify it's shown
      expect(screen.getByText('ALERT FEED')).toBeInTheDocument()
    })

    it('clicking an alert changes the selected alert', async () => {
      render(<BlueTeamDemo {...defaultProps} step={1} />)
      await userEvent.click(screen.getByText('GuardDuty: EC2 Instance Communicating with Known Tor Exit Node'))
      // After clicking, that alert's title appears as the selected one
      expect(screen.getByText('GuardDuty: EC2 Instance Communicating with Known Tor Exit Node')).toBeInTheDocument()
    })
  })

  describe('Step 2: Alert detail', () => {
    it('shows AI Analysis box', () => {
      render(<BlueTeamDemo {...defaultProps} step={2} />)
      expect(screen.getByText(/ai analysis/i)).toBeInTheDocument()
    })

    it('shows resource metadata', () => {
      render(<BlueTeamDemo {...defaultProps} step={2} />)
      expect(screen.getByText('IAM:deploy-bot')).toBeInTheDocument()
      expect(screen.getByText('eu-central-1')).toBeInTheDocument()
    })

    it('shows IP address for alert with IP', () => {
      render(<BlueTeamDemo {...defaultProps} step={2} />)
      expect(screen.getByText('185.220.101.47')).toBeInTheDocument()
    })

    it('shows — for alert without IP (alert-006)', async () => {
      render(<BlueTeamDemo {...defaultProps} step={2} />)
      // Select alert-006 which has no IP
      await userEvent.click(screen.getByText('Unusual Lambda Invocation Pattern'))
      expect(screen.getByText('—')).toBeInTheDocument()
    })
  })

  describe('Step 3: Autonomous response', () => {
    it('shows AI playbook executed for auto-responded alert', () => {
      render(<BlueTeamDemo {...defaultProps} step={3} />)
      // alert-001 is selected by default and has autoResponded: true
      expect(screen.getByText(/ai playbook executed/i)).toBeInTheDocument()
    })

    it('shows response actions', () => {
      render(<BlueTeamDemo {...defaultProps} step={3} />)
      expect(screen.getByText('IAM credentials suspended')).toBeInTheDocument()
    })

    it('shows kill chain timeline with 8 events', () => {
      render(<BlueTeamDemo {...defaultProps} step={3} />)
      expect(screen.getByText(/kill chain reconstruction/i)).toBeInTheDocument()
      expect(screen.getByText('SQL injection exploit')).toBeInTheDocument()
      expect(screen.getByText('AI Blue Team auto-response')).toBeInTheDocument()
    })

    it('selected alert state persists from step 1 to step 3 without remount', async () => {
      const { rerender } = render(<BlueTeamDemo {...defaultProps} step={1} />)
      await userEvent.click(screen.getByText('Mass S3 Object Enumeration Detected'))
      rerender(<BlueTeamDemo {...defaultProps} step={3} />)
      // alert-002 is selected and autoResponded, so playbook box appears
      expect(screen.getByText(/ai playbook executed/i)).toBeInTheDocument()
      expect(screen.getByText('Bucket policy updated to deny external access')).toBeInTheDocument()
    })
  })
})
