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
