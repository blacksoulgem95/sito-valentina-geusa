import type { APIRoute } from 'astro';
import { adminAuth } from '@/lib/firebase/admin';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return new Response(
        JSON.stringify({ error: 'ID token mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Get user details
    const user = await adminAuth.getUser(decodedToken.uid);

    // Return the verified ID token (not a custom token)
    // Custom tokens cannot be verified with verifyIdToken()
    return new Response(
      JSON.stringify({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        idToken,
      }),
      {
        status: 200,
        headers: withCors({ 'Content-Type': 'application/json' }),
      }
    );
  } catch (error: any) {
    console.error('Google login error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante il login con Google' }),
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
