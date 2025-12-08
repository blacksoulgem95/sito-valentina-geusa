import type { APIRoute } from 'astro';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { deleteFile } from '@/lib/storage/local';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    await verifyAuthToken(request);
    
    const urlObj = new URL(url);
    const fullPath = urlObj.searchParams.get('fullPath');

    if (!fullPath) {
      return new Response(
        JSON.stringify({ error: 'Path del file mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }, request) }
      );
    }

    await deleteFile(fullPath);

    return new Response(
      JSON.stringify({ message: 'File eliminato con successo' }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }, request) }
    );
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante l\'eliminazione del file' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: withCors({ 'Content-Type': 'application/json' }, request) }
    );
  }
};

export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
};
