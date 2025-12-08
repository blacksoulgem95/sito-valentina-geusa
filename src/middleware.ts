import type { MiddlewareHandler } from 'astro';

/**
 * Security headers middleware
 * Implements Content Security Policy (CSP) and HTTP Strict Transport Security (HSTS)
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();

  // Only add security headers to HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    return response;
  }

  // Get the domain from environment or use default
  const domain = import.meta.env.DOMAIN || process.env.DOMAIN;
  const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

  // Content Security Policy
  // Adjust these directives based on your specific needs
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com", // unsafe-eval needed for React/React DevTools, unsafe-inline for inline scripts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // unsafe-inline for inline styles, Google Fonts if used
    "img-src 'self' data: https: blob:", // Allow images from self, data URIs, HTTPS, and blob URLs
    "font-src 'self' data: https://fonts.gstatic.com", // Allow fonts from self, data URIs, and Google Fonts
    "connect-src 'self' https://challenges.cloudflare.com", // Allow AJAX/fetch to self and Cloudflare Turnstile
    "frame-src 'self' https://challenges.cloudflare.com", // Allow iframes from self and Cloudflare Turnstile
    "object-src 'none'", // Disallow plugins
    "base-uri 'self'", // Restrict base tag URLs
    "form-action 'self'", // Restrict form submissions
    "frame-ancestors 'none'", // Prevent clickjacking
    "upgrade-insecure-requests", // Upgrade HTTP requests to HTTPS
  ];

  // HTTP Strict Transport Security (HSTS)
  // Only enable in production with HTTPS
  if (isProduction) {
    // max-age: 1 year (31536000 seconds)
    // includeSubDomains: Apply to all subdomains
    // preload: Allow inclusion in HSTS preload list (optional, remove if not submitting)
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Set CSP header
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return response;
};

