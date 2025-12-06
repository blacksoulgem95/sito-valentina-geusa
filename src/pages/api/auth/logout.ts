import type { APIRoute } from 'astro';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const POST: APIRoute = async () => {
  // Logout is handled client-side by clearing the token
  // This endpoint just confirms the logout
  return new Response(
    JSON.stringify({ message: 'Logout effettuato con successo' }),
    {
      status: 200,
      headers: withCors({ 'Content-Type': 'application/json' }),
    }
  );
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
};
