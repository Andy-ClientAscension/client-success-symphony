
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AvatarSkeletonProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function AvatarSkeleton({ 
  size = "md", 
  showLabel = true,
  className = ""
}: AvatarSkeletonProps) {
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarFallback>
          <Skeleton className="h-full w-full rounded-full" />
        </AvatarFallback>
      </Avatar>
      
      {showLabel && (
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-24" />
          {size === "lg" && <Skeleton className="h-2.5 w-16" />}
        </div>
      )}
    </div>
  );
}
