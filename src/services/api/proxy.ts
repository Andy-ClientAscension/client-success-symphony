
import { corsHeaders, withCorsHeaders, handleCorsPreflightRequest } from '@/utils/corsHeaders';

interface ProxyOptions {
  targetUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  method?: string;
}

/**
 * Simple proxy function to forward requests to a target URL with proper CORS headers
 * This helps bypass CORS restrictions when the target API doesn't support CORS
 */
export async function proxyRequest(
  request: Request, 
  options: ProxyOptions
): Promise<Response> {
  // Handle CORS preflight request
  const preflight = handleCorsPreflightRequest(request);
  if (preflight) return preflight;
  
  const { targetUrl, headers = {}, timeout = 30000, method } = options;
  
  try {
    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Forward the request
    const response = await fetch(targetUrl, {
      method: method || request.method,
      headers: withCorsHeaders({
        ...headers,
        'Content-Type': request.headers.get('Content-Type') || 'application/json'
      }),
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob(),
      signal: controller.signal,
      credentials: 'include'
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Create a new response with CORS headers
    const responseHeaders = withCorsHeaders(response.headers);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error during proxy request',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: withCorsHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }
}

/**
 * Helper function to create a proxy handler for a specific target URL
 */
export function createProxyHandler(targetBaseUrl: string) {
  return async (request: Request, path: string = '') => {
    const url = new URL(request.url);
    const targetUrl = `${targetBaseUrl}${path || url.pathname}${url.search}`;
    
    return proxyRequest(request, { targetUrl });
  };
}
