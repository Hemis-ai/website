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

  it('renders the Watch Demo button', () => {
    render(<ProductCard product={product} onOpenDemo={vi.fn()} />)
    expect(screen.getByRole('button', { name: /watch.*demo/i })).toBeInTheDocument()
  })

  it('calls onOpenDemo when Watch Demo is clicked', async () => {
    const onOpenDemo = vi.fn()
    render(<ProductCard product={product} onOpenDemo={onOpenDemo} />)
    await userEvent.click(screen.getByRole('button', { name: /watch.*demo/i }))
    expect(onOpenDemo).toHaveBeenCalledOnce()
  })
})
