import { ProductsHero } from '@/components/products/ProductsHero'
import { ProductCardGrid } from '@/components/products/ProductCardGrid'

export const metadata = {
  title: 'Products — HemisX',
  description: 'AI-native cybersecurity platform for SMBs. Cloud scanner, red team engine, and autonomous threat response.',
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <ProductsHero />
      <ProductCardGrid />
    </main>
  )
}
