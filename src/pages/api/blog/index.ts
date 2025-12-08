import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const published = url.searchParams.get('published');
    
    let query = db.select().from(schema.blogPosts);
    
    if (published === 'true') {
      query = query.where(eq(schema.blogPosts.published, true)) as any;
    }
    
    const items = await query.orderBy(desc(schema.blogPosts.publishedAt));

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: withCors({ 'Content-Type': 'application/json' }),
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero dei blog posts' }),
      { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAuthToken(request);
    
    const data = await request.json();
    const { slug, ...postData } = data;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug è obbligatorio' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const [existing] = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.slug, slug)).limit(1);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Uno slug con questo nome esiste già' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const now = new Date();
    await db.insert(schema.blogPosts).values({
      slug,
      ...postData,
      updatedAt: now,
      publishedAt: postData.published ? now : null,
    });

    return new Response(
      JSON.stringify({ slug, message: 'Blog post creato con successo' }),
      { status: 201, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nella creazione del blog post' }),
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
