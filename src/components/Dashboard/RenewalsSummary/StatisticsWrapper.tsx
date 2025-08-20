
import React from "react";

interface StatisticsWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function StatisticsWrapper({ children, className = "" }: StatisticsWrapperProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
}
