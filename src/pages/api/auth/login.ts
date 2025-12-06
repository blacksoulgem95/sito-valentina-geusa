import type { APIRoute } from 'astro';
import { adminAuth } from '@/lib/firebase/admin';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e password sono obbligatori' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Firebase Admin doesn't have a direct login method
    // We need to verify the password using the Auth REST API
    // For now, we'll use a custom token approach or verify via REST API
    
    // Alternative: Use Firebase Auth REST API to sign in
    const firebaseApiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
    if (!firebaseApiKey) {
      return new Response(
        JSON.stringify({ error: 'Firebase API key non configurata' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sign in with Firebase Auth REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Errore durante il login' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user details from Admin SDK
    const user = await adminAuth.getUser(data.localId);

    return new Response(
      JSON.stringify({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        idToken: data.idToken,
        refreshToken: data.refreshToken,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante il login' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
