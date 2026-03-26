import { describe, it, expect } from 'vitest'
import { demos } from '@/data/demos'
import type { ProductDemo } from '@/types/demo'

describe('demos data', () => {
  it('exports an array of 3 ProductDemo objects', () => {
    expect(demos).toHaveLength(3)
  })

  it('each product has required fields', () => {
    demos.forEach((demo: ProductDemo) => {
      expect(demo.id).toBeTruthy()
      expect(demo.name).toBeTruthy()
      expect(demo.accentColor).toMatch(/^#[0-9a-f]{6}$/i)
      expect(demo.steps.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('each step has required fields', () => {
    demos.forEach((demo: ProductDemo) => {
      demo.steps.forEach((step) => {
        expect(step.image).toBeTruthy()
        expect(step.stepTitle).toBeTruthy()
        expect(step.description).toBeTruthy()
        expect(['top', 'bottom', 'left', 'right']).toContain(step.tooltipPosition)
        expect(step.hotspot.x).toBeTypeOf('number')
        expect(step.hotspot.y).toBeTypeOf('number')
        expect(step.hotspot.width).toBeTypeOf('number')
        expect(step.hotspot.height).toBeTypeOf('number')
      })
    })
  })
})
