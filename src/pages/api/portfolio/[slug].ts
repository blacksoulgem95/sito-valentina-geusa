import type { APIRoute } from 'astro';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Non autenticato');
  }
  const idToken = authHeader.split('Bearer ')[1];
  await adminAuth.verifyIdToken(idToken);
}

// GET: Get single portfolio item
export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const doc = await adminDb.collection('portfolio').doc(slug).get();
    
    if (!doc.exists) {
      return new Response(
        JSON.stringify({ error: 'Portfolio item non trovato' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    return new Response(
      JSON.stringify({ slug: doc.id, ...doc.data() }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching portfolio item:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero del portfolio item' }),
      { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

// PUT: Update portfolio item
export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAuth(request);
    
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const data = await request.json();
    const { slug: _, ...updateData } = data;

    const docRef = adminDb.collection('portfolio').doc(slug);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return new Response(
        JSON.stringify({ error: 'Portfolio item non trovato' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
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
      JSON.stringify({ slug, message: 'Portfolio item aggiornato con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating portfolio item:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'aggiornamento del portfolio item' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

// DELETE: Delete portfolio item
export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAuth(request);
    
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    await adminDb.collection('portfolio').doc(slug).delete();

    return new Response(
      JSON.stringify({ message: 'Portfolio item eliminato con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting portfolio item:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'eliminazione del portfolio item' }),
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
