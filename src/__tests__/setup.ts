import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        const Component = React.forwardRef(
          ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { [key: string]: unknown }, ref: React.Ref<HTMLElement>) => {
            const filtered = Object.fromEntries(
              Object.entries(props).filter(
                ([k]) =>
                  !['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'layout', 'layoutId'].includes(k)
              )
            )
            return React.createElement(prop as string, { ...filtered, ref }, children)
          }
        )
        Component.displayName = `motion.${prop}`
        return Component
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useMotionValue: (initial: unknown) => ({ get: () => initial, set: vi.fn() }),
  useTransform: () => ({ get: vi.fn() }),
}))
