import type { APIRoute } from 'astro';
import { adminStorage, adminAuth } from '@/lib/firebase/admin';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Non autenticato');
  }
  const idToken = authHeader.split('Bearer ')[1];
  await adminAuth.verifyIdToken(idToken);
}

export const GET: APIRoute = async ({ request, url }) => {
  try {
    await verifyAuth(request);
    
    const urlObj = new URL(url);
    const folder = urlObj.searchParams.get('folder') || '';
    const maxResultsParam = urlObj.searchParams.get('maxResults');
    const maxResults = maxResultsParam ? parseInt(maxResultsParam, 10) : 1000;

    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
      return new Response(
        JSON.stringify({ error: 'Storage bucket non configurato' }),
        { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }
    const bucket = adminStorage.bucket(storageBucket);
    
    // List files with optional folder prefix
    const [files] = await bucket.getFiles({
      prefix: folder,
      maxResults,
    });

    // Get metadata and signed URLs for each file
    const filePromises = files.map(async (file) => {
      const [metadata] = await file.getMetadata();
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });

      // Extract folder from fullPath (everything before the last /)
      const fullPath = file.name;
      const lastSlashIndex = fullPath.lastIndexOf('/');
      const folderPath = lastSlashIndex > 0 ? fullPath.substring(0, lastSlashIndex) : undefined;
      const fileName = lastSlashIndex > 0 ? fullPath.substring(lastSlashIndex + 1) : fullPath;

      return {
        name: fileName,
        fullPath,
        url,
        size: parseInt(metadata.size || '0', 10),
        contentType: metadata.contentType || 'application/octet-stream',
        updated: new Date(metadata.updated || Date.now()),
        folder: folderPath,
      };
    });

    const fileList = await Promise.all(filePromises);

    return new Response(
      JSON.stringify(fileList),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error listing files:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante il recupero dei file' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
};
