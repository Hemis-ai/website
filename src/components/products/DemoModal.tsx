'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductDemo } from '@/types/demo'
import { DemoStep } from './DemoStep'
import { StepNav } from './StepNav'

interface DemoModalProps {
  product: ProductDemo
  onClose: () => void
}

export function DemoModal({ product, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = product.steps.length
  const step = product.steps[currentStep]

  const handleNext = useCallback(() => {
    if (currentStep === totalSteps - 1) {
      onClose()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, totalSteps, onClose])

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} demo`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none"
      >
        <div
          className="w-full max-w-[820px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{product.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Interactive Product Demo</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 bg-slate-800 rounded-md px-2.5 py-1">
                {currentStep + 1} / {totalSteps}
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

          {/* Screenshot area with step transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <DemoStep
                step={step}
                stepIndex={currentStep}
                totalSteps={totalSteps}
                accentColor={product.accentColor}
                onBack={handleBack}
                onNext={handleNext}
              />
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
            <div className="min-w-0 flex-1 mr-4">
              <p className="text-sm font-semibold text-slate-200 truncate">{step.stepTitle}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{step.description}</p>
            </div>
            <StepNav
              currentStep={currentStep}
              totalSteps={totalSteps}
              accentColor={product.accentColor}
              onBack={handleBack}
              onNext={handleNext}
            />
          </div>
        </div>
      </motion.div>
    </>
  )
}
