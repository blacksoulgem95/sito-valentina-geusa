import type { APIRoute } from 'astro';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { getCorsHeaders, withCors } from '@/lib/api/cors';

// PUT: Update social links
export const PUT: APIRoute = async ({ request }) => {
  try {
    await verifyAuthToken(request);
    
    const data = await request.json();
    const { instagram, linkedin } = data;

    const updateData: Record<string, string | null> = {};
    if (instagram !== undefined) updateData.instagram = instagram || null;
    if (linkedin !== undefined) updateData.linkedin = linkedin || null;

    // Check if record exists
    const [existing] = await db.select().from(schema.socialLinks).where(eq(schema.socialLinks.id, 'socials')).limit(1);
    
    if (existing) {
      await db.update(schema.socialLinks)
        .set(updateData)
        .where(eq(schema.socialLinks.id, 'socials'));
    } else {
      await db.insert(schema.socialLinks).values({
        id: 'socials',
        ...updateData,
      });
    }

    return new Response(
      JSON.stringify({ message: 'Link social aggiornati con successo' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating social links:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nell\'aggiornamento dei link social' }),
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
