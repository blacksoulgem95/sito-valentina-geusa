import type { APIRoute } from 'astro';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

// Helper to verify authentication
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Non autenticato');
  }
  const idToken = authHeader.split('Bearer ')[1];
  await adminAuth.verifyIdToken(idToken);
}

// GET: List all portfolio items
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const published = url.searchParams.get('published');
    
    let query = adminDb.collection('portfolio');
    
    if (published === 'true') {
      query = query.where('published', '==', true);
    }
    
    query = query.orderBy('updatedAt', 'desc');
    
    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => ({
      slug: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero del portfolio' }),
      { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

// POST: Create new portfolio item
export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAuth(request);
    
    const data = await request.json();
    const { slug, ...itemData } = data;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug è obbligatorio' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if slug exists
    const existingDoc = await adminDb.collection('portfolio').doc(slug).get();
    if (existingDoc.exists) {
      return new Response(
        JSON.stringify({ error: 'Uno slug con questo nome esiste già' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    await adminDb.collection('portfolio').doc(slug).set({
      ...itemData,
      updatedAt: now,
      publishedAt: itemData.published ? now : null,
    });

    return new Response(
      JSON.stringify({ slug, message: 'Portfolio item creato con successo' }),
      { status: 201, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error creating portfolio item:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nella creazione del portfolio item' }),
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
