import type { APIRoute } from 'astro';
import { adminDb } from '@/lib/firebase/admin';

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

// GET: Get social links (public endpoint, no auth required)
export const GET: APIRoute = async () => {
  try {
    const doc = await adminDb.collection('links').doc('socials').get();
    
    if (!doc.exists) {
      // Return empty object if document doesn't exist
      return new Response(
        JSON.stringify({}),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = doc.data() as SocialLinks;
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching social links:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore nel recupero dei link social' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
