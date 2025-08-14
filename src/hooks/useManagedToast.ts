import { useToast } from "@/hooks/use-toast";
import { useCallback, useRef } from 'react';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationCategory = 'auth' | 'data' | 'system' | 'user_action' | 'error' | 'success';

interface NotificationConfig {
  priority: NotificationPriority;
  category: NotificationCategory;
  cooldown?: number; // milliseconds to wait before showing similar notifications
  maxPerMinute?: number;
  deduplicate?: boolean;
}

interface ManagedNotification {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  config: NotificationConfig;
}

// Track notification history for deduplication and rate limiting
const notificationHistory = new Map<string, { count: number; lastShown: number; cooldownUntil: number }>();

// Priority weights (higher = more important)
const PRIORITY_WEIGHTS: Record<NotificationPriority, number> = {
  low: 1,
  medium: 2, 
  high: 3,
  critical: 4
};

// Default configs for different categories - made more restrictive
const DEFAULT_CONFIGS: Record<NotificationCategory, Partial<NotificationConfig>> = {
  auth: { priority: 'medium', cooldown: 30000, maxPerMinute: 1, deduplicate: true }, // Very restrictive
  error: { priority: 'high', cooldown: 10000, maxPerMinute: 2, deduplicate: true }, // Keep errors but limit
  system: { priority: 'low', cooldown: 60000, maxPerMinute: 1, deduplicate: true }, // Very restrictive
  data: { priority: 'low', cooldown: 30000, maxPerMinute: 1, deduplicate: true }, // Very restrictive
  user_action: { priority: 'low', cooldown: 5000, maxPerMinute: 3, deduplicate: true }, // Limit user actions
  success: { priority: 'low', cooldown: 10000, maxPerMinute: 2, deduplicate: true } // Limit success
};

export function useManagedToast() {
  const { toast } = useToast();
  const queueRef = useRef<ManagedNotification[]>([]);
  const processingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return;
    
    processingRef.current = true;
    
    try {
      // Sort by priority (highest first)
      queueRef.current.sort((a, b) => 
        PRIORITY_WEIGHTS[b.config.priority] - PRIORITY_WEIGHTS[a.config.priority]
      );

      const notification = queueRef.current.shift();
      if (!notification) return;

      const { title, description, variant, config } = notification;
      const key = `${config.category}_${title}`;
      const now = Date.now();
      const history = notificationHistory.get(key);

      // Check cooldown
      if (history && now < history.cooldownUntil) {
        return;
      }

      // Check rate limiting
      if (history && config.maxPerMinute) {
        const oneMinuteAgo = now - 60000;
        if (history.lastShown > oneMinuteAgo && history.count >= config.maxPerMinute) {
          return;
        }
      }

      // Show the notification
      toast({
        title,
        description,
        variant: variant || (config.priority === 'critical' ? 'destructive' : 'default')
      });

      // Update history
      notificationHistory.set(key, {
        count: history && history.lastShown > now - 60000 ? history.count + 1 : 1,
        lastShown: now,
        cooldownUntil: now + (config.cooldown || 0)
      });

      // Process next notification after a brief delay
      if (queueRef.current.length > 0) {
        setTimeout(() => {
          processingRef.current = false;
          processQueue();
        }, 500);
      } else {
        processingRef.current = false;
      }
    } catch (error) {
      console.error('Error processing notification queue:', error);
      processingRef.current = false;
    }
  }, [toast]);

  const showNotification = useCallback((notification: ManagedNotification) => {
    const config = {
      ...DEFAULT_CONFIGS[notification.config.category],
      ...notification.config
    };

    const key = `${config.category}_${notification.title}`;
    const now = Date.now();
    const history = notificationHistory.get(key);

    // Skip if deduplication is enabled and we recently showed this
    if (config.deduplicate && history && (now - history.lastShown) < (config.cooldown || 0)) {
      return;
    }

    queueRef.current.push({
      ...notification,
      config: config as NotificationConfig
    });

    processQueue();
  }, [processQueue]);

  // Convenience methods for common notification types
  const showSuccess = useCallback((title: string, description?: string) => {
    showNotification({
      title,
      description,
      variant: 'default',
      config: { priority: 'low', category: 'success' }
    });
  }, [showNotification]);

  const showError = useCallback((title: string, description?: string) => {
    showNotification({
      title,
      description,
      variant: 'destructive', 
      config: { priority: 'high', category: 'error' }
    });
  }, [showNotification]);

  const showAuthNotification = useCallback((title: string, description?: string) => {
    showNotification({
      title,
      description,
      config: { priority: 'high', category: 'auth' }
    });
  }, [showNotification]);

  const showSystemNotification = useCallback((title: string, description?: string) => {
    showNotification({
      title,
      description,
      config: { priority: 'medium', category: 'system' }
    });
  }, [showNotification]);

  // Emergency method for critical notifications that bypass all rules
  const showCritical = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive'
    });
  }, [toast]);

  return {
    showNotification,
    showSuccess,
    showError,
    showAuthNotification,
    showSystemNotification,
    showCritical,
    // Legacy support - but with management
    toast: showNotification
  };
}