import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dashboardLayoutVariants = cva(
  "min-h-screen w-full transition-all duration-300",
  {
    variants: {
      density: {
        compact: "space-y-4 p-4",
        comfortable: "space-y-6 p-6", 
        spacious: "space-y-8 p-8",
      },
      variant: {
        default: "bg-background",
        glass: "bg-gradient-surface",
        minimal: "bg-surface",
      }
    },
    defaultVariants: {
      density: "comfortable",
      variant: "default",
    },
  }
)

const dashboardSectionVariants = cva(
  "w-full transition-all duration-300",
  {
    variants: {
      spacing: {
        none: "space-y-0",
        sm: "space-y-2",
        md: "space-y-4",
        lg: "space-y-6",
        xl: "space-y-8",
      },
      layout: {
        stack: "flex flex-col",
        grid: "dashboard-grid",
        masonry: "dashboard-grid-masonry",
        dense: "dashboard-grid-dense",
      }
    },
    defaultVariants: {
      spacing: "md",
      layout: "stack",
    },
  }
)

export interface DashboardLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dashboardLayoutVariants> {}

export interface DashboardSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dashboardSectionVariants> {}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ className, density, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(dashboardLayoutVariants({ density, variant, className }))}
        {...props}
      />
    )
  }
)
DashboardLayout.displayName = "DashboardLayout"

const DashboardSection = React.forwardRef<HTMLDivElement, DashboardSectionProps>(
  ({ className, spacing, layout, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(dashboardSectionVariants({ spacing, layout, className }))}
        {...props}
      />
    )
  }
)
DashboardSection.displayName = "DashboardSection"

const DashboardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "sticky" | "floating"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6",
    sticky: "sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 mb-6",
    floating: "relative bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  }
  
  return (
    <header
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  )
})
DashboardHeader.displayName = "DashboardHeader"

const DashboardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    variant?: "default" | "large" | "gradient"
    subtitle?: string
  }
>(({ className, variant = "default", subtitle, children, ...props }, ref) => {
  const variants = {
    default: "text-2xl font-bold text-foreground",
    large: "text-3xl font-bold text-foreground",
    gradient: "text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent"
  }
  
  return (
    <div className="space-y-1">
      <h1
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  )
})
DashboardTitle.displayName = "DashboardTitle"

const MetricsGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "compact" | "large"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "metrics-grid",
    compact: "metrics-grid-compact", 
    large: "chart-grid"
  }
  
  return (
    <div
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  )
})
MetricsGrid.displayName = "MetricsGrid"

export { 
  DashboardLayout, 
  DashboardSection, 
  DashboardHeader,
  DashboardTitle,
  MetricsGrid,
  dashboardLayoutVariants,
  dashboardSectionVariants
}