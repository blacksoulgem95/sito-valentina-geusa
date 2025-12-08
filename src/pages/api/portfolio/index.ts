import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

// GET: List all portfolio items
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const published = url.searchParams.get('published');
    
    let query = db.select().from(schema.portfolioItems);
    
    if (published === 'true') {
      query = query.where(eq(schema.portfolioItems.published, true)) as any;
    }
    
    const items = await query.orderBy(desc(schema.portfolioItems.updatedAt));

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
    await verifyAuthToken(request);
    
    const data = await request.json();
    const { slug, ...itemData } = data;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug è obbligatorio' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if slug exists
    const [existing] = await db.select().from(schema.portfolioItems).where(eq(schema.portfolioItems.slug, slug)).limit(1);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Uno slug con questo nome esiste già' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    await db.insert(schema.portfolioItems).values({
      slug,
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
