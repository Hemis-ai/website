'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { demos } from '@/data/demos'
import type { ProductDemo } from '@/types/demo'
import { ProductCard } from './ProductCard'
import { DemoModal } from './DemoModal'

export function ProductCardGrid() {
  const [activeDemo, setActiveDemo] = useState<ProductDemo | null>(null)

  return (
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {demos.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDemo={() => setActiveDemo(product)}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeDemo && (
          <DemoModal
            product={activeDemo}
            onClose={() => setActiveDemo(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
