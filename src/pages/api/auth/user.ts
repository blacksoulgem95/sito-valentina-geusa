import type { APIRoute } from 'astro';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const GET: APIRoute = async ({ request }) => {
  try {
    const payload = await verifyAuthToken(request);
    
    // Get user details from database
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, payload.userId)).limit(1);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Utente non trovato' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    return new Response(
      JSON.stringify({
        user: {
          uid: user.id.toString(),
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
        },
      }),
      {
        status: 200,
        headers: withCors({ 'Content-Type': 'application/json' }),
      }
    );
  } catch (error: any) {
    console.error('Get user error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante la verifica del token' }),
      { status: 401, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
};
