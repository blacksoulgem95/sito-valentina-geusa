import type { APIRoute } from 'astro';
import { adminAuth } from '@/lib/firebase/admin';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

const MIN_PASSWORD_LENGTH = 8;

interface FirebaseErrorResponse {
  error?: {
    message?: string;
  };
}

async function signInWithEmailAndPassword(email: string, password: string, apiKey: string) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
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
  return { response, data };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token di autenticazione mancante' }),
        { status: 401, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return new Response(
        JSON.stringify({ error: 'Token di autenticazione non valido' }),
        { status: 401, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

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
      console.error('Errore lettura body change-password:', error);
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
      console.error('Errore parsing body change-password:', error);
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

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    let email = decodedToken.email;
    if (!email) {
      const userRecord = await adminAuth.getUser(uid);
      email = userRecord.email || undefined;
    }

    if (!email) {
      console.error('Impossibile determinare email utente per cambio password');
      return new Response(
        JSON.stringify({ error: "Impossibile recuperare l'email dell'utente" }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const firebaseApiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
    if (!firebaseApiKey || firebaseApiKey === 'your_firebase_api_key_here' || firebaseApiKey.trim() === '') {
      console.error('Firebase API key non configurata per cambio password');
      return new Response(
        JSON.stringify({
          error: 'Configurazione server non valida. Firebase API key mancante o non valida',
        }),
        { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Verifica dell'attuale password
    const { response: verifyResponse, data: verifyData } = await signInWithEmailAndPassword(
      email,
      currentPassword,
      firebaseApiKey
    );

    if (!verifyResponse.ok) {
      const firebaseError = (verifyData as FirebaseErrorResponse)?.error?.message || 'PASSWORD_INVALID';
      console.error('Verifica password attuale fallita:', firebaseError);
      let errorMessage = 'Password attuale non corretta';
      let statusCode = 401;

      if (firebaseError.includes('INVALID_EMAIL')) {
        errorMessage = 'Richiesta nel formato errato';
        statusCode = 400;
      } else if (firebaseError.includes('TOO_MANY_ATTEMPTS')) {
        errorMessage = 'Troppi tentativi falliti. Riprova più tardi';
        statusCode = 429;
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: statusCode, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Aggiorna la password usando l'SDK Admin
    await adminAuth.updateUser(uid, { password: newPassword });

    const userRecord = await adminAuth.getUser(uid);

    // Esegui login con la nuova password per restituire un token aggiornato
    const { response: newLoginResponse, data: newLoginData } = await signInWithEmailAndPassword(
      email,
      newPassword,
      firebaseApiKey
    );

    if (!newLoginResponse.ok) {
      console.error('Login dopo cambio password fallito:', newLoginData);
      return new Response(
        JSON.stringify({
          message:
            'Password aggiornata ma impossibile creare una nuova sessione automatica. Effettua nuovamente il login.',
          requiresReauth: true,
          user: {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
          },
        }),
        { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Password aggiornata con successo',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
        },
        idToken: (newLoginData as any).idToken,
        refreshToken: (newLoginData as any).refreshToken,
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
