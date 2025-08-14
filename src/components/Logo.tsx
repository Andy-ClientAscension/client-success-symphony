
import React from "react";
import { Pyramid } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/lovable-uploads/cf7a4783-02dc-4cc6-af97-6ec896a0ea67.png" 
        alt="Client Ascension Logo"
        className="h-10 w-auto"
      />
      {!showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none text-foreground">CLIENT</span>
          <span className="text-lg font-bold text-primary leading-none">ASCENSION</span>
        </div>
      )}
    </div>
  );
}
