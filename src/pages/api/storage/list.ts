import type { APIRoute } from 'astro';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { listFiles } from '@/lib/storage/local';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    await verifyAuthToken(request);
    
    const urlObj = new URL(url);
    const folder = urlObj.searchParams.get('folder') || '';
    const maxResultsParam = urlObj.searchParams.get('maxResults');
    const maxResults = maxResultsParam ? parseInt(maxResultsParam, 10) : 1000;

    const fileList = await listFiles(folder, maxResults);

    return new Response(
      JSON.stringify(fileList),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }, request) }
    );
  } catch (error: any) {
    console.error('Error listing files:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante il recupero dei file' }),
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
