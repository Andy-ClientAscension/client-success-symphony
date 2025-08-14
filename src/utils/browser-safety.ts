// Browser safety utilities for window object access and memory leak prevention

export const isBrowser = () => typeof window !== 'undefined';

export const safeWindow = {
  addEventListener: (event: string, handler: EventListener, options?: AddEventListenerOptions) => {
    if (isBrowser()) {
      window.addEventListener(event, handler, options);
    }
  },
  
  removeEventListener: (event: string, handler: EventListener, options?: EventListenerOptions) => {
    if (isBrowser()) {
      window.removeEventListener(event, handler, options);
    }
  },
  
  dispatchEvent: (event: Event) => {
    if (isBrowser()) {
      return window.dispatchEvent(event);
    }
    return false;
  },
  
  setInterval: (handler: Function, timeout?: number): number | null => {
    if (isBrowser()) {
      return window.setInterval(handler, timeout);
    }
    return null;
  },
  
  setTimeout: (handler: Function, timeout?: number): number | null => {
    if (isBrowser()) {
      return window.setTimeout(handler, timeout);
    }
    return null;
  },
  
  clearInterval: (id: number | null) => {
    if (isBrowser() && id !== null) {
      window.clearInterval(id);
    }
  },
  
  clearTimeout: (id: number | null) => {
    if (isBrowser() && id !== null) {
      window.clearTimeout(id);
    }
  },
  
  location: {
    get href() {
      return isBrowser() ? window.location.href : '';
    },
    get pathname() {
      return isBrowser() ? window.location.pathname : '';
    },
    get origin() {
      return isBrowser() ? window.location.origin : '';
    },
    set hash(value: string) {
      if (isBrowser()) {
        window.location.hash = value;
      }
    },
    set href(value: string) {
      if (isBrowser()) {
        window.location.href = value;
      }
    },
    reload: () => {
      if (isBrowser()) {
        window.location.reload();
      }
    }
  },
  
  get innerHeight() {
    return isBrowser() ? window.innerHeight : 0;
  },
  
  get innerWidth() {
    return isBrowser() ? window.innerWidth : 0;
  },
  
  open: (url: string, target?: string) => {
    if (isBrowser()) {
      return window.open(url, target);
    }
    return null;
  }
};

// Memory leak prevention utility
export class EventManager {
  private listeners: Array<{ element: EventTarget; event: string; handler: EventListener; options?: AddEventListenerOptions }> = [];
  private timers: Array<number> = [];

  addEventListener(element: EventTarget, event: string, handler: EventListener, options?: AddEventListenerOptions) {
    if (isBrowser()) {
      element.addEventListener(event, handler, options);
      this.listeners.push({ element, event, handler, options });
    }
  }

  setInterval(handler: Function, timeout?: number): number | null {
    const id = safeWindow.setInterval(handler, timeout);
    if (id) {
      this.timers.push(id);
    }
    return id;
  }

  setTimeout(handler: Function, timeout?: number): number | null {
    const id = safeWindow.setTimeout(handler, timeout);
    if (id) {
      this.timers.push(id);
    }
    return id;
  }

  cleanup() {
    // Remove all event listeners
    this.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.listeners = [];

    // Clear all timers
    this.timers.forEach(id => {
      safeWindow.clearTimeout(id);
      safeWindow.clearInterval(id);
    });
    this.timers = [];
  }
}

// Hook for safe event management
export function useSafeEventManager() {
  if (!isBrowser()) {
    return {
      addEventListener: () => {},
      setInterval: () => null,
      setTimeout: () => null,
      cleanup: () => {}
    };
  }

  const manager = new EventManager();
  
  return {
    addEventListener: manager.addEventListener.bind(manager),
    setInterval: manager.setInterval.bind(manager),
    setTimeout: manager.setTimeout.bind(manager),
    cleanup: manager.cleanup.bind(manager)
  };
}