import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Hotspot } from '@/components/products/Hotspot'

describe('Hotspot', () => {
  const props = { x: 100, y: 80, width: 120, height: 32, accentColor: '#6366f1' }

  it('renders at the correct position', () => {
    const { container } = render(<Hotspot {...props} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.left).toBe('100px')
    expect(el.style.top).toBe('80px')
    expect(el.style.width).toBe('120px')
    expect(el.style.height).toBe('32px')
  })

  it('renders two child layers (glow + ring)', () => {
    const { container } = render(<Hotspot {...props} />)
    expect(container.firstChild?.childNodes).toHaveLength(2)
  })
})
