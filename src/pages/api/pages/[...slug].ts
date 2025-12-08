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
    const { slug: slugParts } = params;
    if (!slugParts || (Array.isArray(slugParts) && slugParts.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Join slug parts with slashes to handle nested paths like "legal/dati-societari"
    const slug = Array.isArray(slugParts) ? slugParts.join('/') : slugParts;

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
    
    const { slug: slugParts } = params;
    if (!slugParts || (Array.isArray(slugParts) && slugParts.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Join slug parts with slashes to handle nested paths
    const oldSlug = Array.isArray(slugParts) ? slugParts.join('/') : slugParts;

    const data = await request.json();
    const { slug: newSlug, ...updateData } = data;

    const oldDocRef = adminDb.collection('pages').doc(oldSlug);
    const oldDoc = await oldDocRef.get();
    
    if (!oldDoc.exists) {
      return new Response(
        JSON.stringify({ error: 'Pagina non trovata' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const now = new Date();
    const currentData = oldDoc.data();
    
    // If slug changed, we need to create a new document and delete the old one
    if (newSlug && newSlug !== oldSlug) {
      // Check if new slug already exists
      const newDocRef = adminDb.collection('pages').doc(newSlug);
      const newDoc = await newDocRef.get();
      
      if (newDoc.exists) {
        return new Response(
          JSON.stringify({ error: 'Questo slug è già in uso' }),
          { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
        );
      }

      // Create new document with new slug
      // Remove old slug from currentData if present, and ensure new slug is set
      const { slug: _, ...dataWithoutSlug } = currentData || {};
      await newDocRef.set({
        ...dataWithoutSlug,
        ...updateData,
        slug: newSlug,
        updatedAt: now,
        publishedAt: updateData.published !== undefined 
          ? (updateData.published ? (currentData?.publishedAt || now) : null)
          : currentData?.publishedAt,
      });

      // Delete old document
      await oldDocRef.delete();

      return new Response(
        JSON.stringify({ slug: newSlug, message: 'Pagina aggiornata con successo' }),
        { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    } else {
      // Slug unchanged, just update the document
      await oldDocRef.update({
        ...updateData,
        updatedAt: now,
        publishedAt: updateData.published !== undefined 
          ? (updateData.published ? (currentData?.publishedAt || now) : null)
          : currentData?.publishedAt,
      });

      return new Response(
        JSON.stringify({ slug: oldSlug, message: 'Pagina aggiornata con successo' }),
        { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }
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
    
    const { slug: slugParts } = params;
    if (!slugParts || (Array.isArray(slugParts) && slugParts.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    // Join slug parts with slashes to handle nested paths
    const slug = Array.isArray(slugParts) ? slugParts.join('/') : slugParts;

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
