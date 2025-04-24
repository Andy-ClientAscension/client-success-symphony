
export type ErrorType = 'auth' | 'network' | 'cors' | 'validation' | 'server' | 'unknown';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorOptions {
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  shouldNotify?: boolean;
  user?: {
    id?: string;
    email?: string;
    [key: string]: any;
  };
}

export interface ErrorState {
  message: string;
  type: ErrorType;
  code?: string | number;
  details?: unknown;
}
