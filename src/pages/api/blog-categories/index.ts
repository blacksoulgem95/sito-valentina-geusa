import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export const GET: APIRoute = async () => {
  try {
    const categories = await db.select().from(schema.blogCategories).orderBy(asc(schema.blogCategories.name));

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
    await verifyAuthToken(request);
    
    const data = await request.json();
    const { slug, ...categoryData } = data;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug è obbligatorio' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    const [existing] = await db.select().from(schema.blogCategories).where(eq(schema.blogCategories.slug, slug)).limit(1);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Una categoria con questo slug esiste già' }),
        { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) }
      );
    }

    await db.insert(schema.blogCategories).values({ slug, ...categoryData });

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
