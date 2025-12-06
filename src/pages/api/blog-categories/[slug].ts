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

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAuth(request);
    
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await request.json();
    const { slug: _, ...updateData } = data;

    await adminDb.collection('blog_categories').doc(slug).update(updateData);

    return new Response(
      JSON.stringify({ slug, message: 'Categoria aggiornata con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating blog category:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'aggiornamento della categoria' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAuth(request);
    
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await adminDb.collection('blog_categories').doc(slug).delete();

    return new Response(
      JSON.stringify({ message: 'Categoria eliminata con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting blog category:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'eliminazione della categoria' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
