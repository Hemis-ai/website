'use client'

interface StepNavProps {
  currentStep: number
  totalSteps: number
  accentColor: string
  onBack: () => void
  onNext: () => void
}

export function StepNav({ currentStep, totalSteps, accentColor, onBack, onNext }: StepNavProps) {
  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            data-testid="progress-dot"
            data-active={i === currentStep ? 'true' : 'false'}
            className="w-1.5 h-1.5 rounded-full border transition-colors duration-200"
            style={
              i === currentStep
                ? { background: accentColor, borderColor: accentColor }
                : { background: 'transparent', borderColor: '#334155' }
            }
          />
        ))}
      </div>

      <button
        onClick={onBack}
        disabled={isFirst}
        aria-label="Back"
        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Back
      </button>

      <button
        onClick={onNext}
        aria-label={isLast ? 'Finish' : 'Next'}
        className="px-3 py-1.5 text-xs font-semibold rounded-md text-white transition-colors"
        style={{ background: accentColor }}
      >
        {isLast ? 'Finish' : 'Next →'}
      </button>
    </div>
  )
}
