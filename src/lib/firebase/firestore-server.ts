// Server-side Firestore utilities for Astro
import { getDocs, collection, query, where, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from './config';

export interface BlogPost {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: any;
  updatedAt: any;
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface PortfolioItem {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: any;
  updatedAt: any;
  featuredImage?: string;
  type?: 'illustration' | 'ui-ux' | 'brand-identity' | 'editorial' | 'web-design';
  category?: string;
  status?: 'completed' | 'in-progress';
  featured?: boolean;
  order?: number;
  client?: string;
  year?: string;
  tags?: string[];
  link?: string;
  images?: {
    hero?: string;
    mockup?: string;
    result?: string;
    gallery?: string[];
  };
  objectives?: Array<{
    title: string;
    description: string;
    color?: 'blue' | 'purple' | 'orange' | 'indigo';
  }>;
  results?: {
    title?: string;
    paragraphs: string[];
    figmaLink?: string;
  };
  reflections?: {
    title?: string;
    content: string[];
  };
  illustration?: {
    subtitle?: string;
    styleTitle?: string;
    styleDescription?: string[];
    exampleImages?: string[];
    reflectionsTitle?: string;
    reflectionsContent?: string[];
  };
  seoTitle?: string;
  seoDescription?: string;
}

export interface Page {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: any;
  updatedAt: any;
  seoTitle?: string;
  seoDescription?: string;
}

// Get all published blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (typeof window !== 'undefined' || !db) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'blog'),
      where('published', '==', true),
      orderBy('publishedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      slug: doc.id,
      ...doc.data(),
    })) as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get a single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (typeof window !== 'undefined' || !db) {
    return null;
  }

  try {
    const docRef = doc(db, 'blog', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().published) {
      return {
        slug: docSnap.id,
        ...docSnap.data(),
      } as BlogPost;
    }
    return null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Get all published portfolio items
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  if (typeof window !== 'undefined' || !db) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'portfolio'),
      where('published', '==', true),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      slug: doc.id,
      ...doc.data(),
    })) as PortfolioItem[];
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return [];
  }
}

// Get a single portfolio item by slug
export async function getPortfolioItem(slug: string): Promise<PortfolioItem | null> {
  if (typeof window !== 'undefined' || !db) {
    return null;
  }

  try {
    const docRef = doc(db, 'portfolio', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().published) {
      return {
        slug: docSnap.id,
        ...docSnap.data(),
      } as PortfolioItem;
    }
    return null;
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    return null;
  }
}

// Get a page by slug
export async function getPage(slug: string): Promise<Page | null> {
  if (typeof window !== 'undefined' || !db) {
    return null;
  }

  try {
    const docRef = doc(db, 'pages', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().published) {
      return {
        slug: docSnap.id,
        ...docSnap.data(),
      } as Page;
    }
    return null;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}
