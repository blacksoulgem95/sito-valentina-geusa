import type { APIRoute } from 'astro';
import { adminAuth } from '@/lib/firebase/admin';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token di autenticazione mancante' }),
        { status: 401, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Get user details
    const user = await adminAuth.getUser(decodedToken.uid);

    return new Response(
      JSON.stringify({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
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
