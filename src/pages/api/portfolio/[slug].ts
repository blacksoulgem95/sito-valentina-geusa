import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

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

    const [item] = await db.select().from(schema.portfolioItems).where(eq(schema.portfolioItems.slug, slug)).limit(1);
    
    if (!item) {
      return new Response(
        JSON.stringify({ error: 'Portfolio item non trovato' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    return new Response(
      JSON.stringify(item),
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
    await verifyAuthToken(request);
    
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const data = await request.json();
    const { slug: _, ...updateData } = data;

    const [item] = await db.select().from(schema.portfolioItems).where(eq(schema.portfolioItems.slug, slug)).limit(1);
    
    if (!item) {
      return new Response(
        JSON.stringify({ error: 'Portfolio item non trovato' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const now = new Date();
    
    await db.update(schema.portfolioItems)
      .set({
        ...updateData,
        updatedAt: now,
        publishedAt: updateData.published !== undefined 
          ? (updateData.published ? (item.publishedAt || now) : null)
          : item.publishedAt,
      })
      .where(eq(schema.portfolioItems.slug, slug));

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
    await verifyAuthToken(request);
    
    const { slug } = params;
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    await db.delete(schema.portfolioItems).where(eq(schema.portfolioItems.slug, slug));

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
