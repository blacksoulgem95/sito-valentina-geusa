import { api } from './api';

export interface PortfolioItem {
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: Date | null;
  updatedAt: Date;
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

class PortfolioService {
  async getAll(published?: boolean): Promise<PortfolioItem[]> {
    const query = published !== undefined ? `?published=${published}` : '';
    return api.get<PortfolioItem[]>(`/portfolio${query}`);
  }

  async getBySlug(slug: string): Promise<PortfolioItem> {
    return api.get<PortfolioItem>(`/portfolio/${slug}`);
  }

  async create(item: Omit<PortfolioItem, 'updatedAt'>): Promise<{ slug: string; message: string }> {
    return api.post<{ slug: string; message: string }>('/portfolio', item);
  }

  async update(slug: string, data: Partial<PortfolioItem>): Promise<{ slug: string; message: string }> {
    return api.put<{ slug: string; message: string }>(`/portfolio/${slug}`, data);
  }

  async delete(slug: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/portfolio/${slug}`);
  }

  async checkSlugExists(slug: string, excludeSlug?: string): Promise<boolean> {
    try {
      const item = await this.getBySlug(slug);
      return excludeSlug ? item.slug !== excludeSlug : true;
    } catch {
      return false;
    }
  }
}

export const portfolioService = new PortfolioService();
