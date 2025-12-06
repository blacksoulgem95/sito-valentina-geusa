import type { APIRoute } from 'astro';
import { adminAuth } from '@/lib/firebase/admin';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return new Response(
        JSON.stringify({ error: 'ID token mancante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Get user details
    const user = await adminAuth.getUser(decodedToken.uid);

    // Create a custom token for the client
    const customToken = await adminAuth.createCustomToken(decodedToken.uid);

    return new Response(
      JSON.stringify({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        customToken,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Google login error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante il login con Google' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
