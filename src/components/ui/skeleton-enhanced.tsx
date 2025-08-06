import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circle' | 'rounded';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function Skeleton({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: SkeletonProps) {
  const variants = {
    default: "animate-pulse bg-muted",
    card: "animate-pulse bg-muted rounded-lg",
    text: "animate-pulse bg-muted rounded-sm",
    circle: "animate-pulse bg-muted rounded-full",
    rounded: "animate-pulse bg-muted rounded-md"
  };

  const sizes = {
    sm: "h-4",
    md: "h-6", 
    lg: "h-8",
    xl: "h-12"
  };

  return (
    <div
      className={cn(
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

// Specialized skeleton components for common patterns
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3 p-6 rounded-lg border bg-card", className)} {...props}>
      <Skeleton className="h-5 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, className, ...props }: { rows?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 items-center">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  )
}

function SkeletonChart({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-md" />
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonChart }