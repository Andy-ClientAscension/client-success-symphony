// Code Quality Utility Functions
// This file contains utilities to help with code quality improvements

export type StrictTypeCheck<T> = T extends any ? never : T;

// Utility to replace 'any' with proper typing
export interface TypedObject<T = unknown> {
  [key: string]: T;
}

// Better error handling types
export interface ErrorWithCode extends Error {
  code?: string | number;
  status?: number;
}

// Safe console logging for production
export const safeLogger = {
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
      console.error(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
      console.info(message, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
      console.log(message, ...args);
    }
  }
};

// Type guard utilities
export const isValidObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isValidArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isValidString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

// Async error handling wrapper
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    safeLogger.error('Async operation failed:', error);
    return fallback;
  }
};