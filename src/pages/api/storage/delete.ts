import type { APIRoute } from 'astro';
import { adminStorage, adminAuth } from '@/lib/firebase/admin';

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Non autenticato');
  }
  const idToken = authHeader.split('Bearer ')[1];
  await adminAuth.verifyIdToken(idToken);
}

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    await verifyAuth(request);
    
    const urlObj = new URL(url);
    const fullPath = urlObj.searchParams.get('fullPath');

    if (!fullPath) {
      return new Response(
        JSON.stringify({ error: 'Path del file mancante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bucket = adminStorage.bucket();
    await bucket.file(fullPath).delete();

    return new Response(
      JSON.stringify({ message: 'File eliminato con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante l\'eliminazione del file' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
