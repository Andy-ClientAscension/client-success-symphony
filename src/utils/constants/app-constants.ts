/**
 * Application Constants
 * Centralized constants to reduce duplication and improve maintainability
 */

// Storage Keys
export const STORAGE_KEYS = {
  CLIENTS: 'clients',
  CLIENT_STATUS: 'client_status',
  CLIENT_COUNTS: 'client_counts',
  NPS_DATA: 'nps_data',
  CHURN_DATA: 'churn_data',
  DASHBOARD_CONFIG: 'dashboard-config',
  DISMISSED_ALERTS: 'dismissedHealthAlerts',
  PERFORMANCE_ALERT: 'hidePerformanceAlert',
  AUTOMATION_WEBHOOKS: 'automationWebhooks',
  VALID_INVITE_CODES: 'validInviteCodes',
  OFFLINE_DATA: 'offline_dashboard_data',
  PENDING_CHANGES: 'pending_changes',
  ERROR_LOGS: 'error_logs',
  AUTH_REDIRECT_NOTIFIED: 'auth_redirect_notified',
} as const;

// Data Query Keys
export const DATA_KEYS = {
  CLIENTS: ['clients'],
  CLIENT_COUNTS: ['client_counts'],
  NPS_DATA: ['nps_data'],
  CHURN_DATA: ['churn_data'],
  ANALYTICS: ['analytics'],
  METRICS: ['metrics'],
} as const;

// Client Status Options
export const CLIENT_STATUS = {
  LEAD: 'Lead',
  PROSPECT: 'Prospect',
  INITIAL_CALL: 'Initial Call',
  FOLLOW_UP: 'Follow Up',
  PROPOSAL_SENT: 'Proposal Sent',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
  NURTURE: 'Nurture',
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  SESSION_REFRESH_DEBOUNCE: 1000,
  INITIAL_BACKOFF: 1000,
  MAX_BACKOFF: 10000,
  AUTH_TIMEOUT: 30000,
  PERFORMANCE_CHECK_INTERVAL: 5000,
  VALIDATION_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred',
  NETWORK: 'Network connection issue. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  VALIDATION_FAILED: 'Validation failed. Please check your input.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  CREATED: 'Created successfully',
  AUTH_SUCCESS: 'Authentication successful',
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
} as const;

// Feature Flags
export const FEATURES = {
  AI_INSIGHTS: true,
  AUTOMATION: true,
  ANALYTICS: true,
  OFFLINE_MODE: true,
} as const;