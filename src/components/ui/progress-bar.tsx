
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "react-router-dom";

interface NavigationProgressBarProps {
  /** Position of the progress bar */
  position?: "top" | "bottom";
  /** Z-index value for the progress bar */
  zIndex?: number;
  /** Color variant */
  variant?: "default" | "brand" | "success";
  /** Height of the progress bar in pixels */
  height?: number;
}

export function NavigationProgressBar({
  position = "top",
  zIndex = 50,
  variant = "default",
  height = 3,
}: NavigationProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  
  // Color variants
  const variantClasses = {
    default: "bg-primary",
    brand: "bg-gradient-to-r from-blue-500 to-purple-500",
    success: "bg-green-500"
  };

  useEffect(() => {
    // Reset and start progress on navigation
    setIsVisible(true);
    setProgress(0);
    
    // Fast initial progress to 30%
    const timer1 = setTimeout(() => setProgress(30), 100);
    
    // More gradual progress to 70%
    const timer2 = setTimeout(() => setProgress(70), 300);

    // Slow progress to 90% (never reaches 100% until load completes)
    const timer3 = setTimeout(() => setProgress(90), 1000);

    // Finish and hide progress bar
    const timer4 = setTimeout(() => {
      setProgress(100);
      
      // Hide after transition
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(hideTimer);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [location]);

  return (
    <div 
      className={`fixed ${position}-0 left-0 right-0 pointer-events-none transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ zIndex }}
      role="progressbar"
      aria-hidden={!isVisible}
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <Progress 
        value={progress} 
        className={`h-[${height}px] rounded-none ${variantClasses[variant]}`} 
      />
    </div>
  );
}
