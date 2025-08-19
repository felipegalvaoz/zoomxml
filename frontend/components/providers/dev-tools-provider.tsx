"use client"

import { useEffect } from 'react'

export function DevToolsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only suppress console warnings, don't interfere with React DevTools hook
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const originalWarn = console.warn

      console.warn = (...args) => {
        const message = args.join(' ').toLowerCase()
        // Only filter React DevTools specific messages
        if (
          message.includes('download the react devtools') ||
          message.includes('better development experience') ||
          message.includes('react.dev/link/react-devtools')
        ) {
          return // Suppress this specific warning
        }
        originalWarn.apply(console, args)
      }

      // Cleanup on unmount
      return () => {
        console.warn = originalWarn
      }
    }
  }, [])

  return <>{children}</>
}
