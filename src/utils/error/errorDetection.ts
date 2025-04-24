
export function isCorsError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('CORS') || 
           error.message.includes('cross-origin') ||
           error.message.includes('blocked by CORS policy');
  }
  if (typeof error === 'string') {
    return error.includes('CORS') || 
           error.includes('cross-origin') ||
           error.includes('blocked by CORS policy');
  }
  return false;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Failed to fetch') || 
           error.message.includes('NetworkError') ||
           error.message.includes('Network request failed') ||
           error.message.includes('net::ERR');
  }
  if (typeof error === 'string') {
    return error.includes('Failed to fetch') || 
           error.includes('NetworkError') ||
           error.includes('Network request failed') ||
           error.includes('net::ERR');
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('401') || 
           error.message.includes('403') || 
           error.message.includes('unauthorized') || 
           error.message.includes('not authenticated');
  }
  if (typeof error === 'string') {
    return error.includes('401') || 
           error.includes('403') || 
           error.includes('unauthorized') || 
           error.includes('not authenticated');
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string | number }).code;
    return code === 401 || code === 403 || code === 'auth_error';
  }
  
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('validation') || error.message.includes('invalid');
  }
  if (typeof error === 'string') {
    return error.includes('validation') || error.includes('invalid');
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string | number }).code;
    return code === 422 || code === 'validation_error';
  }
  
  return false;
}

export function isPlaceholderDSN(dsn: string): boolean {
  return dsn === 'YOUR_SENTRY_DSN' || 
         dsn === 'YOUR_DSN_HERE' ||
         dsn.includes('placeholder') || 
         dsn.includes('your') || 
         dsn.includes('SENTRY');
}
