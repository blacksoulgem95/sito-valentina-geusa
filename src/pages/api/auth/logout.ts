import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  // Logout is handled client-side by clearing the token
  // This endpoint just confirms the logout
  return new Response(
    JSON.stringify({ message: 'Logout effettuato con successo' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
