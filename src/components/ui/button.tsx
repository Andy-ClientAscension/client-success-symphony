import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { focusRingClasses } from "@/lib/accessibility"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary text-primary-foreground",
          "hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5", 
          "active:translate-y-0 active:scale-[0.98]",
          "duration-200 ease-out",
          focusRingClasses
        ),
        destructive: cn(
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive-hover hover:shadow-md hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
          "duration-200 ease-out",
          focusRingClasses
        ),
        outline: cn(
          "border border-border bg-background text-foreground",
          "hover:bg-accent hover:text-accent-foreground hover:border-border-hover",
          "active:scale-[0.98]",
          "duration-200 ease-out",
          focusRingClasses
        ),
        secondary: cn(
          "bg-secondary text-secondary-foreground", 
          "hover:bg-secondary-hover hover:shadow-sm",
          "active:scale-[0.98]",
          "duration-200 ease-out",
          focusRingClasses
        ),
        ghost: cn(
          "text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "duration-150 ease-out",
          focusRingClasses
        ),
        link: cn(
          "text-primary underline-offset-4",
          "hover:underline hover:text-primary-hover",
          "active:text-primary-active",
          "duration-200 ease-out"
        ),
        gradient: cn(
          "bg-gradient-primary text-primary-foreground",
          "hover:shadow-colored hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.98]",
          "duration-300 ease-spring",
          "before:absolute before:inset-0 before:bg-gradient-primary before:opacity-0 before:transition-opacity before:duration-200",
          "hover:before:opacity-20",
          focusRingClasses
        ),
        success: cn(
          "bg-success text-success-foreground",
          "hover:bg-success-hover hover:shadow-md hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
          "duration-200 ease-out",
          focusRingClasses
        ),
        warning: cn(
          "bg-warning text-warning-foreground",
          "hover:bg-warning-hover hover:shadow-md hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
          "duration-200 ease-out",
          focusRingClasses
        ),
        elevated: cn(
          "bg-card text-card-foreground shadow-sm border border-border",
          "hover:shadow-md hover:border-border-hover hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.98]",
          "duration-200 ease-out",
          focusRingClasses
        )
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-base rounded-lg",
        xl: "h-14 px-10 text-lg rounded-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
