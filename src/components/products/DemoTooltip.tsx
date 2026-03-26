'use client'
import { motion } from 'framer-motion'

interface DemoTooltipProps {
  stepLabel: string
  title: string
  description: string
  accentColor: string
  isFirst: boolean
  isLast: boolean
  onBack: () => void
  onNext: () => void
  position: 'top' | 'bottom' | 'left' | 'right'
}

const positionClasses: Record<DemoTooltipProps['position'], string> = {
  right: 'left-full ml-3 top-0',
  left: 'right-full mr-3 top-0',
  top: 'bottom-full mb-3 left-0',
  bottom: 'top-full mt-3 left-0',
}

export function DemoTooltip({ stepLabel, title, description, accentColor, isFirst, isLast, onBack, onNext, position }: DemoTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`absolute z-20 w-60 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl ${positionClasses[position]}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
        {stepLabel}
      </p>
      <h4 className="text-sm font-bold text-slate-100 mb-1.5">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{description}</p>
      <div className="flex items-center justify-end gap-2">
        {!isFirst && (
          <button onClick={onBack} aria-label="Back" className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
            ← Back
          </button>
        )}
        <button onClick={onNext} aria-label={isLast ? 'Finish' : 'Next'} className="px-2.5 py-1 text-xs font-semibold rounded-md text-white transition-colors" style={{ background: accentColor }}>
          {isLast ? 'Finish' : 'Next →'}
        </button>
      </div>
    </motion.div>
  )
}
