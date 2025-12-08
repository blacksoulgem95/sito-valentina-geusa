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
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const [post] = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.slug, slug)).limit(1);
    
    if (!post) {
      return new Response(
        JSON.stringify({ error: 'Blog post non trovato' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    return new Response(
      JSON.stringify(post),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero del blog post' }),
      { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
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
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const data = await request.json();
    const { slug: _, ...updateData } = data;

    const [post] = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.slug, slug)).limit(1);
    
    if (!post) {
      return new Response(
        JSON.stringify({ error: 'Blog post non trovato' }),
        { status: 404, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const now = new Date();
    
    await db.update(schema.blogPosts)
      .set({
        ...updateData,
        updatedAt: now,
        publishedAt: updateData.published !== undefined 
          ? (updateData.published ? (post.publishedAt || now) : null)
          : post.publishedAt,
      })
      .where(eq(schema.blogPosts.slug, slug));

    return new Response(
      JSON.stringify({ slug, message: 'Blog post aggiornato con successo' }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'aggiornamento del blog post' }),
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
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    await db.delete(schema.blogPosts).where(eq(schema.blogPosts.slug, slug));

    return new Response(
      JSON.stringify({ message: 'Blog post eliminato con successo' }),
      { status: 200, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'eliminazione del blog post' }),
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
