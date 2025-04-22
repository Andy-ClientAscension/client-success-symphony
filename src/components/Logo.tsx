
import React from "react";
import { Pyramid } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Pyramid className="h-8 w-8 text-primary" />
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none">CLIENT</span>
          <span className="text-lg font-bold text-primary leading-none">ASCENSION</span>
        </div>
      )}
    </div>
  );
}
