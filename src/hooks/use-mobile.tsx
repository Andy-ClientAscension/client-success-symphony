
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape' | undefined>(undefined)

  React.useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setIsMobile(width < MOBILE_BREAKPOINT)
      setOrientation(height > width ? 'portrait' : 'landscape')
    }

    // Initial check
    updateDimensions()
    
    // Set up listeners for both resize and orientation change
    window.addEventListener("resize", updateDimensions)
    window.addEventListener("orientationchange", updateDimensions)
    
    // Media query listener for better performance
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    
    mql.addEventListener("change", onChange)
    
    return () => {
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("orientationchange", updateDimensions)
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return { isMobile, orientation }
}
