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

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const doc = await adminDb.collection('blog').doc(slug).get();
    
    if (!doc.exists) {
      return new Response(
        JSON.stringify({ error: 'Blog post non trovato' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ slug: doc.id, ...doc.data() }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero del blog post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

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

    const docRef = adminDb.collection('blog').doc(slug);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return new Response(
        JSON.stringify({ error: 'Blog post non trovato' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const currentData = doc.data();
    
    await docRef.update({
      ...updateData,
      updatedAt: now,
      publishedAt: updateData.published !== undefined 
        ? (updateData.published ? (currentData?.publishedAt || now) : null)
        : currentData?.publishedAt,
    });

    return new Response(
      JSON.stringify({ slug, message: 'Blog post aggiornato con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'aggiornamento del blog post' }),
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

    await adminDb.collection('blog').doc(slug).delete();

    return new Response(
      JSON.stringify({ message: 'Blog post eliminato con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'eliminazione del blog post' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
