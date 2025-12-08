import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [category] = await db.select().from(schema.blogCategories).where(eq(schema.blogCategories.slug, slug)).limit(1);
    
    if (!category) {
      return new Response(
        JSON.stringify({ error: 'Categoria non trovata' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    return new Response(
      JSON.stringify(category),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error fetching blog category:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero della categoria' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAuthToken(request);
    
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await request.json();
    const { slug: _, ...updateData } = data;

    await db.update(schema.blogCategories)
      .set(updateData)
      .where(eq(schema.blogCategories.slug, slug));

    return new Response(
      JSON.stringify({ slug, message: 'Categoria aggiornata con successo' }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error updating blog category:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'aggiornamento della categoria' }),
      { status: error.message === 'Non autenticato' ? 401 : 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAuthToken(request);
    
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db.delete(schema.blogCategories).where(eq(schema.blogCategories.slug, slug));

    return new Response(
      JSON.stringify({ message: 'Categoria eliminata con successo' }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error deleting blog category:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'eliminazione della categoria' }),
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
