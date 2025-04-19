
import * as React from "react"
import { cn } from "@/lib/utils"
import { focusRingClasses } from "@/lib/accessibility"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
    const hasError = props["aria-invalid"] === true;
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          "text-base ring-offset-background file:border-0 file:bg-transparent",
          "file:text-sm file:font-medium placeholder:text-gray-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          focusRingClasses,
          hasError && "border-red-500",
          className
        )}
        ref={ref}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
