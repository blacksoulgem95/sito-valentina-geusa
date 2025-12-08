// Server-side database utilities for Astro
import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

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

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await db
      .select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.published, true))
      .orderBy(desc(schema.blogPosts.publishedAt));
    
    return posts as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get a single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const [post] = await db
      .select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, slug))
      .limit(1);
    
    if (post && post.published) {
      return post as BlogPost;
    }
    return null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Get all published portfolio items
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const items = await db
      .select()
      .from(schema.portfolioItems)
      .where(eq(schema.portfolioItems.published, true))
      .orderBy(desc(schema.portfolioItems.updatedAt));
    
    return items as PortfolioItem[];
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return [];
  }
}

// Get a single portfolio item by slug
export async function getPortfolioItem(slug: string): Promise<PortfolioItem | null> {
  try {
    const [item] = await db
      .select()
      .from(schema.portfolioItems)
      .where(eq(schema.portfolioItems.slug, slug))
      .limit(1);
    
    if (item && item.published) {
      return item as PortfolioItem;
    }
    return null;
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    return null;
  }
}

// Get a page by slug
export async function getPage(slug: string): Promise<Page | null> {
  try {
    const [page] = await db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.slug, slug))
      .limit(1);
    
    if (page && page.published) {
      return page as Page;
    }
    return null;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}
