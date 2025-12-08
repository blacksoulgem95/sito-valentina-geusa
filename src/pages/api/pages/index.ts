import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const published = url.searchParams.get('published');
    
    let query = db.select().from(schema.pages);
    
    if (published === 'true') {
      query = query.where(eq(schema.pages.published, true)) as any;
    }
    
    const items = await query.orderBy(desc(schema.pages.updatedAt));

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: withCors({ 'Content-Type': 'application/json' }),
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
    await verifyAuthToken(request);
    
    const data = await request.json();
    const { slug, ...pageData } = data;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug è obbligatorio' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const [existing] = await db.select().from(schema.pages).where(eq(schema.pages.slug, slug)).limit(1);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Uno slug con questo nome esiste già' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const now = new Date();
    await db.insert(schema.pages).values({
      slug,
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
