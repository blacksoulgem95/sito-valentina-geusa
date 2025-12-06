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

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAuth(request);
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || '';

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nessun file fornito' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bucket = adminStorage.bucket();
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      const fileRef = bucket.file(filePath);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type || 'application/octet-stream',
        },
      });

      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });

      return {
        name: file.name,
        fullPath: filePath,
        url,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return new Response(
      JSON.stringify({ files: uploadedFiles }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante l\'upload dei file' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
