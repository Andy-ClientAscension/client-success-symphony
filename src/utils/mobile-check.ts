
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDashboardSettings } from '@/hooks/use-dashboard-settings';

interface MobileCheckOptions {
  showToast?: boolean;
  onMobile?: () => void;
  onDesktop?: () => void;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
}

export function useMobileCheck(options: MobileCheckOptions = {}) {
  const { isMobile, orientation } = useIsMobile();
  const { toast } = useToast();
  const { settings } = useDashboardSettings();
  const { showToast = true, onMobile, onDesktop, onOrientationChange } = options;

  // Handle device type changes
  useEffect(() => {
    if (isMobile !== undefined) {
      if (isMobile) {
        if (showToast && settings.showWelcomeMessage) {
          toast({
            title: "Mobile View Detected",
            description: "You're viewing the dashboard on a mobile device. Some features may be optimized for this screen size.",
            duration: 5000,
          });
        }
        onMobile?.();
      } else {
        onDesktop?.();
      }
    }
  }, [isMobile, showToast, toast, onMobile, onDesktop, settings.showWelcomeMessage]);

  // Handle orientation changes
  useEffect(() => {
    if (orientation && onOrientationChange) {
      onOrientationChange(orientation);
      
      if (isMobile && orientation === 'landscape' && settings.showWelcomeMessage) {
        toast({
          title: "Landscape Mode",
          description: "Landscape orientation detected. Some dashboard views may display better in this mode.",
          duration: 3000,
        });
      }
    }
  }, [orientation, onOrientationChange, isMobile, toast, settings.showWelcomeMessage]);

  return { isMobile, orientation };
}

export function getOptimizedView(
  isMobile: boolean | undefined, 
  desktopView: JSX.Element, 
  mobileView: JSX.Element,
  orientation?: 'portrait' | 'landscape'
) {
  if (isMobile === undefined) {
    // Still detecting, return desktop view as default
    return desktopView;
  }
  
  return isMobile ? mobileView : desktopView;
}

export function getResponsiveClassName(
  isMobile: boolean | undefined, 
  desktopClass: string, 
  mobileClass: string,
  portraitClass?: string,
  landscapeClass?: string,
  orientation?: 'portrait' | 'landscape'
) {
  if (isMobile === undefined) {
    return desktopClass;
  }
  
  // Base class based on device type
  let baseClass = isMobile ? mobileClass : desktopClass;
  
  // Add orientation-specific classes if provided and orientation is known
  if (isMobile && orientation && portraitClass && landscapeClass) {
    baseClass += ` ${orientation === 'portrait' ? portraitClass : landscapeClass}`;
  }
  
  return baseClass;
}

export function isTouchDevice() {
  return (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0)
  );
}
