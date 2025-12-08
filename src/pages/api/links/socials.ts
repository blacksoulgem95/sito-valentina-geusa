import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

// GET: Get social links (public endpoint, no auth required)
export const GET: APIRoute = async () => {
  try {
    const [links] = await db.select().from(schema.socialLinks).where(eq(schema.socialLinks.id, 'socials')).limit(1);
    
    if (!links) {
      // Return empty object if record doesn't exist
      return new Response(
        JSON.stringify({}),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data: SocialLinks = {
      instagram: links.instagram || undefined,
      linkedin: links.linkedin || undefined,
    };
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching social links:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero dei link social' }),
      { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
};
