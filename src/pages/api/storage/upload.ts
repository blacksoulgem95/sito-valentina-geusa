import type { APIRoute } from 'astro';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { saveFile } from '@/lib/storage/local';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAuthToken(request);
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || '';

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nessun file fornito' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }, request) }
      );
    }

    const uploadPromises = files.map((file) => saveFile(file, folder));
    const uploadedFiles = await Promise.all(uploadPromises);

    return new Response(
      JSON.stringify({ files: uploadedFiles }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }, request) }
    );
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante l\'upload dei file' }),
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
