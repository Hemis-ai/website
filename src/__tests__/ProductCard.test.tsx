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

  it('renders the View Full Features button', () => {
    render(<ProductCard product={product} onOpenDemo={vi.fn()} />)
    expect(screen.getByRole('button', { name: /view full features/i })).toBeInTheDocument()
  })

  it('calls onOpenDemo when View Full Features is clicked', async () => {
    const onOpenDemo = vi.fn()
    render(<ProductCard product={product} onOpenDemo={onOpenDemo} />)
    await userEvent.click(screen.getByRole('button', { name: /view full features/i }))
    expect(onOpenDemo).toHaveBeenCalledOnce()
  })
})
