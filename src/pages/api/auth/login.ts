import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Richiesta nel formato errato' }),
          { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Find user by email
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Credenziali non corrette' }),
        { status: 401, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Credenziali non corrette' }),
        { status: 401, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return new Response(
      JSON.stringify({
        user: {
          uid: user.id.toString(),
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
        },
        idToken: token,
      }),
      {
        status: 200,
        headers: withCors({ 'Content-Type': 'application/json' }),
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante il login' }),
      { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
};
