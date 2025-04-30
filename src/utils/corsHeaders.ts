
// Standard CORS headers for Supabase and API communication
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Helper to check if it's a CORS preflight request
export const handleCorsPreflightRequest = (req: Request): Response | null => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  return null;
};

// Create a function to add CORS headers to existing headers
export const withCorsHeaders = (headers: Headers | Record<string, string> = {}): Headers => {
  const resultHeaders = new Headers(headers);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    resultHeaders.set(key, value);
  });
  
  return resultHeaders;
};

