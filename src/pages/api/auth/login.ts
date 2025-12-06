import type { APIRoute } from 'astro';
import { adminAuth } from '@/lib/firebase/admin';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid Content-Type:', contentType);
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let body;
    try {
      const text = await request.text();
      console.log('Request body text:', text.substring(0, 100)); // Log first 100 chars
      
      if (!text || text.trim() === '') {
        console.error('Empty request body');
        return new Response(
          JSON.stringify({ error: 'Richiesta nel formato errato' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      body = JSON.parse(text);
      console.log('Login request received, email:', body?.email ? 'presente' : 'mancante');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      console.error('Missing email or password:', { 
        hasEmail: !!email, 
        hasPassword: !!password,
        emailType: typeof email,
        passwordType: typeof password
      });
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      console.error('Invalid email or password type');
      return new Response(
        JSON.stringify({ error: 'Richiesta nel formato errato' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Firebase Admin doesn't have a direct login method
    // We need to verify the password using the Auth REST API
    // For now, we'll use a custom token approach or verify via REST API
    
    // Alternative: Use Firebase Auth REST API to sign in
    const firebaseApiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
    
    // Check if API key is missing or is a placeholder
    if (!firebaseApiKey || firebaseApiKey === 'your_firebase_api_key_here' || firebaseApiKey.trim() === '') {
      console.error('Firebase API key non configurata o non valida:', {
        hasKey: !!firebaseApiKey,
        isPlaceholder: firebaseApiKey === 'your_firebase_api_key_here',
        keyLength: firebaseApiKey?.length || 0
      });
      return new Response(
        JSON.stringify({ 
          error: 'Configurazione server non valida. La Firebase API key non è configurata correttamente in App Hosting.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sign in with Firebase Auth REST API
    console.log('Attempting Firebase login for email:', email);
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
      console.error('Firebase login error:', {
        status: response.status,
        error: data.error,
        message: data.error?.message,
        apiKeyConfigured: !!firebaseApiKey,
        apiKeyLength: firebaseApiKey?.length || 0
      });
      
      // Gestione specifica per errore API key non valida
      if (data.error?.message?.includes('API key not valid') || data.error?.message?.includes('INVALID_API_KEY')) {
        console.error('Firebase API key non valida. Verifica la configurazione in App Hosting.');
        return new Response(
          JSON.stringify({ 
            error: 'Configurazione server non valida. La Firebase API key non è valida. Verifica le variabili d\'ambiente in App Hosting.' 
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Messaggi di errore basati sullo status code
      let errorMessage = 'Credenziali non corrette';
      let statusCode = 401; // Default a 401 per errori di autenticazione
      
      if (data.error) {
        const errorCode = data.error.message || '';
        // Errori che indicano credenziali errate -> 401
        if (errorCode.includes('INVALID_PASSWORD') || errorCode.includes('EMAIL_NOT_FOUND')) {
          errorMessage = 'Credenziali non corrette';
          statusCode = 401;
        } else if (errorCode.includes('USER_DISABLED')) {
          errorMessage = 'Credenziali non corrette';
          statusCode = 403;
        } else if (errorCode.includes('TOO_MANY_ATTEMPTS')) {
          errorMessage = 'Credenziali non corrette';
          statusCode = 403;
        } else if (errorCode.includes('INVALID_EMAIL')) {
          errorMessage = 'Richiesta nel formato errato';
          statusCode = 400;
        } else {
          // Se non riconosciamo l'errore, usiamo il messaggio originale ma con status 401
          errorMessage = 'Credenziali non corrette';
          statusCode = 401;
        }
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: statusCode, headers: { 'Content-Type': 'application/json' } }
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
