import type { APIRoute } from 'astro';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

const MIN_PASSWORD_LENGTH = 8;

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await verifyAuthToken(request);

    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    let bodyText = '';
    try {
      bodyText = await request.text();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    if (!bodyText || bodyText.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    let body: { currentPassword?: unknown; newPassword?: unknown };
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const { currentPassword, newPassword } = body;

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    if (!currentPassword.trim() || !newPassword.trim()) {
      return new Response(
        JSON.stringify({ error: 'Compila tutti i campi' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `La nuova password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri`,
        }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    if (newPassword === currentPassword) {
      return new Response(
        JSON.stringify({
          error: 'La nuova password deve essere diversa da quella attuale',
        }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Get user from database
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, payload.userId)).limit(1);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Utente non trovato' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Password attuale non corretta' }),
        { status: 401, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword);
    await db
      .update(schema.users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(schema.users.id, payload.userId));

    // Generate new token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return new Response(
      JSON.stringify({
        message: 'Password aggiornata con successo',
        user: {
          uid: user.id.toString(),
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
        },
        idToken: token,
      }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Errore cambio password:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Errore durante il cambio password',
      }),
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
