
import React from "react";

interface StatisticsWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function StatisticsWrapper({ children, className = "" }: StatisticsWrapperProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
}
