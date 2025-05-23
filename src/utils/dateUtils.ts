
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

/**
 * Formats a date for display with smart relative time
 * @param date The date to format
 * @returns Formatted date string with relative time for recent dates
 */
export function formatSmartDate(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  }
  
  // For dates within the last week, show relative time
  const diffInDays = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays < 7) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
  
  // For older dates, show the full date
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Formats a date in a consistent way throughout the application
 * @param date The date to format
 * @param formatString Optional format string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, formatString: string = 'MMM d, yyyy'): string {
  return format(date instanceof Date ? date : new Date(date), formatString);
}

/**
 * Creates a relative time string (e.g., "2 hours ago")
 * @param date The date to format
 * @returns Relative time string
 */
export function timeAgo(date: Date | string | number): string {
  return formatDistanceToNow(date instanceof Date ? date : new Date(date), { addSuffix: true });
}
