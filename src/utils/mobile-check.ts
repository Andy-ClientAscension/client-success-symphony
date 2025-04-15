
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDashboardSettings } from '@/hooks/use-dashboard-settings';

interface MobileCheckOptions {
  showToast?: boolean;
  onMobile?: () => void;
  onDesktop?: () => void;
}

export function useMobileCheck(options: MobileCheckOptions = {}) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { settings } = useDashboardSettings();
  const { showToast = true, onMobile, onDesktop } = options;

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

  return { isMobile };
}

export function getOptimizedView(isMobile: boolean | undefined, desktopView: JSX.Element, mobileView: JSX.Element) {
  if (isMobile === undefined) {
    // Still detecting, you could return a loading state
    return desktopView;
  }
  
  return isMobile ? mobileView : desktopView;
}

export function getResponsiveClassName(isMobile: boolean | undefined, desktopClass: string, mobileClass: string) {
  if (isMobile === undefined) {
    return desktopClass;
  }
  
  return isMobile ? mobileClass : desktopClass;
}

export function isTouchDevice() {
  return (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0)
  );
}
