'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScannerDemo } from './demos/ScannerDemo'
import { HemisDemo } from './demos/HemisDemo'
import { BlueTeamDemo } from './demos/BlueTeamDemo'

interface InteractiveDemoProps {
  productId: 'scanner' | 'hemis' | 'blueteam'
  productName: string
  accentColor: string
  onClose: () => void
}

const TOTAL_STEPS = 4

export function InteractiveDemoModal({ productId, productName, accentColor, onClose }: InteractiveDemoProps) {
  const [step, setStep] = useState(0)

  const handleNext = useCallback(() => {
    if (step === TOTAL_STEPS - 1) onClose()
    else setStep(s => s + 1)
  }, [step, onClose])

  const handleBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      const tag = (document.activeElement?.tagName ?? '').toLowerCase()
      if (['input', 'textarea', 'button', 'select'].includes(tag)) return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handleBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, handleNext, handleBack])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const DemoComponent = productId === 'scanner'
    ? ScannerDemo
    : productId === 'hemis'
    ? HemisDemo
    : BlueTeamDemo

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${productName} interactive demo`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none"
      >
        <div
          className="w-full max-w-[1100px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{productName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Interactive Product Demo</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs text-slate-500 bg-slate-800 rounded-md px-2.5 py-1"
                aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
              >
                Step {step + 1} of {TOTAL_STEPS}
              </span>
              <button
                onClick={onClose}
                aria-label="Close demo"
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Demo body */}
          <div className="overflow-auto max-h-[65vh]">
            <DemoComponent
              step={step}
              accentColor={accentColor}
              onRequestNextStep={handleNext}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
            <button
              onClick={handleBack}
              disabled={step === 0}
              aria-label="Back"
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              aria-label={step === TOTAL_STEPS - 1 ? 'Finish' : 'Next'}
              className="px-3 py-1.5 text-xs font-semibold rounded-md text-white transition-colors"
              style={{ background: accentColor }}
            >
              {step === TOTAL_STEPS - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
