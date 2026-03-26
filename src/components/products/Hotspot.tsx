'use client'
import { motion } from 'framer-motion'

interface HotspotProps {
  x: number
  y: number
  width: number
  height: number
  accentColor: string
}

export function Hotspot({ x, y, width, height, accentColor }: HotspotProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, width, height }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-[-4px] rounded-md"
        style={{ border: `2px solid ${accentColor}`, opacity: 0.2 }}
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute inset-0 rounded"
        style={{ border: `2px solid ${accentColor}` }}
        animate={{
          boxShadow: [
            `0 0 0 0 ${accentColor}99`,
            `0 0 0 8px ${accentColor}00`,
            `0 0 0 0 ${accentColor}99`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
