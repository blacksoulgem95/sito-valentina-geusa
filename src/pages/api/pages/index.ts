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

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const published = url.searchParams.get('published');
    
    let query = adminDb.collection('pages');
    
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
    console.error('Error fetching pages:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero delle pagine' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAuth(request);
    
    const data = await request.json();
    const { slug, ...pageData } = data;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug è obbligatorio' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingDoc = await adminDb.collection('pages').doc(slug).get();
    if (existingDoc.exists) {
      return new Response(
        JSON.stringify({ error: 'Uno slug con questo nome esiste già' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    await adminDb.collection('pages').doc(slug).set({
      ...pageData,
      updatedAt: now,
      publishedAt: pageData.published ? now : null,
    });

    return new Response(
      JSON.stringify({ slug, message: 'Pagina creata con successo' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating page:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nella creazione della pagina' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
