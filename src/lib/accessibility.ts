
export const reducedMotionConfig = {
  enableAnimation: () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  duration: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '0s' : '0.2s'
};

export const focusRingClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary";

export const contrastColors = {
  muted: {
    light: "text-gray-700", // Increased from text-gray-500 for better contrast
    dark: "dark:text-gray-300" // Increased from dark:text-gray-400
  },
  primary: {
    light: "text-gray-900",
    dark: "dark:text-gray-50"
  }
};
