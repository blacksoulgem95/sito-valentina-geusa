import type { APIRoute } from 'astro';
import { getFile } from '@/lib/storage/local';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const CACHE_HEADER = `public, max-age=${ONE_WEEK_IN_SECONDS}, immutable`;

const decodePathParam = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  // Astro keeps "[...path]" params as a single string separated by '/'
  return value
    .split('/')
    .map((segment) => decodeURIComponent(segment))
    .join('/');
};

export const GET: APIRoute = async ({ params }) => {
  try {
    const filePath = decodePathParam(params.path);
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'Path dell\'immagine mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const file = await getFile(filePath);

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Immagine non trovata' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    return new Response(file.buffer, {
      status: 200,
      headers: withCors({
        'Content-Type': file.contentType,
        'Content-Length': file.size.toString(),
        'Cache-Control': CACHE_HEADER,
      }),
    });
  } catch (error) {
    console.error('Errore durante il recupero dell\'immagine', error);
    return new Response(
      JSON.stringify({ error: 'Errore durante il recupero dell\'immagine' }),
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
