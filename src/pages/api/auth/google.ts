import type { APIRoute } from 'astro';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

// Google OAuth login is not implemented in this version
// You can implement it later using Google OAuth 2.0
export const POST: APIRoute = async ({ request }) => {
  return new Response(
    JSON.stringify({ error: 'Google login non ancora implementato' }),
    { status: 501, headers: withCors({ 'Content-Type': 'application/json' }) }
  );
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
};
