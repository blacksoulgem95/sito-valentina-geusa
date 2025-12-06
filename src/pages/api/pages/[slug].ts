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

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const doc = await adminDb.collection('pages').doc(slug).get();
    
    if (!doc.exists) {
      return new Response(
        JSON.stringify({ error: 'Pagina non trovata' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ slug: doc.id, ...doc.data() }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error fetching page:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero della pagina' }),
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
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const data = await request.json();
    const { slug: _, ...updateData } = data;

    const docRef = adminDb.collection('pages').doc(slug);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return new Response(
        JSON.stringify({ error: 'Pagina non trovata' }),
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
      JSON.stringify({ slug, message: 'Pagina aggiornata con successo' }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error updating page:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'aggiornamento della pagina' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: withCors({ 'Content-Type': 'application/json' }) }
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
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    await adminDb.collection('pages').doc(slug).delete();

    return new Response(
      JSON.stringify({ message: 'Pagina eliminata con successo' }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'eliminazione della pagina' }),
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
