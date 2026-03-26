'use client'
import type { ProductDemo } from '@/types/demo'

const PRODUCT_META: Record<string, { label: string; icon: string; description: string; tags: string[] }> = {
  scanner: {
    label: 'Cloud Security',
    icon: '☁️',
    description: 'Automated detection and one-click remediation of AWS misconfigurations with SOC 2 and ISO 27001 compliance mapping.',
    tags: ['AWS', 'SOC 2', 'ISO 27001', 'Auto-remediation'],
  },
  hemis: {
    label: 'Red Team Engine',
    icon: '⚔️',
    description: 'AI/LLM-powered red team simulation engine. Attacks your own systems using natural language-driven adversarial techniques based on MITRE ATT&CK.',
    tags: ['MITRE ATT&CK', 'LLM-driven', '40+ techniques'],
  },
  blueteam: {
    label: 'Threat Response',
    icon: '🛡️',
    description: 'Real-time AI threat detection and autonomous response engine. Monitors, correlates, and neutralizes active threats — 70% faster than manual SOC workflows.',
    tags: ['Real-time', 'Autonomous', '70% faster MTTR'],
  },
}

interface ProductCardProps {
  product: ProductDemo
  onOpenDemo: () => void
}

export function ProductCard({ product, onOpenDemo }: ProductCardProps) {
  const meta = PRODUCT_META[product.id]

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-7 flex flex-col gap-4 overflow-hidden">
      {/* Colored top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${product.accentColor}, ${product.accentColor}88)` }}
      />

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${product.accentColor}22` }}
      >
        {meta.icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: product.accentColor }}>
        {meta.label}
      </p>

      <h3 className="text-lg font-bold text-slate-100 leading-snug">{product.name}</h3>

      <p className="text-sm text-slate-400 leading-relaxed flex-1">{meta.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {meta.tags.map((tag) => (
          <span key={tag} className="bg-slate-800 rounded-md px-2.5 py-1 text-[11px] text-slate-500">
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={onOpenDemo}
        aria-label={`Watch ${product.name} demo`}
        className="flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold border transition-colors"
        style={{
          color: product.accentColor,
          borderColor: `${product.accentColor}44`,
          background: `${product.accentColor}18`,
        }}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white"
          style={{ background: product.accentColor }}
        >
          ▶
        </span>
        Watch Product Demo
      </button>
    </div>
  )
}
