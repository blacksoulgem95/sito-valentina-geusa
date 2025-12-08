// Utility per recuperare i link social dal database
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

export async function getSocialLinks(): Promise<SocialLinks> {
  try {
    const [links] = await db.select().from(schema.socialLinks).where(eq(schema.socialLinks.id, 'socials')).limit(1);
    
    if (!links) {
      return {};
    }

    return {
      instagram: links.instagram || undefined,
      linkedin: links.linkedin || undefined,
    };
  } catch (error) {
    console.error('Error fetching social links:', error);
    return {};
  }
}
