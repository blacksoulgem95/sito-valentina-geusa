import type { APIRoute } from 'astro';
import { adminStorage } from '@/lib/firebase/admin';
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

    const bucketName =
      process.env.FIREBASE_STORAGE_BUCKET ||
      import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET;

    if (!bucketName) {
      return new Response(
        JSON.stringify({ error: 'Storage bucket non configurato' }),
        { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const file = adminStorage.bucket(bucketName).file(filePath);
    const [exists] = await file.exists();

    if (!exists) {
      return new Response(
        JSON.stringify({ error: 'Immagine non trovata' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const [metadata] = await file.getMetadata();
    const [buffer] = await file.download();
    const contentLength = metadata.size ?? buffer.length.toString();

    return new Response(buffer, {
      status: 200,
      headers: withCors({
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Content-Length': contentLength,
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
