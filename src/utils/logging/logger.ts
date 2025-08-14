/**
 * Centralized Logging Utility
 * Provides environment-aware logging with different levels
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  source?: string;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private currentLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
  
  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    if (level > this.currentLevel) return;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      source
    };
    
    if (!this.isDevelopment && level > LogLevel.WARN) return;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(`[ERROR] ${entry.message}`, data ? { data, source } : '');
        break;
      case LogLevel.WARN:
        console.warn(`[WARN] ${entry.message}`, data ? { data, source } : '');
        break;
      case LogLevel.INFO:
        if (this.isDevelopment) {
          console.info(`[INFO] ${entry.message}`, data ? { data, source } : '');
        }
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(`[DEBUG] ${entry.message}`, data ? { data, source } : '');
        }
        break;
    }
  }
  
  error(message: string, data?: any, source?: string): void {
    this.log(LogLevel.ERROR, message, data, source);
  }
  
  warn(message: string, data?: any, source?: string): void {
    this.log(LogLevel.WARN, message, data, source);
  }
  
  info(message: string, data?: any, source?: string): void {
    this.log(LogLevel.INFO, message, data, source);
  }
  
  debug(message: string, data?: any, source?: string): void {
    this.log(LogLevel.DEBUG, message, data, source);
  }
  
  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }
  
  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();