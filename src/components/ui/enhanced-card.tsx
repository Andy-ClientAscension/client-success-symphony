import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg text-card-foreground transition-all duration-250 ease-out",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-sm",
        minimal: "card-minimal",
        elevated: "card-elevated",
        interactive: "card-interactive",
        premium: "card-premium",
        metric: "card-metric",
        glass: "card-glass",
        success: "card-success",
        warning: "card-warning",
        info: "card-info",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      size: {
        sm: "max-w-sm",
        md: "max-w-md", 
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "w-full",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      size: "full",
    },
  }
)

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, padding, size, asChild = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, size, className }))}
        {...props}
      />
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "compact" | "spacious"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "flex flex-col space-y-1.5 p-6",
    compact: "flex flex-col space-y-1 p-4",
    spacious: "flex flex-col space-y-2 p-8"
  }
  
  return (
    <div
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    variant?: "default" | "large" | "small"
    gradient?: boolean
  }
>(({ className, variant = "default", gradient = false, ...props }, ref) => {
  const variants = {
    default: "text-lg font-semibold leading-none tracking-tight",
    large: "text-2xl font-bold leading-none tracking-tight",
    small: "text-base font-medium leading-none tracking-tight"
  }
  
  return (
    <h3
      ref={ref}
      className={cn(
        variants[variant],
        gradient && "bg-gradient-primary bg-clip-text text-transparent",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: "default" | "muted" | "emphasized"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "text-sm text-muted-foreground",
    muted: "text-xs text-muted-foreground opacity-75",
    emphasized: "text-sm text-foreground font-medium"
  }
  
  return (
    <p
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "compact" | "spacious"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "p-6 pt-0",
    compact: "p-4 pt-0", 
    spacious: "p-8 pt-0"
  }
  
  return (
    <div 
      ref={ref} 
      className={cn(variants[variant], className)} 
      {...props} 
    />
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "compact" | "spacious"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "flex items-center p-6 pt-0",
    compact: "flex items-center p-4 pt-0",
    spacious: "flex items-center p-8 pt-0"
  }
  
  return (
    <div
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { 
  EnhancedCard, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants
}