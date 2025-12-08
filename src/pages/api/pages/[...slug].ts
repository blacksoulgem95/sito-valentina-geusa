import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug: slugParts } = params;
    if (!slugParts || (Array.isArray(slugParts) && slugParts.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const slug = Array.isArray(slugParts) ? slugParts.join('/') : slugParts;

    const [page] = await db.select().from(schema.pages).where(eq(schema.pages.slug, slug)).limit(1);
    
    if (!page) {
      return new Response(
        JSON.stringify({ error: 'Pagina non trovata' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(page),
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
    await verifyAuthToken(request);
    
    const { slug: slugParts } = params;
    if (!slugParts || (Array.isArray(slugParts) && slugParts.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const oldSlug = Array.isArray(slugParts) ? slugParts.join('/') : slugParts;

    const data = await request.json();
    const { slug: newSlug, ...updateData } = data;

    const [oldPage] = await db.select().from(schema.pages).where(eq(schema.pages.slug, oldSlug)).limit(1);
    
    if (!oldPage) {
      return new Response(
        JSON.stringify({ error: 'Pagina non trovata' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const now = new Date();
    
    // If slug changed, we need to create a new record and delete the old one
    if (newSlug && newSlug !== oldSlug) {
      const [existing] = await db.select().from(schema.pages).where(eq(schema.pages.slug, newSlug)).limit(1);
      
      if (existing) {
        return new Response(
          JSON.stringify({ error: 'Questo slug è già in uso' }),
          { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
        );
      }

      // Create new record with new slug
      await db.insert(schema.pages).values({
        slug: newSlug,
        ...oldPage,
        ...updateData,
        updatedAt: now,
        publishedAt: updateData.published !== undefined 
          ? (updateData.published ? (oldPage.publishedAt || now) : null)
          : oldPage.publishedAt,
      });

      // Delete old record
      await db.delete(schema.pages).where(eq(schema.pages.slug, oldSlug));

      return new Response(
        JSON.stringify({ slug: newSlug, message: 'Pagina aggiornata con successo' }),
        { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    } else {
      // Slug unchanged, just update the record
      await db.update(schema.pages)
        .set({
          ...updateData,
          updatedAt: now,
          publishedAt: updateData.published !== undefined 
            ? (updateData.published ? (oldPage.publishedAt || now) : null)
            : oldPage.publishedAt,
        })
        .where(eq(schema.pages.slug, oldSlug));

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
    await verifyAuthToken(request);
    
    const { slug: slugParts } = params;
    if (!slugParts || (Array.isArray(slugParts) && slugParts.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Slug mancante' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const slug = Array.isArray(slugParts) ? slugParts.join('/') : slugParts;

    await db.delete(schema.pages).where(eq(schema.pages.slug, slug));

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
