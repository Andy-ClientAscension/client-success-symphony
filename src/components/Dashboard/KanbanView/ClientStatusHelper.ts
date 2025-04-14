
import { Client } from "@/lib/data";

export type StatusGroup = 'new' | 'active' | 'backend' | 'olympia' | 'at-risk' | 'churned' | 'paused' | 'graduated';

const VALID_STATUSES: StatusGroup[] = ['new', 'active', 'backend', 'olympia', 'at-risk', 'churned', 'paused', 'graduated'];

/**
 * Check if a status is valid
 */
export const isValidStatus = (status: string): boolean => {
  return VALID_STATUSES.includes(status as StatusGroup);
};

/**
 * Get a display label for a status
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'new':
      return 'New Students';
    case 'active':
      return 'Active Students';
    case 'backend':
      return 'Backend Students';
    case 'olympia':
      return 'Olympia Students';
    case 'at-risk':
      return 'At Risk Students';
    case 'churned':
      return 'Churned Students';
    case 'paused':
      return 'Paused Students';
    case 'graduated':
      return 'Graduated Students';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Get a color class for a status badge
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'backend':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'olympia':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'at-risk':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'churned':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'graduated':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
};

/**
 * Convert client status to kanban column with validation
 */
export const clientStatusToKanbanColumn = (status: Client['status']): StatusGroup => {
  if (!status || !isValidStatus(status)) {
    return 'active'; // Default fallback
  }
  
  switch (status) {
    case 'new':
      return 'new';
    case 'active':
      return 'active';
    case 'at-risk':
      return 'at-risk';
    case 'churned':
      return 'churned';
    case 'backend':
      return 'backend';
    case 'olympia':
      return 'olympia';
    case 'paused':
      return 'paused';
    case 'graduated':
      return 'graduated';
    default:
      return 'active'; // Default to active for any unrecognized status
  }
};

/**
 * Get default column order for kanban board
 */
export const getDefaultColumnOrder = (): StatusGroup[] => {
  return ['new', 'active', 'at-risk', 'backend', 'olympia', 'graduated', 'churned', 'paused'];
};

/**
 * Normalize client status from imported data
 */
export const normalizeClientStatus = (status: string): StatusGroup => {
  // Convert to lowercase and trim
  const normalizedStatus = status.toLowerCase().trim();
  
  // Check if it's already a valid status
  if (isValidStatus(normalizedStatus)) {
    return normalizedStatus as StatusGroup;
  }
  
  // Try to match common variations
  if (['new', 'brand new', 'just started', 'onboarding'].some(s => normalizedStatus.includes(s))) {
    return 'new';
  }
  
  if (['active', 'current', 'ongoing'].some(s => normalizedStatus.includes(s))) {
    return 'active';
  }
  
  if (['risk', 'at risk', 'at-risk', 'at_risk', 'warning'].some(s => normalizedStatus.includes(s))) {
    return 'at-risk';
  }
  
  if (['churn', 'churned', 'lost', 'cancelled', 'canceled'].some(s => normalizedStatus.includes(s))) {
    return 'churned';
  }
  
  if (['backend', 'back end', 'back-end'].some(s => normalizedStatus.includes(s))) {
    return 'backend';
  }
  
  if (['olympia'].some(s => normalizedStatus.includes(s))) {
    return 'olympia';
  }
  
  if (['pause', 'paused', 'on hold', 'hold'].some(s => normalizedStatus.includes(s))) {
    return 'paused';
  }
  
  if (['graduate', 'graduated', 'complete', 'completed', 'finished', 'done'].some(s => normalizedStatus.includes(s))) {
    return 'graduated';
  }
  
  // Default to active if we can't determine the status
  return 'active';
};

/**
 * Validate and fix client status if needed
 */
export const validateClientStatus = (client: Client): Client => {
  if (!client.status || !isValidStatus(client.status)) {
    return {
      ...client,
      status: 'active' // Set to default if invalid
    };
  }
  return client;
};
