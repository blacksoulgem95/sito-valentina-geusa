// Utility per recuperare i link social da Firestore
import { adminDb } from '@/lib/firebase/admin';

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

export async function getSocialLinks(): Promise<SocialLinks> {
  try {
    const doc = await adminDb.collection('links').doc('socials').get();
    
    if (!doc.exists) {
      return {};
    }

    return doc.data() as SocialLinks;
  } catch (error) {
    console.error('Error fetching social links:', error);
    return {};
  }
}
