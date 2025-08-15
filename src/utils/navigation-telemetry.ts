/**
 * Lightweight navigation telemetry for validation purposes
 * TODO: Remove after navigation validation is complete
 */

interface NavClickEvent {
  type: 'NAV_CLICK';
  route: string;
  timestamp: number;
  clickId: string;
}

interface NavCompleteEvent {
  type: 'NAV_COMPLETE';
  route: string;
  timestamp: number;
  clickId: string;
  duration: number;
}

class NavigationTelemetry {
  private pendingClicks = new Map<string, NavClickEvent>();

  logNavClick(route: string): string {
    const clickId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const event: NavClickEvent = {
      type: 'NAV_CLICK',
      route,
      timestamp: Date.now(),
      clickId
    };

    this.pendingClicks.set(clickId, event);

    // Console logging for immediate visibility
    console.log(`🚀 NAV_CLICK: ${route} [${clickId}]`, {
      timestamp: new Date(event.timestamp).toISOString(),
      pendingClicks: this.pendingClicks.size
    });

    // Auto-cleanup if completion not logged within 10 seconds
    setTimeout(() => {
      if (this.pendingClicks.has(clickId)) {
        console.warn(`⚠️  NAV_TIMEOUT: ${route} [${clickId}] - completion not logged`);
        this.pendingClicks.delete(clickId);
      }
    }, 10000);

    return clickId;
  }

  logNavComplete(route: string, clickId: string) {
    const clickEvent = this.pendingClicks.get(clickId);
    
    if (!clickEvent) {
      console.warn(`⚠️  NAV_COMPLETE without matching click: ${route} [${clickId}]`);
      return;
    }

    const duration = Date.now() - clickEvent.timestamp;
    const event: NavCompleteEvent = {
      type: 'NAV_COMPLETE',
      route,
      timestamp: Date.now(),
      clickId,
      duration
    };

    // Console logging for immediate visibility
    console.log(`✅ NAV_COMPLETE: ${route} [${clickId}]`, {
      duration: `${duration}ms`,
      timestamp: new Date(event.timestamp).toISOString(),
      remainingPending: this.pendingClicks.size - 1
    });

    this.pendingClicks.delete(clickId);
  }

  // Get stats for debugging
  getStats() {
    return {
      pendingClicks: this.pendingClicks.size,
      pendingRoutes: Array.from(this.pendingClicks.values()).map(c => c.route)
    };
  }
}

export const navTelemetry = new NavigationTelemetry();