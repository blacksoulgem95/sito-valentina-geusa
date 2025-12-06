import type { APIRoute } from 'astro';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Non autenticato');
  }
  const idToken = authHeader.split('Bearer ')[1];
  await adminAuth.verifyIdToken(idToken);
}

// PUT: Update social links
export const PUT: APIRoute = async ({ request }) => {
  try {
    await verifyAuth(request);
    
    const data = await request.json();
    const { instagram, linkedin } = data;

    const updateData: Record<string, string> = {};
    if (instagram !== undefined) updateData.instagram = instagram;
    if (linkedin !== undefined) updateData.linkedin = linkedin;

    await adminDb.collection('links').doc('socials').set(updateData, { merge: true });

    return new Response(
      JSON.stringify({ message: 'Link social aggiornati con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating social links:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'aggiornamento dei link social' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
