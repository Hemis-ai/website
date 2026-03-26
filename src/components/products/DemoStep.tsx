'use client'
import Image from 'next/image'
import type { DemoStepData } from '@/types/demo'
import { Hotspot } from './Hotspot'
import { DemoTooltip } from './DemoTooltip'

interface DemoStepProps {
  step: DemoStepData
  stepIndex: number
  totalSteps: number
  accentColor: string
  onBack: () => void
  onNext: () => void
}

export function DemoStep({ step, stepIndex, totalSteps, accentColor, onBack, onNext }: DemoStepProps) {
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  return (
    <div className="relative w-full h-[240px] md:h-[300px] lg:h-[380px] bg-slate-950 overflow-hidden">
      {/* Screenshot */}
      <Image
        src={step.image}
        alt={step.stepTitle}
        fill
        className="object-cover"
        unoptimized
      />

      {/* Hotspot */}
      <Hotspot
        x={step.hotspot.x}
        y={step.hotspot.y}
        width={step.hotspot.width}
        height={step.hotspot.height}
        accentColor={accentColor}
      />

      {/* Tooltip — positioned relative to hotspot */}
      <div
        className="absolute"
        style={{ left: step.hotspot.x, top: step.hotspot.y }}
      >
        <DemoTooltip
          stepLabel={`Step ${stepIndex + 1} of ${totalSteps}`}
          title={step.stepTitle}
          description={step.description}
          accentColor={accentColor}
          isFirst={isFirst}
          isLast={isLast}
          onBack={onBack}
          onNext={onNext}
          position={step.tooltipPosition}
        />
      </div>
    </div>
  )
}
