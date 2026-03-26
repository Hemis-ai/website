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
