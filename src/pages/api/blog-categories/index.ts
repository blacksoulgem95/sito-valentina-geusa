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

export const GET: APIRoute = async () => {
  try {
    const snapshot = await adminDb.collection('blog_categories')
      .orderBy('name')
      .get();
    
    const categories = snapshot.docs.map((doc) => ({
      slug: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching blog categories:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero delle categorie' }),
      { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAuth(request);
    
    const data = await request.json();
    const { slug, ...categoryData } = data;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug è obbligatorio' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const existingDoc = await adminDb.collection('blog_categories').doc(slug).get();
    if (existingDoc.exists) {
      return new Response(
        JSON.stringify({ error: 'Una categoria con questo slug esiste già' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    await adminDb.collection('blog_categories').doc(slug).set(categoryData);

    return new Response(
      JSON.stringify({ slug, message: 'Categoria creata con successo' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating blog category:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nella creazione della categoria' }),
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
